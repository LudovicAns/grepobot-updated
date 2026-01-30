import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";

export function Console() {
  return (
    <div className="gb:flex gb:flex-col gb:gap-4">
      <TypographyH2>Console</TypographyH2>
      <TypographyP>Logs et événements en temps réel du bot.</TypographyP>
      <div className="gb:bg-black gb:text-green-500 gb:p-4 gb:rounded gb:font-mono gb:text-xs gb:min-h-[200px]">
        [SYSTEM] GrepoBot Modern initialisé...
      </div>
    </div>
  );
}
