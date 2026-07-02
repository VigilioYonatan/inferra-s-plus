import { Heading } from "../../../libs/ui/components";
import { BrainIcon, BuildingIcon, KeyIcon } from "../../../libs/ui/icons";
import { organizations } from "../../../services/auth/auth.state";
import { OnboardingProgressBanner } from "../components/onboarding-progress-banner";
import { OnboardingStepCard } from "../components/onboarding-step-card";

export function WelcomePage() {
  const hasOrg = organizations.value.length > 0;
  const currentOrg = organizations.value[0];

  return (
    <>
      <Heading
        title="Configura tu Infraestructura de Inferencia"
        desc="Prepara tu clúster privado en 3 sencillos pasos para servir modelos LLM y conectar tus aplicaciones."
      />

      <OnboardingProgressBanner
        hasOrg={hasOrg}
        activeOrgName={currentOrg?.name}
        completedStepsCount={hasOrg ? 1 : 0}
        totalStepsCount={3}
      />

      <div
        class="cards"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        <OnboardingStepCard
          stepNumber={1}
          title="Organización"
          icon={BuildingIcon}
          iconColor="var(--good)"
          isCompleted={hasOrg}
          statusLabel={hasOrg ? "Completado" : "Pendiente"}
          description={
            hasOrg && currentOrg
              ? `Workspace activo: ${currentOrg.name} (${currentOrg.slug}). Con aislamiento de cuotas y políticas RBAC.`
              : "Crea tu primera organización para gestionar membresías y recursos de cómputo GPU."
          }
          actionHref="/onboarding/organization"
          actionLabel={hasOrg ? "Ver organización" : "Crear organización"}
        />

        <OnboardingStepCard
          stepNumber={2}
          title="Modelo LLM"
          icon={BrainIcon}
          iconColor="#818cf8"
          isCompleted={false}
          statusLabel={hasOrg ? "Siguiente paso" : "Paso 2"}
          description="Registra tu modelo upstream (Qwen, Llama 3, DeepSeek) con pesos listos para inferencia acelerada en vLLM."
          actionHref="/onboarding/first-model"
          actionLabel="Configurar primer modelo"
          accentBorderColor={hasOrg ? "var(--accent)" : undefined}
        />

        <OnboardingStepCard
          stepNumber={3}
          title="API Key"
          icon={KeyIcon}
          iconColor="#f59e0b"
          isCompleted={false}
          statusLabel="Paso 3"
          description="Genera una clave con alcance seguro para conectar aplicaciones, SDKs de Python/TypeScript o LangChain."
          actionHref={hasOrg && currentOrg ? `/app/${currentOrg.slug}/api-keys` : "/onboarding/organization"}
          actionLabel={hasOrg && currentOrg ? "Generar credencial" : "Requiere organización"}
        />
      </div>
    </>
  );
}
