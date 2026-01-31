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

export function Villages() {
  const { botState, toggleModule, updateSettings, t } = useBot();
  const settings = botState.settings.Autofarm;
  const isOn = botState.modules.Autofarm;

  return (
    <div className="gb:flex gb:flex-col gb:gap-4">
      <div className="gb:flex gb:justify-between gb:items-center">
        <TypographyH2>{t("autofarm.title", "Autofarm")}</TypographyH2>
        <Button 
          variant={isOn ? "destructive" : "default"}
          onClick={() => toggleModule("Autofarm")}
        >
          {isOn ? "Stop" : "Start"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="gb:text-lg">{t("autofarm.title", "Autofarm")}</CardTitle>
        </CardHeader>
        <CardContent className="gb:grid gb:grid-cols-1 gb:gap-4">
          <div className="gb:flex gb:items-center gb:gap-2">
            <Checkbox 
              id="autostart" 
              checked={settings.autostart || false} 
              onCheckedChange={(checked) => updateSettings("Autofarm", { autostart: !!checked })}
            />
            <Label htmlFor="autostart" className="gb:cursor-pointer">{t("autofarm.autostart", "AutoStart AutoFarm")}</Label>
          </div>

          <div className="gb:flex gb:items-center gb:gap-2">
            <Checkbox 
              id="skipwhenfull" 
              checked={settings.skipwhenfull || false} 
              onCheckedChange={(checked) => updateSettings("Autofarm", { skipwhenfull: !!checked })}
            />
            <Label htmlFor="skipwhenfull" className="gb:cursor-pointer">{t("autofarm.skip_full", "Skip farm when warehouse is full")}</Label>
          </div>

          <div className="gb:flex gb:items-center gb:gap-2">
            <Checkbox 
              id="lowresfirst" 
              checked={settings.lowresfirst || false} 
              onCheckedChange={(checked) => updateSettings("Autofarm", { lowresfirst: !!checked })}
            />
            <Label htmlFor="lowresfirst" className="gb:cursor-pointer">{t("autofarm.low_res_first", "Lowest resources first")}</Label>
          </div>

          <div className="gb:flex gb:flex-col gb:gap-2">
            <Label>{t("autofarm.method_label", "Farm method")}</Label>
            <Select 
              value={String(settings.method || 300)}
              onValueChange={(value) => updateSettings("Autofarm", { method: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">{t("autofarm.method.5", "5 minute farm")}</SelectItem>
                <SelectItem value="1200">{t("autofarm.method.20", "20 minute farm")}</SelectItem>
                <SelectItem value="5400">{t("autofarm.method.90", "90 minute farm")}</SelectItem>
                <SelectItem value="14400">{t("autofarm.method.240", "240 minute farm")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <TypographyP>Gestion automatisée de vos villages de paysans.</TypographyP>
    </div>
  );
}
