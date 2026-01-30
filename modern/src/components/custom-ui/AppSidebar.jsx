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
import {Moon, Sun, Bot, House, User, Tent, Drama, ListEnd, Swords, SquareTerminal} from "lucide-react";
import {TypographyH1} from "@/components/custom-ui/TypographyH1";
import {TypographyP} from "@/components/custom-ui/TypographyP";

const items = [
  {
    label: "Home",
    icon: <House className="gb:size-4" />,
  },
  {
    label: "Compte",
    icon: <User className="gb:size-4" />
  },
  {
    label: "Villages",
    icon: <Tent className="gb:size-4" />
  },
  {
    label: "Cultures",
    icon: <Drama className="gb:size-4" />
  },
  {
    label: "Queues",
    icon: <ListEnd className="gb:size-4" />
  },
  {
    label: "Attaques",
    icon: <Swords className="gb:size-4" />
  },
  {
    label: "Assistant",
    icon: <Bot className="gb:size-4" />
  },
  {
    label: "Console",
    icon: <SquareTerminal className="gb:size-4" />
  }
]

export function AppSidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader>
        <TypographyH1 className={"gb:-mb-1"}>GrepoBot Modern</TypographyH1>
        <TypographyP className={"gb:mt-1"}>Version 0.0.1</TypographyP>
      </SidebarHeader>
      <SidebarContent>
        {items.map(({label, icon}, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton>{icon} <span>{label}</span></SidebarMenuButton>
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