#!/usr/bin/env python3
"""Verify that every design route has a real implementation classification."""
import json,pathlib
base=pathlib.Path(__file__).resolve().parents[2]
manifest=json.loads((base/'design/skill/blueprint/architecture-manifest.json').read_text())
front=base/'apps/inferra-web'
missing=[x['source_file'] for x in manifest['pages'] if not (front/x['source_file']).exists()]
assert not missing, f'Missing page files: {missing}'
print(f"{len(manifest['pages'])} pages mapped to actual source files; operational functionality must be checked separately.")
