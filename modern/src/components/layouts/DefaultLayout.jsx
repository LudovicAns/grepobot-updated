import {SidebarProvider, SidebarTrigger} from "../ui/sidebar";
import {AppSidebar} from "../custom-ui/AppSidebar";
import {useWindow} from "../../hooks/use-window";

export function DefaultLayout({ children }) {
  const { onMouseDown } = useWindow();
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="gb:flex gb:flex-col gb:flex-1 gb:h-full gb:min-h-0 gb:min-w-0">
        <header
          onMouseDown={onMouseDown}
          className="gb:flex gb:items-center gb:gap-2 gb:px-4 gb:py-2 gb:border-b gb:border-border gb:cursor-move gb:select-none gb:flex-none"
        >
          <SidebarTrigger />
        </header>
        <main className="gb:flex-1 gb:overflow-auto gb:p-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}