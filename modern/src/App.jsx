import {DefaultLayout} from "./components/layouts/DefaultLayout";
import {ThemeProvider} from "./hooks/use-theme";
import {NavigationProvider, useNavigation} from "./hooks/use-navigation";
import {WindowProvider, useWindow} from "./hooks/use-window";
import {TypographyH1} from "@/components/custom-ui/TypographyH1";
import {items} from "@/components/custom-ui/AppSidebar";

function AppContent() {
  const { activeTab } = useNavigation();
  const { position, size, containerRef } = useWindow();

  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: size ? `${size.width}px` : undefined,
        height: size ? `${size.height}px` : undefined,
      }}
      className="gb:absolute gb:min-w-[688px] gb:min-h-[480px] gb:rounded-[14px] gb:shadow-[0_12px_35px_rgba(0,0,0,0.25)] gb:backdrop-blur-[8px] gb:resize gb:overflow-auto gb:bg-background/80 gb:border gb:border-border"
    >
      <DefaultLayout>
        <div className="gb:flex gb:flex-col gb:gap-4">
          {items[activeTab]?.pageComponent || <TypographyH1 className="gb:text-sm">Bienvenue dans GrepoBot Modern.</TypographyH1>}
        </div>
      </DefaultLayout>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <WindowProvider>
          <AppContent />
        </WindowProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;
