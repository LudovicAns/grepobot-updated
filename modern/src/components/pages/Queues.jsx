import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";
import {useBot} from "@/hooks/use-bot";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Queues() {
  const { botState, toggleModule, updateSettings, t } = useBot();
  const autobuildSettings = botState.settings.Autobuild;
  const autobuildOn = botState.modules.Autobuild;

  return (
    <div className="gb:flex gb:flex-col gb:gap-4">
      <div className="gb:flex gb:justify-between gb:items-center">
        <TypographyH2>{t("autobuild.title", "Autobuild")}</TypographyH2>
        <Button 
          variant={autobuildOn ? "destructive" : "default"}
          onClick={() => toggleModule("Autobuild")}
        >
          {autobuildOn ? "Stop" : "Start"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="gb:text-lg">{t("autobuild.title", "Autobuild Settings")}</CardTitle>
        </CardHeader>
        <CardContent className="gb:grid gb:grid-cols-1 gb:gap-4">
          <div className="gb:flex gb:items-center gb:gap-2">
            <Checkbox 
              id="autostart-build" 
              checked={autobuildSettings.autostart || false} 
              onCheckedChange={(checked) => updateSettings("Autobuild", { autostart: !!checked })}
            />
            <Label htmlFor="autostart-build" className="gb:cursor-pointer">{t("autobuild.autostart", "AutoStart Autobuild")}</Label>
          </div>
          
          <div className="gb:flex gb:items-center gb:gap-2">
            <Checkbox 
              id="enable_building" 
              checked={autobuildSettings.enable_building || false} 
              onCheckedChange={(checked) => updateSettings("Autobuild", { enable_building: !!checked })}
            />
            <Label htmlFor="enable_building" className="gb:cursor-pointer">{t("autobuild.enable_building", "Enable building queue")}</Label>
          </div>

          <div className="gb:flex gb:items-center gb:gap-2">
            <Checkbox 
              id="instant_buy" 
              checked={autobuildSettings.instant_buy || false} 
              onCheckedChange={(checked) => updateSettings("Autobuild", { instant_buy: !!checked })}
            />
            <Label htmlFor="instant_buy" className="gb:cursor-pointer">{t("autobuild.instant_buy", "Free Instant Buy")}</Label>
          </div>

          <div className="gb:flex gb:flex-col gb:gap-2">
            <Label>{t("autobuild.check_every", "Check every")}</Label>
            <Select 
              value={String(autobuildSettings.check_every || 300)}
              onValueChange={(value) => updateSettings("Autobuild", { check_every: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="120">{t("autobuild.every.2", "2 minutes")}</SelectItem>
                <SelectItem value="300">{t("autobuild.every.5", "5 minutes")}</SelectItem>
                <SelectItem value="600">{t("autobuild.every.10", "10 minutes")}</SelectItem>
                <SelectItem value="900">{t("autobuild.every.15", "15 minutes")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <TypographyP>Visualisation des files de construction et de recrutement.</TypographyP>
    </div>
  );
}
