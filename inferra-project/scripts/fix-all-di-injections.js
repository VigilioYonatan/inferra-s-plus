const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith(".ts") && !file.endsWith(".spec.ts") && !file.endsWith(".d.ts")) {
      results.push(full);
    }
  }
  return results;
}

const files = walk(path.resolve(__dirname, "../apps/inferra-impl/src"));
console.log(`Scanning ${files.length} TypeScript files for constructor DI issues...`);

let fixedCount = 0;
for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  // Find constructor parameters
  const ctorMatch = content.match(/constructor\s*\(([^)]*)\)/s);
  if (!ctorMatch) continue;

  const params = ctorMatch[1];
  // extract injected type names: e.g. readonly foo: SomeService
  const paramMatches = [...params.matchAll(/:\s*([A-Za-z0-9_]+)/g)];
  const injectedTypes = paramMatches.map(m => m[1]);

  for (const typeName of injectedTypes) {
    if (["string", "number", "boolean", "any", "unknown", "Response", "Request", "Client"].includes(typeName)) continue;

    // Check if imported with 'import type { ... typeName ... }'
    const regex = new RegExp(`import\\s+type\\s*\\{([^}]*\\b${typeName}\\b[^}]*)\\}\\s*from\\s*["']([^"']+)["']`, "g");
    if (regex.test(content)) {
      console.log(`Fixing import type for ${typeName} in ${path.relative(path.resolve(__dirname, ".."), file)}`);
      content = content.replace(regex, (match, inner, modulePath) => {
        return `import {${inner}} from "${modulePath}"`;
      });
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, "utf8");
    fixedCount++;
  }
}

console.log(`Fixed DI imports in ${fixedCount} files.`);
