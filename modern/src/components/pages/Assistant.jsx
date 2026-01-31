import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";
import {useBot} from "@/hooks/use-bot";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export function Assistant() {
  const { botState, updateSettings, t } = useBot();
  
  const assistantSettings = botState.settings.Assistant;

  return (
    <div className="gb:flex gb:flex-col gb:gap-6">
      <div className="gb:flex gb:flex-col gb:gap-4">
        <TypographyH2>{t("assistant.title", "Assistant")}</TypographyH2>
        
        <Card>
          <CardHeader>
            <CardTitle className="gb:text-lg">{t("assistant.title", "Map Settings")}</CardTitle>
          </CardHeader>
          <CardContent className="gb:grid gb:grid-cols-1 gb:gap-4">
            <div className="gb:flex gb:items-center gb:gap-2">
              <Checkbox 
                id="town_names" 
                checked={assistantSettings.town_names || false} 
                onCheckedChange={(checked) => updateSettings("Assistant", { town_names: !!checked })}
              />
              <Label htmlFor="town_names" className="gb:cursor-pointer">{t("assistant.show_town_names", "Show town names on map")}</Label>
            </div>
            <div className="gb:flex gb:items-center gb:gap-2">
              <Checkbox 
                id="player_name" 
                checked={assistantSettings.player_name || false} 
                onCheckedChange={(checked) => updateSettings("Assistant", { player_name: !!checked })}
              />
              <Label htmlFor="player_name" className="gb:cursor-pointer">{t("assistant.show_player_names", "Show player names on map")}</Label>
            </div>
            <div className="gb:flex gb:items-center gb:gap-2">
              <Checkbox 
                id="alliance_name" 
                checked={assistantSettings.alliance_name || false} 
                onCheckedChange={(checked) => updateSettings("Assistant", { alliance_name: !!checked })}
              />
              <Label htmlFor="alliance_name" className="gb:cursor-pointer">{t("assistant.show_alliance_names", "Show alliance names on map")}</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <TypographyP>Configuration de l'assistant automatique (farming, recrutement, etc.).</TypographyP>
    </div>
  );
}
