import {SidebarProvider, SidebarTrigger} from "../ui/sidebar";
import {AppSidebar} from "../custom-ui/AppSidebar";
import {useWindow} from "../../hooks/use-window";
import {Button} from "../ui/button";
import {X} from "lucide-react";

export function DefaultLayout({ children }) {
  const { onMouseDown, closeApp } = useWindow();
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="gb:flex gb:flex-col gb:flex-1 gb:h-full gb:min-h-0 gb:min-w-0">
        <header
          onMouseDown={onMouseDown}
          className="gb:flex gb:items-center gb:justify-between gb:px-4 gb:py-2 gb:border-b gb:border-border gb:cursor-move gb:select-none gb:flex-none"
        >
          <SidebarTrigger />
          <Button
            variant="ghost"
            size="icon"
            className="gb:h-7 gb:w-7 gb:hover:bg-destructive/10 gb:hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              closeApp();
            }}
          >
            <X className="gb:size-4" />
          </Button>
        </header>
        <main className="gb:flex-1 gb:overflow-auto gb:p-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}