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
import { requestJson } from "../../../services/http/api-client";
import { useResource } from "../../../services/http/use-resource";
import { currentRecordId } from "../../common/resource-pages";

type Message = { role: "user" | "assistant"; content: string };
type Session = { id: string; title: string; messages: Message[] };
export function PlaygroundSessionPage() {
  const org = activeOrg.value;
  const id = currentRecordId();
  const url = org
    ? `/api/v1/organizations/${org.id}/playground/sessions/${id}`
    : null;
  const session = useResource<Session>(url);
  const [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  async function append(e: Event) {
    e.preventDefault();
    if (!url || !session.data) return;
    const f = new FormData(e.currentTarget as HTMLFormElement);
    const message = String(f.get("content") || "").trim();
    if (!message) return;
    setBusy(true);
    try {
      await requestJson(url, {
        method: "PATCH",
        body: JSON.stringify({
          messages: [
            ...session.data.messages,
            { role: "user", content: message },
          ],
        }),
      });
      session.reload();
      setSuccess("Mensaje guardado; no se ha enviado a inferencia.");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Sesión guardada"
        desc="Historial privado opt-in; no se guardan prompts automáticamente."
      />
      <Section title={session.data?.title ?? "Sesión"}>
        {session.loading ? (
          <SkeletonCard />
        ) : session.error ? (
          <Notice kind="danger">{session.error}</Notice>
        ) : session.data?.messages.length ? (
          <div class="chat-log">
            {session.data.messages.map((m, i) => (
              <div class={`chat-bubble ${m.role}`} key={i}>
                <span>{m.role}</span>
                <p>{m.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty label="Aún no guardaste mensajes" />
        )}
      </Section>
      <Section title="Anotación privada">
        {error && <Notice kind="danger">{error}</Notice>}
        {success && <Notice kind="success">{success}</Notice>}
        <form onSubmit={append}>
          <label class="field">
            Mensaje
            <textarea name="content" required maxLength={65536} />
          </label>
          <Button disabled={busy} type="submit">
            Guardar anotación
          </Button>
        </form>
      </Section>
    </>
  );
}
