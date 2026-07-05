#!/usr/bin/env python3
"""Static, dependency-free consistency checks. Not a runtime certification."""
import pathlib, re, sys
root=pathlib.Path(__file__).resolve().parents[2]
backend=root/'apps/inferra-impl'
frontend=root/'apps/inferra-web'
compose=root/'inferra-deploy/compose/compose.yaml'
required=[backend/'src/main.ts',backend/'src/app.module.ts',frontend/'src/main.tsx',frontend/'src/app/route-registry.tsx',compose,root/'AGENTS.md',root/'IMPLEMENTATION_SCOPE.md',root/'AUDIT_REPORT.md']
errors=[f'missing: {p.relative_to(root)}' for p in required if not p.is_file()]
if compose.is_file():
 c=compose.read_text()
 for disallowed in ['amazonaws.com','eks.amazonaws','kubectl','terraform','helm install']:
  if disallowed in c.lower(): errors.append(f'disallowed deployment term: {disallowed}')
registry=frontend/'src/app/route-registry.tsx'
if registry.is_file():
 s=registry.read_text()
 routes=re.findall(r'\{pattern:"([^"]+)"',s)
 if len(routes)!=len(set(routes)):errors.append('duplicate frontend routes')
 if len(routes)<70:errors.append(f'frontend route count unexpected: {len(routes)}')
for q in [backend/'tests',frontend/'tests']:
 if not list(q.rglob('*.spec.ts')): errors.append(f'no test specs: {q}')
print(f'Archive static preflight: {"FAIL" if errors else "PASS"}; {len(required)} critical paths; {len(routes) if registry.is_file() else 0} UI routes')
for error in errors:print(' -',error)
sys.exit(bool(errors))
