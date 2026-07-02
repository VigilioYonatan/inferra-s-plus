import type { ComponentChildren, JSX } from "preact";
import { Badge, Link } from "../../../libs/ui/components";
import { CheckIcon, ArrowRightIcon } from "../../../libs/ui/icons";

export type OnboardingStepCardProps = {
  stepNumber: number;
  title: string;
  icon: (props: { size?: number; color?: string; style?: Record<string, string | number | undefined> | string }) => JSX.Element;
  iconColor?: string;
  isCompleted: boolean;
  statusLabel?: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  accentBorderColor?: string;
};

export function OnboardingStepCard({
  stepNumber,
  title,
  icon: Icon,
  iconColor = "var(--accent)",
  isCompleted,
  statusLabel,
  description,
  actionHref,
  actionLabel,
  accentBorderColor,
}: OnboardingStepCardProps) {
  const topBorder = accentBorderColor
    ? `2px solid ${accentBorderColor}`
    : isCompleted
      ? "2px solid var(--good)"
      : "2px solid var(--accent)";

  const backgroundGradient = isCompleted
    ? "linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, transparent 100%), var(--panel)"
    : "var(--panel)";

  return (
    <div
      class="panel"
      style={{
        borderTop: topBorder,
        background: backgroundGradient,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: iconColor,
                flexShrink: 0,
              }}
            >
              <Icon size={20} color={iconColor} />
            </div>
            <strong style={{ fontSize: "15px", color: "var(--text)" }}>
              {stepNumber} · {title}
            </strong>
          </div>
          <Badge kind={isCompleted ? "success" : "neutral"}>
            {isCompleted ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <CheckIcon size={12} />
                {statusLabel || "Completado"}
              </span>
            ) : (
              statusLabel || "Pendiente"
            )}
          </Badge>
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            minHeight: "44px",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Link
          href={actionHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--accent)",
          }}
        >
          <span>{actionLabel}</span>
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </div>
  );
}
