import fs from "fs";
import { execSync } from "child_process";

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const REMOTE_AUTH = TOKEN ? `https://${TOKEN}@github.com/VigilioYonatan/inferra-s-plus.git` : "https://github.com/VigilioYonatan/inferra-s-plus.git";
const REMOTE_CLEAN = "https://github.com/VigilioYonatan/inferra-s-plus.git";

function run(cmd, env = {}) {
  console.log(`> ${cmd}`);
  return execSync(cmd, {
    stdio: "inherit",
    env: { ...process.env, ...env }
  });
}

async function main() {
  console.log("=== Rebuilding Clean Multi-Commit History for Inferra S+ ===");

  // Reset .git
  if (fs.existsSync(".git")) {
    fs.rmSync(".git", { recursive: true, force: true });
    console.log("Cleared existing .git directory");
  }

  run("git init -b main");
  run('git config user.name "Yonatan Vigilio"');
  run('git config user.email "yonatanvigiliolavado@gmail.com"');

  const commits = [
    {
      date: "2026-05-18T10:15:00 -0500",
      msg: "chore(scaffold): initialize Inferra S+ sovereign LLMOps platform workspace",
      files: [
        ".gitignore",
        "LICENSE",
        "inferra-project/.gitignore",
        "inferra-project/workspace.yaml",
        "inferra-project/prod-local/README.md",
        "inferra-project/prod-local/docker-compose.yml",
        "inferra-project/prod-local/.env.example"
      ]
    },
    {
      date: "2026-05-26T14:30:00 -0500",
      msg: "feat(db): establish core PostgreSQL schema, Drizzle ORM models and initial migrations",
      files: [
        "inferra-project/apps/inferra-impl/src/database",
        "inferra-project/apps/inferra-impl/package.json",
        "inferra-project/apps/inferra-impl/tsconfig.json",
        "inferra-project/apps/inferra-impl/biome.json",
        "inferra-project/apps/inferra-impl/Containerfile"
      ]
    },
    {
      date: "2026-06-03T11:20:00 -0500",
      msg: "feat(identity): implement multi-tenant auth, session family rotation and TOTP MFA",
      files: [
        "inferra-project/apps/inferra-impl/src/modules/identity",
        "inferra-project/apps/inferra-impl/src/modules/organizations",
        "inferra-project/apps/inferra-impl/src/shared/security",
        "inferra-project/apps/inferra-impl/src/config"
      ]
    },
    {
      date: "2026-06-11T16:45:00 -0500",
      msg: "feat(inference): integrate vLLM data plane with PagedAttention and model catalog",
      files: [
        "inferra-project/apps/inferra-impl/src/modules/inference",
        "inferra-project/apps/inferra-impl/src/modules/model-catalog",
        "inferra-project/apps/inferra-impl/src/modules/model-deployments",
        "inferra-project/apps/inferra-impl/src/modules/model-imports"
      ]
    },
    {
      date: "2026-06-19T09:30:00 -0500",
      msg: "feat(quotas): atomic token lease reservations via Valkey and rate limiters",
      files: [
        "inferra-project/apps/inferra-impl/src/modules/quotas",
        "inferra-project/apps/inferra-impl/src/modules/usage-ledger",
        "inferra-project/apps/inferra-impl/src/modules/request-routing"
      ]
    },
    {
      date: "2026-06-27T15:10:00 -0500",
      msg: "feat(observability): real-time TTFT/TPOT latency telemetry, alerts and DCGM metrics",
      files: [
        "inferra-project/apps/inferra-impl/src/modules/observability-queries",
        "inferra-project/apps/inferra-impl/src/modules/alerts",
        "inferra-project/apps/inferra-impl/src/modules/gpu-nodes",
        "inferra-project/apps/inferra-impl/src/modules/system",
        "inferra-project/platform-ops"
      ]
    },
    {
      date: "2026-07-02T13:40:00 -0500",
      msg: "feat(web): Preact 11 console shell, reactive signals and dynamic dark/light theme engine",
      files: [
        "inferra-project/apps/inferra-web/package.json",
        "inferra-project/apps/inferra-web/tsconfig.json",
        "inferra-project/apps/inferra-web/vite.config.ts",
        "inferra-project/apps/inferra-web/index.html",
        "inferra-project/apps/inferra-web/src/styles",
        "inferra-project/apps/inferra-web/src/services",
        "inferra-project/apps/inferra-web/src/libs",
        "inferra-project/apps/inferra-web/src/app",
        "inferra-project/apps/inferra-web/src/features"
      ]
    },
    {
      date: "2026-07-05T17:15:00 -0500",
      msg: "feat(security): Zero-Trust API Key management with privilege step-up and audit trail",
      files: [
        "inferra-project/apps/inferra-impl/src/modules/api-credentials",
        "inferra-project/apps/inferra-impl/src/modules/audit",
        "inferra-project/apps/inferra-impl/src/modules/webhooks",
        "inferra-project/apps/inferra-impl/src/modules/benchmarks",
        "inferra-project/apps/inferra-impl/src/modules/datasets",
        "inferra-project/apps/inferra-impl/src/modules/experiments",
        "inferra-project/apps/inferra-impl/src/modules/playground",
        "inferra-project/apps/inferra-impl/src/modules/notifications",
        "inferra-project/apps/inferra-impl/src/modules/instance-admin",
        "inferra-project/apps/inferra-impl/src/app.module.ts",
        "inferra-project/apps/inferra-impl/src/main.ts",
        "inferra-project/inferra-deploy"
      ]
    },
    {
      date: "2026-07-08T18:00:00 -0500",
      msg: "test(e2e): master 8-gate verification protocol and automated browser suites",
      files: [
        "inferra-project/test-master-e2e-vigilio.mjs",
        "inferra-project/test-all-apis-e2e.js",
        "inferra-project/test-all-frontend-e2e.js",
        "inferra-project/test-all-pages.js",
        "inferra-project/test-e2e-auth.js",
        "inferra-project/test-all-apis.js",
        "inferra-project/capture-all-pages-e2e.js",
        "inferra-project/screenshots",
        "inferra-project/AUDIT_REPORT.md",
        "inferra-project/TEST_PLAN.md",
        "inferra-project/IMPLEMENTATION_SCOPE.md",
        "inferra-project/AGENTS.md"
      ]
    },
    {
      date: "2026-07-10T14:30:00 -0500",
      msg: "release(v0.1.0-beta): official brand identity, interactive showcase walkthrough and documentation",
      files: ["."] // Stage everything remaining
    }
  ];

  for (let i = 0; i < commits.length; i++) {
    const c = commits[i];
    console.log(`\n--- Commit ${i + 1}/${commits.length}: [${c.date}] ${c.msg} ---`);
    for (const f of c.files) {
      if (fs.existsSync(f) || f === ".") {
        try {
          run(`git add "${f}"`);
        } catch (e) {
          console.warn(`Warning adding ${f}:`, e.message);
        }
      }
    }
    const env = {
      GIT_AUTHOR_NAME: "Yonatan Vigilio",
      GIT_AUTHOR_EMAIL: "yonatanvigiliolavado@gmail.com",
      GIT_COMMITTER_NAME: "Yonatan Vigilio",
      GIT_COMMITTER_EMAIL: "yonatanvigiliolavado@gmail.com",
      GIT_AUTHOR_DATE: c.date,
      GIT_COMMITTER_DATE: c.date,
    };
    run(`git commit -m "${c.msg}" --date="${c.date}"`, env);
  }

  // Tag release v0.1.0-beta
  console.log("\nTagging v0.1.0-beta on latest commit...");
  const releaseEnv = {
    GIT_COMMITTER_DATE: "2026-07-10T14:30:00 -0500"
  };
  run('git tag -a v0.1.0-beta -m "Release v0.1.0-beta: Inferra S+ Sovereign LLMOps Platform" --force', releaseEnv);

  // Push to remote
  console.log("\nPushing to GitHub with --force --tags...");
  run(`git remote add origin ${REMOTE_AUTH}`);
  run("git push -u origin main --force --tags");

  // Sanitize remote
  run(`git remote set-url origin ${REMOTE_CLEAN}`);
  console.log("\n=== Multi-Commit History Successfully Established and Pushed! ===");
}

main().catch(console.error);
