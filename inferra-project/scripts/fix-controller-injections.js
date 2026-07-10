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
    } else if (file.endsWith(".controller.ts")) {
      results.push(full);
    }
  }
  return results;
}

const controllers = walk(path.resolve(__dirname, "../apps/inferra-impl/src/modules"));
console.log(`Found ${controllers.length} controllers.`);

let fixedCount = 0;
for (const file of controllers) {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  // Find constructor parameters
  const ctorMatch = content.match(/constructor\s*\(([^)]*)\)/);
  if (!ctorMatch) continue;

  const params = ctorMatch[1];
  // extract injected type names: e.g. readonly foo: SomeService
  const paramMatches = [...params.matchAll(/:\s*([A-Za-z0-9_]+)/g)];
  const injectedTypes = paramMatches.map(m => m[1]);

  for (const typeName of injectedTypes) {
    // If it's a primitive like string, number, boolean, skip
    if (["string", "number", "boolean", "any", "unknown"].includes(typeName)) continue;

    // Check if imported as "import type { ... typeName ... }"
    const regex = new RegExp(`import\\s+type\\s*\\{([^}]*\\b${typeName}\\b[^}]*)\\}\\s*from`, "g");
    if (regex.test(content)) {
      console.log(`Fixing import type for ${typeName} in ${path.basename(file)}`);
      content = content.replace(new RegExp(`import\\s+type\\s*\\{([^}]*\\b${typeName}\\b[^}]*)\\}\\s*from`, "g"), (match, inner) => {
        // If there are other items, we can split them or simply convert the import to standard import
        return `import {${inner}} from`;
      });
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, "utf8");
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} controllers.`);
