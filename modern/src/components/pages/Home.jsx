import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";
import {useBot} from "@/hooks/use-bot";
import {Bot, Activity, CheckCircle2, XCircle} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export function Home() {
  const { botState, t } = useBot();
  const modules = [
    { name: "Autofarm", label: t("menu.farm", "Farm"), icon: <Activity className="gb:size-5" /> },
    { name: "Autoculture", label: t("menu.culture", "Culture"), icon: <Activity className="gb:size-5" /> },
    { name: "Autobuild", label: t("menu.build", "Build"), icon: <Activity className="gb:size-5" /> },
    { name: "Autoattack", label: t("menu.attack", "Attack"), icon: <Activity className="gb:size-5" /> },
  ];

  return (
    <div className="gb:flex gb:flex-col gb:gap-6">
      <div className="gb:flex gb:items-center gb:gap-4">
        <div className="gb:p-3 gb:bg-primary/10 gb:rounded-full">
            <Bot className="gb:size-8 gb:text-primary" />
        </div>
        <div>
            <TypographyH2>GrepoBot Modern</TypographyH2>
            <TypographyP className="gb:text-muted-foreground">État global du système</TypographyP>
        </div>
      </div>

      <div className="gb:grid gb:grid-cols-2 gb:gap-4">
        {modules.map((m) => (
            <Card key={m.name} className="gb:overflow-hidden">
                <CardContent className="gb:p-4 gb:flex gb:flex-col gb:gap-2">
                    <div className="gb:flex gb:justify-between gb:items-start">
                        <span className="gb:p-2 gb:bg-secondary gb:rounded-lg">{m.icon}</span>
                        {botState.modules[m.name] ? (
                            <CheckCircle2 className="gb:size-5 gb:text-green-500" />
                        ) : (
                            <XCircle className="gb:size-5 gb:text-destructive gb:opacity-50" />
                        )}
                    </div>
                    <div>
                        <div className="gb:font-bold">{m.label}</div>
                        <div className="gb:text-xs gb:text-muted-foreground">
                            {botState.modules[m.name] ? "En cours d'exécution" : "Arrêté"}
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card className="gb:bg-primary/5 gb:border-primary/10">
        <CardContent className="gb:p-4">
            <TypographyP className="gb:text-sm">
                Toutes les modifications apportées ici sont synchronisées avec le bot original. 
                Le bot modern se concentre sur une interface réactive et moderne tout en utilisant la logique métier éprouvée.
            </TypographyP>
        </CardContent>
      </Card>
    </div>
  );
}
