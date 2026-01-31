import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";
import {useBot} from "@/hooks/use-bot";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export function Attaques() {
  const { botState, toggleModule, updateSettings, t } = useBot();
  const settings = botState.settings.Autoattack;
  const isOn = botState.modules.Autoattack;

  return (
    <div className="gb:flex gb:flex-col gb:gap-4">
      <div className="gb:flex gb:justify-between gb:items-center">
        <TypographyH2>{t("autoattack.title", "AutoAttack")}</TypographyH2>
        <Button 
          variant={isOn ? "destructive" : "default"}
          onClick={() => toggleModule("Autoattack")}
        >
          {isOn ? "Stop" : "Start"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="gb:text-lg">{t("autoattack.title", "AutoAttack Settings")}</CardTitle>
        </CardHeader>
        <CardContent className="gb:flex gb:flex-col gb:gap-6">
          <div className="gb:flex gb:items-center gb:gap-2">
            <Checkbox 
              id="autostart-attack" 
              checked={settings.autostart || false} 
              onCheckedChange={(checked) => updateSettings("Autoattack", { autostart: !!checked })}
            />
            <Label htmlFor="autostart-attack" className="gb:cursor-pointer">Démarrage automatique des attaques planifiées</Label>
          </div>

          <div className="gb:bg-secondary/10 gb:p-8 gb:rounded-lg gb:text-center gb:border gb:border-dashed">
            <TypographyP>La gestion détaillée de la file d'attente des attaques est disponible via le planificateur du jeu (Capitaine requis).</TypographyP>
          </div>
        </CardContent>
      </Card>

      <TypographyP>Alertes et gestion des attaques entrantes.</TypographyP>
    </div>
  );
}
