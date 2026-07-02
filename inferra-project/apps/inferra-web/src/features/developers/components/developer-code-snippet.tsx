import { CopyButton, Tabs } from "../../../libs/ui/components";
import { TerminalIcon, CodeIcon } from "../../../libs/ui/icons";

export type DeveloperCodeSnippetProps = {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  snippetText: string;
};

export function DeveloperCodeSnippet({
  activeTab,
  onTabChange,
  snippetText,
}: DeveloperCodeSnippetProps) {
  const tabs = [
    {
      id: "curl",
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <TerminalIcon size={15} />
          cURL
        </span>
      ),
    },
    {
      id: "python",
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <CodeIcon size={15} />
          Python (OpenAI SDK)
        </span>
      ),
    },
    {
      id: "typescript",
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <CodeIcon size={15} />
          TypeScript / Node
        </span>
      ),
    },
  ];

  return (
    <div>
      <Tabs items={tabs} active={activeTab} onChange={onTabChange} />

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "10px",
          overflow: "hidden",
          background: "var(--surface)",
          marginTop: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 14px",
            background: "rgba(255, 255, 255, 0.02)",
            borderBottom: "1px solid var(--border)",
            fontSize: "12px",
            color: "var(--muted)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <TerminalIcon size={14} color="var(--accent)" />
            {activeTab === "curl"
              ? "cURL Shell Script"
              : activeTab === "python"
                ? "Python 3.10+ (openai>=1.0.0)"
                : "TypeScript / Node 20+ (openai)"}
          </span>
          <CopyButton text={snippetText} label="Copiar código" />
        </div>
        <pre
          style={{
            margin: 0,
            padding: "16px",
            fontSize: "13px",
            fontFamily: "var(--font-mono)",
            lineHeight: 1.6,
            overflowX: "auto",
            color: "var(--text)",
          }}
        >
          <code>{snippetText}</code>
        </pre>
      </div>
    </div>
  );
}
