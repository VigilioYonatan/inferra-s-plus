#!/usr/bin/env python3
"""Valida la SINCRONIZACIÓN ESTÁTICA del diseño, no implementación real."""
from __future__ import annotations
import csv, hashlib, json, re, sys
from pathlib import Path
from collections import Counter
BASE=Path(__file__).resolve().parents[1]
M=json.loads((BASE/'architecture-manifest.json').read_text(encoding='utf-8'))
FILES={(f['repo'],f['path']):f for f in M['files']}
endpoints=M['endpoints'];pages=M['pages'];errors=[];passed=[]

def check(label,condition):
    (passed if condition else errors).append(label)

def has(repo,path):return (repo,path) in FILES

def csvs(name):
    with (BASE/name).open(newline='',encoding='utf-8') as f:return list(csv.DictReader(f))

check('five repos (workspace aparte)', len({f['repo'] for f in M['files']}-{'workspace'})==5)
check('manifiesto sin archivos duplicados', len(FILES)==len(M['files']))
check('163 operaciones inventariadas',len(endpoints)==163)
check('71 vistas frontend inventariadas',len(pages)==71)
check('operaciones unívocas',len({(e['method'],e['path']) for e in endpoints})==len(endpoints))
check('operationId únicos',len({e['operation_id'] for e in endpoints})==len(endpoints))
check('rutas frontend únicas',len({p['route'] for p in pages})==len(pages))
check('ningún archivo sin comentario',all(f['comment'] and len(f['comment'].strip())>=12 for f in M['files']))
check('pnpm nunca en workspace root',not any(has('workspace',n) for n in ('package.json','pnpm-lock.yaml','pnpm-workspace.yaml')))
check('Cero carpeta contratos manual o AWS/K8s', not any('/contracts/' in '/'+f['path']+'/' or f['path'].startswith('contracts/') or f['path'].startswith('packages/contracts/') or any(t in f['path'] for t in ('terraform/','kubernetes/','helm/','aws/')) for f in M['files']))
compose=[f for f in M['files'] if f['path'].endswith('compose.yaml') or f['path'].endswith('docker-compose.yml')]
check('exactamente un Compose para todos los entornos',len(compose)==1 and compose[0]['repo']=='inferra-deploy' and compose[0]['path']=='compose/compose.yaml')
check('backend Pnpm hardened definido',has('inferra-impl','pnpm-workspace.yaml') and has('inferra-web','pnpm-workspace.yaml'))
check('Biome declarado en backend y frontend',has('inferra-impl','biome.json') and has('inferra-web','biome.json'))
check('BDD propio backend y Cucumber',has('inferra-impl','cucumber.js') and any(f['kind']=='bdd' for f in M['files']))
check('Playwright API y frontend',has('inferra-impl','playwright.api.config.ts') and has('inferra-web','playwright.config.ts'))
check('Threat models de OTP e inferencia',has('inferra-impl','docs/threat-models/auth-sessions.md') and has('inferra-impl','docs/threat-models/inference-data.md'))
check('sin rutas directas al runtime de datos',not any('/docker/exec' in e['path'] or '/execute-shell' in e['path'] for e in endpoints))

all_page_routes={p['route'] for p in pages}
for i,e in enumerate(endpoints):
    rid=f'{e["method"]} {e["path"]} ({e["operation_id"]})'
    refs=['controller_file','service_file','dto_file','response_dto_file','unit_test','integration_test','api_e2e']
    for ref in refs:
        if not has('inferra-impl',e.get(ref,'')):
            errors.append(f'{rid}: falta {ref} {e.get(ref,"")}')
    if e['security_e2e'] and not has('inferra-impl',e['security_e2e']): errors.append(f'{rid}: security E2E no existe en blueprint')
    for b in (e['bdd_tests'].split('; ') if e['bdd_tests'] else []):
        if not has('inferra-impl',b):errors.append(f'{rid}: BDD {b} no declarado')
    if e['page_route'] and (e['page_route'] not in all_page_routes or not has('inferra-web',e['page_file'])):
        errors.append(f'{rid}: consumidor frontend faltante {e["page_file"]}')
    if e['module'] not in {f['path'].split('/')[2] for f in M['files'] if f['repo']=='inferra-impl' and f['path'].startswith('src/modules/')}:
        errors.append(f'{rid}: módulo no declarado')
    if e['path'].startswith('/v1') and e['module']!='inference':errors.append(f'{rid}: /v1 mal enrutado')
    if e['path'].startswith('/v1') and not e['authorization'].startswith('API key'):errors.append(f'{rid}: falta auth API key')
    if e['method'] in ('POST','PUT','PATCH','DELETE') and not e['authorization']:
        errors.append(f'{rid}: mutación sin control')

for p in pages:
    rid=p['route']
    for ref in ('source_file','unit_test','browser_e2e','journey_e2e'):
        if not has('inferra-web',p[ref]):errors.append(f'Page {rid}: falta {ref} {p[ref]}')
    if p['feature']=='unmapped':errors.append(f'Page {rid}: feature unmapped')

check('matriz API csv exacta',len(csvs('02-matriz-endpoints.csv'))==len(endpoints) and [(r['method'],r['path'],r['operation_id']) for r in csvs('02-matriz-endpoints.csv')]==[(e['method'],e['path'],e['operation_id']) for e in endpoints])
check('matriz páginas csv exacta',len(csvs('03-matriz-paginas.csv'))==len(pages) and [r['route'] for r in csvs('03-matriz-paginas.csv')]==[p['route'] for p in pages])
check('fuentes no modificadas',all((BASE/path).exists() and hashlib.sha256((BASE/path).read_bytes()).hexdigest()==sha for path,sha in M['sources'].items()))

tree=(BASE/'01-arbol-de-archivos-comentado.md').read_text(encoding='utf-8')
commented=sum(bool(re.search(r'\s# .+\[(M1|M2|M3|S\+|Foundation)\s\|',line)) for line in tree.splitlines())
check('árbol documenta todos los archivos con comentario #',commented==len(M['files']))
for k,f in FILES.items():
    if f['path'].split('/')[-1]+'   # ' not in tree:
        errors.append(f'File missing from annotated tree: {k}')

# Checks are static. Running this script never changes the NOT_RUN state of real app tests.
result={'status':'PASS' if not errors else 'FAIL','scope':'static-design-only', 'checks_passed':len(passed),'issues':errors, 'manifest_counts':M['counts'],
        'modules_with_endpoints':dict(Counter(e['module'] for e in endpoints)),
        'phases':dict(Counter(e['phase'] for e in endpoints)),
        'real_app_tests':'NOT_RUN', 'coverage':'NOT_RUN', 'gpu_runtime':'NOT_RUN','restore_drill':'NOT_RUN'}
(BASE/'validation-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print('Architecture static validation:',result['status'])
print('checks passed:',len(passed),'errors:',len(errors))
print('files (planned):',len(FILES),'endpoints:',len(endpoints),'frontend pages:',len(pages))
if errors:
    print('\n'.join('ERROR: '+e for e in errors[:30]))
    sys.exit(1)
