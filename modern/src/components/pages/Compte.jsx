import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";
import {useBot} from "@/hooks/use-bot";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export function Compte() {
  const { t } = useBot();
  const account = window.GrepoBotCore?.Account || {};

  return (
    <div className="gb:flex gb:flex-col gb:gap-4">
      <TypographyH2>{t("account.title", "Account")}</TypographyH2>
      
      <Card>
        <CardHeader>
          <CardTitle className="gb:text-lg">{t("account.title", "Account Information")}</CardTitle>
        </CardHeader>
        <CardContent className="gb:grid gb:grid-cols-1 gb:gap-2">
          <div className="gb:flex gb:justify-between">
            <span className="gb:font-bold">{t("account.name", "Name:")}</span>
            <span>{account.player_name || "Inconnu"}</span>
          </div>
          <div className="gb:flex gb:justify-between">
            <span className="gb:font-bold">{t("account.world", "World:")}</span>
            <span>{account.world_id || "Inconnu"}</span>
          </div>
          <div className="gb:flex gb:justify-between">
            <span className="gb:font-bold">{t("account.language", "Language:")}</span>
            <span>{account.locale_lang || "Inconnu"}</span>
          </div>
          <div className="gb:flex gb:justify-between">
            <span className="gb:font-bold">Player ID:</span>
            <span>{account.player_id || "Inconnu"}</span>
          </div>
        </CardContent>
      </Card>

      <TypographyP>Gestion de votre compte Grepolis et des paramètres du bot.</TypographyP>
    </div>
  );
}
