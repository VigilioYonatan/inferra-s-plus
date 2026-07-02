import type { JSX } from "preact";

export interface BrandLogoProps {
  variant?: "full" | "icon";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  height?: number;
  className?: string;
  style?: Record<string, string | number | undefined> | string;
  theme?: "dark" | "light" | "auto";
  alt?: string;
}

const SIZE_MAP: Record<string, number> = {
  xs: 18,
  sm: 24,
  md: 32,
  lg: 38,
  xl: 48,
};

export function BrandLogo({
  variant = "full",
  size = "md",
  height,
  className = "",
  style = {},
  theme = "auto",
  alt = "INFERЯA S+",
}: BrandLogoProps) {
  const h = height || SIZE_MAP[size] || 32;

  const styleObj =
    typeof style === "object" && style !== null
      ? { ...style }
      : {};

  if (theme === "dark") {
    const src =
      variant === "full" ? "/brand/logo-dark.png" : "/brand/logo-icon-dark.png";
    return (
      <img
        src={src}
        alt={alt}
        height={h}
        className={`brand-logo brand-logo-dark ${className}`}
        style={{
          height: `${h}px`,
          width: "auto",
          display: "inline-block",
          verticalAlign: "middle",
          ...styleObj,
        }}
        loading="eager"
      />
    );
  }

  if (theme === "light") {
    const src =
      variant === "full" ? "/brand/logo-light.png" : "/brand/logo-icon-light.png";
    return (
      <img
        src={src}
        alt={alt}
        height={h}
        className={`brand-logo brand-logo-light ${className}`}
        style={{
          height: `${h}px`,
          width: "auto",
          display: "inline-block",
          verticalAlign: "middle",
          ...styleObj,
        }}
        loading="eager"
      />
    );
  }

  // Auto theme (responsive via CSS classes)
  const darkSrc =
    variant === "full" ? "/brand/logo-dark.png" : "/brand/logo-icon-dark.png";
  const lightSrc =
    variant === "full" ? "/brand/logo-light.png" : "/brand/logo-icon-light.png";

  return (
    <span
      className={`brand-logo-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        verticalAlign: "middle",
        lineHeight: 1,
        ...styleObj,
      }}
    >
      <img
        src={darkSrc}
        alt={alt}
        height={h}
        className="brand-logo-img brand-logo-dark"
        style={{
          height: `${h}px`,
          width: "auto",
          objectFit: "contain",
        }}
        loading="eager"
      />
      <img
        src={lightSrc}
        alt={alt}
        height={h}
        className="brand-logo-img brand-logo-light"
        style={{
          height: `${h}px`,
          width: "auto",
          objectFit: "contain",
        }}
        loading="eager"
      />
    </span>
  );
}
