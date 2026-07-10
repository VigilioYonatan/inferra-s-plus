const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Admin/Desktop/VIGILIO/proyectos/inferra-s-plus-upgraded/inferra-project/apps/inferra-web/src/features';
const files = [
  'account/pages/verify-email.page.tsx',
  'api-keys/pages/create-api-key.page.tsx',
  'auth/pages/auth-error.page.tsx',
  'benchmarks/pages/create-benchmark.page.tsx',
  'common/forbidden.page.tsx',
  'datasets/pages/dataset-edit.page.tsx',
  'models/pages/register-model.page.tsx',
  'organizations/pages/new-organization.page.tsx',
  'organizations/pages/roles-matrix.page.tsx',
  'routing/pages/routing-policy-edit.page.tsx',
  'usage/pages/usage.page.tsx',
  'webhooks/pages/webhook-detail.page.tsx'
];

for (const rel of files) {
  const f = path.join(baseDir, rel);
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');

  // Ensure Link is imported from components
  const depth = rel.split('/').length;
  const dots = depth === 2 ? '../../' : '../../../';
  const compImport = `import { Link } from "${dots}libs/ui/components";\n`;

  if (!c.includes('Link') || !c.includes('components')) {
    c = compImport + c;
  } else {
    // If it imports from components, ensure Link is in the brackets
    c = c.replace(/import\s*\{([^}]*)\}\s*from\s*"([^"]*libs\/ui\/components)";/s, (match, names, fromPath) => {
      const list = names.split(',').map(s => s.trim()).filter(Boolean);
      if (!list.includes('Link')) {
        list.unshift('Link');
      }
      return `import {\n  ${list.join(',\n  ')}\n} from "${fromPath}";`;
    });
  }

  fs.writeFileSync(f, c);
}

// Fix first-model.page.tsx
const fmFile = path.join(baseDir, 'onboarding/pages/first-model.page.tsx');
let fm = fs.readFileSync(fmFile, 'utf8');
fm = fm.replace(
  /const org = activeOrg\.value \|\| organizations\.value\[0\];/,
  'const org = activeOrg.value || organizations.value[0];'
);
fm = fm.replace(
  /const preset = presetModels\.find\([^)]*\)[^;]*;/,
  'const preset = presetModels.find((p) => p.name === selected) ?? presetModels[0];'
);
fm = fm.replace(
  /const \[selected, setSelected\] = useState\([^)]*\);/,
  'const [selected, setSelected] = useState(presetModels[0]?.name ?? "");'
);
fs.writeFileSync(fmFile, fm);

console.log('Fixed Link imports and first-model.');
