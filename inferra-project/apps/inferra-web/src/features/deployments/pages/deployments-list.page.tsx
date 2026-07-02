import { useState } from "preact/hooks";
import {
  Button,
  Empty,
  Heading,
  Notice,
  Section,
  SkeletonCard,
} from "../../../libs/ui/components";
import { activeOrg } from "../../../services/auth/auth.state";
import { postJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";

type Deployment = {
  id: string;
  model_id: string;
  runtime_profile: string;
  status: string;
};
export function DeploymentsListPage() {
  const org = activeOrg.value;
  const path = org ? `/api/v1/organizations/${org.id}/deployments` : null;
  const { data, error, loading, reload } = useResource<Deployment[]>(path);
  const models = useResource<{ id: string; public_name: string }[]>(
    org ? `/api/v1/organizations/${org.id}/models` : null,
  );
  const [message, setMessage] = useState("");
  async function add(e: Event) {
    e.preventDefault();
    if (!path) return;
    const f = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await postJson(path, {
        model_id: String(f.get("model_id")),
        runtime_profile: String(f.get("runtime_profile")),
      });
      reload();
      setMessage(
        "Perfil registrado. Activación física del runtime requiere un operador del host.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    }
  }
  return (
    <>
      <Heading
        title="Model Deployments"
        desc="Configuración declarativa de perfiles. La API no ejecuta Docker ni administra el host."
      />
      {message && <Notice>{message}</Notice>}
      <div class="cards">
        <Section title="Configuraciones registradas">
          {loading ? (
            <SkeletonCard />
          ) : error ? (
            <Notice kind="danger">{error}</Notice>
          ) : data?.length ? (
            <ul class="row-list">
              {data.map((d) => (
                <li key={d.id}>
                  <span>{d.runtime_profile}</span>
                  <span class="pill">{d.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty label="Sin configuraciones de despliegue" />
          )}
        </Section>
        <Section title="Nuevo perfil">
          <form onSubmit={add}>
            <label class="field">
              <span>Modelo</span>
              <select required name="model_id">
                {models.data?.map((m) => (
                  <option value={m.id}>{m.public_name}</option>
                ))}
              </select>
            </label>
            <label class="field">
              <span>Perfil permitido</span>
              <select name="runtime_profile">
                <option value="gpu-small">GPU small</option>
                <option value="gpu-medium">GPU medium</option>
                <option value="gpu-large">GPU large</option>
              </select>
            </label>
            <Button type="submit">Guardar configuración</Button>
          </form>
          <Notice>
            El aprovisionamiento dinámico seguro con agente host está pendiente.
            No hay botones que ejecuten comandos arbitrarios.
          </Notice>
        </Section>
      </div>
    </>
  );
}
