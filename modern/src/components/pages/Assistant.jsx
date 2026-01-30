import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";

export function Assistant() {
  return (
    <div className="gb:flex gb:flex-col gb:gap-4">
      <TypographyH2>Assistant</TypographyH2>
      <TypographyP>Configuration de l'assistant automatique (farming, recrutement, etc.).</TypographyP>
    </div>
  );
}
