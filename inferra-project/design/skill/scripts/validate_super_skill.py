#!/usr/bin/env python3
"""Valida SOLO consistencia del paquete de diseño Inferra; no ejecuta aplicación."""
from __future__ import annotations
import json, re, subprocess, sys
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
passed: list[str] = []

def ck(desc: str, ok: bool) -> None:
    (passed if ok else errors).append(desc)

skill = (ROOT / 'SKILL.md').read_text(encoding='utf-8')
readme = (ROOT / 'README.md').read_text(encoding='utf-8')
catalog = json.loads((ROOT/'references/15-catalogo-skills-del-zip.json').read_text(encoding='utf-8'))
rows = catalog['skills']
ck('SKILL.md con frontmatter y nombre', skill.startswith('---\nname: inferra-super-senior\n'))
ck('README.md existe y explica alcance', 'no repositorio de aplicación' in readme)
ck('Inventario completo 103 skills', len(rows) == 103)
ck('Skills sin duplicados', len({r['skill'] for r in rows}) == len(rows))
ck('SHA-256 auditables', all(re.fullmatch(r'[0-9a-f]{64}', r['sha256']) for r in rows))
ck('Clasificaciones completas', Counter(r['status'] for r in rows) == catalog['classification_counts'])
ck('Política Docker Compose única', ('Docker Compose' in skill or '**Docker Engine' in skill) and 'Docker Compose' in (ROOT/'references/15-catalogo-skills-del-zip.md').read_text(encoding='utf-8'))
ck('Fuentes de usuario excluyen AWS K8s y Terraform', all(any(r['skill']==s and r['status']=='EXCLUIDA_CLOUD' for r in rows) for s in ['aws-platform-foundation','node-nest-security-aws','kubernetes-eks-delivery','onprem-kubernetes-foundation','terraform-iac-delivery']))
ck('Prohibición explícita Podman', 'No Podman Compose' in (ROOT/'references/15-catalogo-skills-del-zip.md').read_text(encoding='utf-8'))
ck('17 referencias MD', len(list((ROOT/'references').glob('[0-9][0-9]-*.md'))) >= 17)
ck('Referencias, skill y catálogo legibles', all(p.is_file() and p.stat().st_size > 0 for p in [ROOT/'references/00-mapa-y-fuentes.md',ROOT/'references/15-catalogo-skills-del-zip.md',ROOT/'blueprint/architecture-manifest.json']))
ck('Blueprint scripts disponibles', (ROOT/'blueprint/scripts/validate_architecture.py').is_file())

res = subprocess.run([sys.executable, str(ROOT/'blueprint/scripts/validate_architecture.py')], text=True, capture_output=True)
ck('Blueprint endpoint-página-archivo coherente', res.returncode == 0)
if res.returncode:
    errors.extend(res.stdout.splitlines()[-16:])
    errors.extend(res.stderr.splitlines()[-16:])

manifest=json.loads((ROOT/'blueprint/architecture-manifest.json').read_text(encoding='utf-8'))
files=manifest['files']
ck('Archivos planeados con comentarios #', len(files)==1632 and all(x.get('comment','').strip() for x in files))
ck('163 endpoints',len(manifest['endpoints'])==163)
ck('71 páginas frontend',len(manifest['pages'])==71)
ck('5 repositorios + workspace',len({x['repo'] for x in files})==6)
ck('Un compose.yaml sin variaciones per-env', len([x for x in files if x['path'].endswith('compose.yaml')])==1)
ck('Sin carpetas AWS/K8s/Podman/terraform', not any(any(f'/{tok}/' in '/'+x['path']+'/' for tok in ('aws','kubernetes','helm','terraform','podman','swarm')) for x in files))

record = {
    'status': 'PASS' if not errors else 'FAIL',
    'scope': 'package-and-static-design-only',
    'checks_passed': len(passed),
    'errors': errors,
    'skills_inventory': len(rows),
    'classifications': catalog['classification_counts'],
    'planned_endpoints': len(manifest['endpoints']),
    'planned_pages': len(manifest['pages']),
    'planned_files': len(files),
    'runtime_test': 'NOT_RUN', 'oauth_test': 'NOT_RUN', 'gpu_benchmark': 'NOT_RUN', 'coverage': 'NOT_RUN', 'backup_restore': 'NOT_RUN',
}
(ROOT/'validation-report.json').write_text(json.dumps(record, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
print(json.dumps(record,ensure_ascii=False,indent=2))
sys.exit(0 if not errors else 1)
