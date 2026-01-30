import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";

export function Home() {
  return (
    <div className="gb:flex gb:flex-col gb:gap-4">
      <TypographyH2>Accueil</TypographyH2>
      <TypographyP>Bienvenue sur GrepoBot Modern. Utilisez la barre latérale pour naviguer.</TypographyP>
    </div>
  );
}
