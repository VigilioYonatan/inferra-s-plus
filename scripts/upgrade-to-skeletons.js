const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "..", "inferra-project", "apps", "inferra-web", "src", "features");

const updates = [
  {
    file: "account/pages/active-sessions.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "api-keys/pages/api-keys-list.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "artifacts/pages/artifacts-list.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonTable, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonTable rows={4} cols={3} />",
  },
  {
    file: "audit/pages/audit-events.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonTable, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonTable rows={5} cols={4} />",
  },
  {
    file: "benchmarks/pages/benchmark-detail.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "benchmarks/pages/benchmarks-list.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "benchmarks/pages/benchmarks.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "dashboard/pages/dashboard.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "deployments/pages/deployments-list.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "models/pages/model-versions.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "models/pages/models-list.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonTable, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonTable rows={4} cols={3} />",
  },
  {
    file: "notifications/pages/notification-settings.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "organizations/pages/invitations.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "organizations/pages/members.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "playground/pages/playground-session.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "quotas/pages/quotas.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
  {
    file: "usage/pages/usage.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonTable, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonTable rows={5} cols={4} />",
  },
  {
    file: "webhooks/pages/webhook-settings.page.tsx",
    searchImport: "Spinner,",
    replaceImport: "SkeletonCard, Spinner,",
    searchJSX: "<Spinner />",
    replaceJSX: "<SkeletonCard />",
  },
];

for (const item of updates) {
  const filePath = path.join(basePath, item.file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    continue;
  }
  let content = fs.readFileSync(filePath, "utf8");
  if (!content.includes(item.replaceImport) && content.includes(item.searchImport)) {
    content = content.replace(item.searchImport, item.replaceImport);
  }
  if (content.includes(item.searchJSX)) {
    content = content.replace(item.searchJSX, item.replaceJSX);
  }
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated ${item.file} with Skeleton`);
}
console.log("All pages updated with Skeletons successfully!");
