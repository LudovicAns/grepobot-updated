import {TypographyH2} from "@/components/custom-ui/TypographyH2";
import {TypographyP} from "@/components/custom-ui/TypographyP";
import {useBot} from "@/hooks/use-bot";
import {useEffect, useRef} from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Card} from "@/components/ui/card";

export function Console() {
  const { botState, t } = useBot();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
        const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [botState.logs]);

  return (
    <div className="gb:flex gb:flex-col gb:gap-4 gb:h-full">
      <TypographyH2>{t("console.title", "Console")}</TypographyH2>
      <TypographyP>Logs et événements en temps réel du bot.</TypographyP>
      
      <Card className="gb:flex-1 gb:overflow-hidden gb:bg-black gb:border-primary/20">
        <ScrollArea 
            ref={scrollRef}
            className="gb:h-[400px] gb:w-full gb:p-4"
        >
            <div className="gb:font-mono gb:text-[10px] gb:text-green-500">
                {botState.logs.length === 0 ? (
                    <div className="gb:opacity-50">[SYSTEM] En attente de logs...</div>
                ) : (
                    botState.logs.map((log, i) => (
                        <div key={i} className="gb:mb-1 gb:whitespace-pre-wrap">
                            <span className="gb:opacity-50">{log.timestamp}</span> - <span className="gb:font-bold">[{log.type}]</span>: {log.message}
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
