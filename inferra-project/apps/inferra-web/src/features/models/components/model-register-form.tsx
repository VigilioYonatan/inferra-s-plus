import { Button, Field, Notice } from "../../../libs/ui/components";

export type ModelRegisterFormProps = {
  onSubmit: (e: Event) => void;
  busy: boolean;
  formError?: string;
};

export function ModelRegisterForm({
  onSubmit,
  busy,
  formError,
}: ModelRegisterFormProps) {
  return (
    <div>
      {formError && <Notice kind="danger">{formError}</Notice>}
      <form onSubmit={onSubmit}>
        <Field
          label="Nombre público"
          name="public_name"
          required
          placeholder="qwen-instruct"
        />
        <Field
          label="Nombre upstream"
          name="upstream_name"
          required
          placeholder="Qwen/Qwen2.5-0.5B-Instruct"
        />
        <Field
          label="Ventana de contexto"
          name="context_window"
          type="number"
          required
          placeholder="32768"
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Registrando..." : "Guardar modelo"}
        </Button>
      </form>
    </div>
  );
}
