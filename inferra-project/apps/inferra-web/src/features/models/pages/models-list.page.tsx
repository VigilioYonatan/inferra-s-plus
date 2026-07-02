import { useState } from "preact/hooks";
import {
  Empty,
  Heading,
  Notice,
  Section,
  SkeletonTable,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";
import { ModelRegisterForm } from "../components/model-register-form";
import { ModelsTable, type ModelItem } from "../components/models-table";

export function ModelsListPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/models` : null;
  const { data, error, loading, reload } = useResource<ModelItem[]>(path);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: Event) {
    e.preventDefault();
    if (!path) return;
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    setBusy(true);
    setFormError("");
    try {
      await postJson(path, {
        public_name: String(fd.get("public_name")),
        upstream_name: String(fd.get("upstream_name")),
        context_window: Number(fd.get("context_window")),
      });
      (e.currentTarget as HTMLFormElement).reset();
      reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Heading
        title="Registro de modelos"
        desc="Nombres públicos, modelos upstream y ventanas de contexto. El registro no descarga ni ejecuta modelos por sí solo."
      />
      <div class="cards">
        <Section title="Modelos configurados">
          {loading ? (
            <SkeletonTable rows={4} cols={3} />
          ) : error ? (
            <Notice kind="danger">{error}</Notice>
          ) : data?.length ? (
            <ModelsTable models={data} />
          ) : (
            <Empty label="Aún no hay modelos" />
          )}
        </Section>
        <Section
          title="Registrar modelo"
          sub="El nombre upstream debe coincidir con el runtime vLLM permitido."
        >
          <ModelRegisterForm
            onSubmit={submit}
            busy={busy}
            formError={formError}
          />
        </Section>
      </div>
    </>
  );
}
