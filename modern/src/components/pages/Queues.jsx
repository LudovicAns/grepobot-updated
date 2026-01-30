import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";

export function Queues() {
  return (
    <div className="gb:flex gb:flex-col gb:gap-4">
      <TypographyH2>Files d'attente</TypographyH2>
      <TypographyP>Visualisation des files de construction et de recrutement.</TypographyP>
    </div>
  );
}
