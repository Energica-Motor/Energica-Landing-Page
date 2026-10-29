import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { configureHref } from "@/lib/model-links";

/** Closing action row at the end of a model page. */
export default function ModelClosingActions({ modelId, modelName }: { modelId: string; modelName: string }) {
  return (
    <section aria-label={`Next steps for the ${modelName}`} className="bg-[#0a0a0a] border-t border-white/[0.04]">
      <Container className="ds-section">
        <div className="flex flex-col sm:flex-row gap-3">
          <PrimaryButton href={configureHref(modelId)}>Configure this {modelName}</PrimaryButton>
          <SecondaryButton href="/dealers">Find a dealer</SecondaryButton>
        </div>
      </Container>
    </section>
  );
}
