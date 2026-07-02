import { Badge } from "../../../libs/ui/components";
import { RocketIcon } from "../../../libs/ui/icons";

export type OnboardingProgressBannerProps = {
  hasOrg: boolean;
  activeOrgName?: string;
  completedStepsCount: number;
  totalStepsCount: number;
};

export function OnboardingProgressBanner({
  hasOrg,
  activeOrgName,
  completedStepsCount,
  totalStepsCount,
}: OnboardingProgressBannerProps) {
  const percentage = Math.round((completedStepsCount / totalStepsCount) * 100);

  return (
    <div
      style={{
        background: "linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.06) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.25)",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 0 16px rgba(99, 102, 241, 0.35)",
            flexShrink: 0,
          }}
        >
          <RocketIcon size={20} color="#ffffff" />
        </div>
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--text)",
            }}
          >
            {hasOrg
              ? "Paso 2 en progreso: Registra y valida tu modelo"
              : "Comienza creando tu primera organización"}
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
            {hasOrg && activeOrgName
              ? `Workspace activo: ${activeOrgName}`
              : "Aprovisionamiento de tenancy y aislamiento de recursos"}
          </div>
        </div>
      </div>
      <Badge kind={hasOrg ? "success" : "neutral"}>
        {`${completedStepsCount} de ${totalStepsCount} Completados (${percentage}%)`}
      </Badge>
    </div>
  );
}
