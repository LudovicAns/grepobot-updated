import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";
import {useBot} from "@/hooks/use-bot";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Cultures() {
  const { botState, toggleModule, updateSettings, t } = useBot();
  const settings = botState.settings.Autoculture;
  const isOn = botState.modules.Autoculture;
  const towns = botState.towns;

  const updateTownSetting = (townId, type, value) => {
    const newTownSettings = { ...settings.towns };
    if (!newTownSettings[townId]) newTownSettings[townId] = {};
    newTownSettings[townId][type] = value;
    updateSettings("Autoculture", { towns: newTownSettings });
  };

  return (
    <div className="gb:flex gb:flex-col gb:gap-4">
      <div className="gb:flex gb:justify-between gb:items-center">
        <TypographyH2>{t("autoculture.title", "AutoCulture")}</TypographyH2>
        <Button 
          variant={isOn ? "destructive" : "default"}
          onClick={() => toggleModule("Autoculture")}
        >
          {isOn ? "Stop" : "Start"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="gb:text-lg">{t("autoculture.title", "AutoCulture")}</CardTitle>
        </CardHeader>
        <CardContent className="gb:flex gb:flex-col gb:gap-4">
          <div className="gb:flex gb:items-center gb:gap-2">
            <Checkbox 
              id="autostart-culture" 
              checked={settings.autostart || false} 
              onCheckedChange={(checked) => updateSettings("Autoculture", { autostart: !!checked })}
            />
            <Label htmlFor="autostart-culture" className="gb:cursor-pointer">{t("autoculture.autostart", "AutoStart AutoCulture")}</Label>
          </div>

          <div className="gb:rounded-md gb:border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Town</TableHead>
                  <TableHead className="gb:text-center">Party</TableHead>
                  <TableHead className="gb:text-center">Triumph</TableHead>
                  <TableHead className="gb:text-center">Theater</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {towns.map((town) => (
                  <TableRow key={town.id}>
                    <TableCell className="gb:font-medium">{town.name}</TableCell>
                    <TableCell className="gb:text-center">
                      <Checkbox 
                        checked={settings.towns?.[town.id]?.party || false} 
                        onCheckedChange={(checked) => updateTownSetting(town.id, "party", !!checked)}
                      />
                    </TableCell>
                    <TableCell className="gb:text-center">
                      <Checkbox 
                        checked={settings.towns?.[town.id]?.triumph || false} 
                        onCheckedChange={(checked) => updateTownSetting(town.id, "triumph", !!checked)}
                      />
                    </TableCell>
                    <TableCell className="gb:text-center">
                      <Checkbox 
                        checked={settings.towns?.[town.id]?.theater || false} 
                        onCheckedChange={(checked) => updateTownSetting(town.id, "theater", !!checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TypographyP>Gestion automatisée de la culture de vos villes.</TypographyP>
    </div>
  );
}
