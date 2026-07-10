import { render } from "preact";
import { describe, expect, it } from "vitest";

import {
  Badge,
  Button,
  Empty,
  Heading,
  Modal,
  Notice,
  Section,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonText,
  SkipLink,
  Spinner,
} from "../../src/libs/ui/components";

if (typeof globalThis.requestAnimationFrame === "undefined") {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(cb, 0)) as unknown as typeof requestAnimationFrame;
}
if (typeof globalThis.cancelAnimationFrame === "undefined") {
  globalThis.cancelAnimationFrame = ((id: number) =>
    clearTimeout(id)) as unknown as typeof cancelAnimationFrame;
}

describe("UI Components", () => {
  it("renders Button with different kinds and states", () => {
    const btn = Button({ children: "Guardar", kind: "primary", size: "md" });
    expect(btn.props.class).toContain("btn-primary");

    const loadingBtn = Button({ children: "Guardar", loading: true });
    expect(loadingBtn.props.disabled).toBe(true);
    expect(loadingBtn.props.class).toContain("is-loading");

    const dangerBtn = Button({ children: "Eliminar", kind: "danger" });
    expect(dangerBtn.props.class).toContain("btn-danger");
  });

  it("renders Badge variants correctly", () => {
    const successBadge = Badge({ kind: "success", children: "Active" });
    expect(successBadge.props.class).toContain("badge-success");

    const dangerBadge = Badge({ kind: "danger", children: "Failed" });
    expect(dangerBadge.props.class).toContain("badge-danger");

    const neutralBadge = Badge({ children: "Default" });
    expect(neutralBadge.props.class).toContain("badge-neutral");
  });

  it("renders Notice with accessible role", () => {
    const dangerNotice = Notice({ kind: "danger", children: "Alerta crítica" });
    expect(dangerNotice.props.role).toBe("alert");

    const infoNotice = Notice({ kind: "info", children: "Información" });
    expect(infoNotice.props.role).toBe("status");
  });

  it("renders Skeletons with proper classes and attributes", () => {
    const skeleton = Skeleton({ width: 120, height: 24, rounded: true });
    expect(skeleton.props.class).toContain("skeleton");
    expect(skeleton.props["aria-hidden"]).toBe("true");
    expect(skeleton.props.style.width).toBe("120px");
    expect(skeleton.props.style.height).toBe("24px");
    expect(skeleton.props.style.borderRadius).toBe("9999px");

    const textGroup = SkeletonText({ lines: 4 });
    expect(textGroup.props.class).toBe("skeleton-text-group");
    expect(textGroup.props.children).toHaveLength(4);

    const card = SkeletonCard();
    expect(card.props.class).toContain("skeleton-card");

    const table = SkeletonTable({ rows: 3, cols: 2 });
    expect(table.props.class).toContain("skeleton-table");
  });

  it("renders Empty state with label and description", () => {
    const empty = Empty({
      label: "Sin registros",
      description: "Cree uno para comenzar",
    });
    expect(empty.props.role).toBe("status");
  });

  it("renders Heading and Section with titles", () => {
    const heading = Heading({ title: "Modelos", desc: "Listado de LLMs" });
    expect(heading.props.class).toBe("page-heading");

    const section = Section({ title: "Parámetros", children: "Contenido" });
    expect(section.props.class).toBe("panel");
  });

  it("renders SkipLink with accessible attributes", () => {
    const skip = SkipLink({ targetId: "main-content" });
    expect(skip.props.href).toBe("#main-content");
    expect(skip.props.class).toContain("skip-link");
  });

  it("Modal renders correctly using Preact VNode render", () => {
    const container = document.createElement("div");
    render(
      <Modal open={false} title="Confirmar" onClose={() => {}}>
        Contenido cerrado
      </Modal>,
      container,
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    render(
      <Modal open={true} title="Confirmar acción" onClose={() => {}}>
        Texto del diálogo abierto
      </Modal>,
      container,
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.textContent).toContain("Confirmar acción");
    expect(container.textContent).toContain("Texto del diálogo abierto");
    render(null, container);
  });

  it("Spinner renders with role status and accessible label", () => {
    const spin = Spinner({ label: "Procesando…" });
    expect(spin.props.role).toBe("status");
    expect(spin.props["aria-label"]).toBe("Procesando…");
  });
});
