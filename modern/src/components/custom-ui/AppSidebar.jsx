import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader
} from "../ui/sidebar";
import {useTheme} from "../../hooks/use-theme";
import {useNavigation} from "../../hooks/use-navigation";
import {useWindow} from "../../hooks/use-window";
import {Moon, Sun, Bot, House, User, Tent, Drama, ListEnd, Swords, SquareTerminal} from "lucide-react";
import {TypographyH1} from "@/components/custom-ui/TypographyH1";
import {TypographyP} from "@/components/custom-ui/TypographyP";
import {Home} from "@/components/pages/Home";
import {Compte} from "@/components/pages/Compte";
import {Villages} from "@/components/pages/Villages";
import {Cultures} from "@/components/pages/Cultures";
import {Queues} from "@/components/pages/Queues";
import {Attaques} from "@/components/pages/Attaques";
import {Assistant} from "@/components/pages/Assistant";
import {Console} from "@/components/pages/Console";
import {TypographyH4} from "@/components/custom-ui/TypographyH4";
import {TypographyH2} from "@/components/custom-ui/TypographyH2";

export const items = [
  {
    label: "Home",
    icon: <House className="gb:size-4" />,
    pageComponent: <Home />
  },
  {
    label: "Compte",
    icon: <User className="gb:size-4" />,
    pageComponent: <Compte />
  },
  {
    label: "Villages",
    icon: <Tent className="gb:size-4" />,
    pageComponent: <Villages />
  },
  {
    label: "Cultures",
    icon: <Drama className="gb:size-4" />,
    pageComponent: <Cultures />
  },
  {
    label: "Queues",
    icon: <ListEnd className="gb:size-4" />,
    pageComponent: <Queues />
  },
  {
    label: "Attaques",
    icon: <Swords className="gb:size-4" />,
    pageComponent: <Attaques />
  },
  {
    label: "Assistant",
    icon: <Bot className="gb:size-4" />,
    pageComponent: <Assistant />
  },
  {
    label: "Console",
    icon: <SquareTerminal className="gb:size-4" />,
    pageComponent: <Console />
  }
]

export function AppSidebar() {
  const { theme, toggleTheme } = useTheme();
  const { activeTab, setActiveTab } = useNavigation();
  const { onMouseDown } = useWindow();

  return (
    <Sidebar>
      <SidebarHeader onMouseDown={onMouseDown} className="gb:cursor-move gb:select-none">
        <TypographyH2 className={"gb:-mb-1"}>GrepoBot Modern</TypographyH2>
        Version 0.0.1
      </SidebarHeader>
      <SidebarContent>
        {items.map(({label, icon}, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton 
              onClick={() => setActiveTab(index)}
              isActive={activeTab === index}
            >
              {icon} <span>{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleTheme}>
              {theme === "light" ? <Moon className="gb:size-4" /> : <Sun className="gb:size-4" />}
              <span>{theme === "light" ? "Mode Sombre" : "Mode Clair"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}