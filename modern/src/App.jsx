import { useState, useRef, useEffect } from "react";
import {DefaultLayout} from "./components/layouts/DefaultLayout";
import {ThemeProvider} from "./hooks/use-theme";
import {TypographyH1} from "@/components/custom-ui/TypographyH1";

function AppContent() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem("grepobot-modern-position");
      return saved ? JSON.parse(saved) : { x: 100, y: 100 };
    } catch (e) {
      return { x: 100, y: 100 };
    }
  });

  const [size, setSize] = useState(() => {
    try {
      const saved = localStorage.getItem("grepobot-modern-size");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Sécurité : on ignore les tailles invalides sauvegardées (ex: 0 lors d'un montage caché)
      if (!parsed || parsed.width <= 0 || parsed.height <= 0) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const containerRef = useRef(null);

  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem("grepobot-modern-position", JSON.stringify(position));
    }
  }, [isDragging, position]);

  useEffect(() => {
    if (!size || size.width <= 0 || size.height <= 0) return;
    const timeout = setTimeout(() => {
      localStorage.setItem("grepobot-modern-size", JSON.stringify(size));
    }, 500);
    return () => clearTimeout(timeout);
  }, [size]);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // On récupère la taille du border-box si possible (plus précis avec Tailwind)
        const measuredWidth = entry.borderBoxSize?.[0]?.inlineSize ?? target.offsetWidth;
        const measuredHeight = entry.borderBoxSize?.[0]?.blockSize ?? target.offsetHeight;

        const newWidth = Math.round(measuredWidth);
        const newHeight = Math.round(measuredHeight);

        // On ignore les dimensions à 0 (qui arrivent souvent quand l'élément est caché/non-monté)
        // pour éviter d'écraser la taille sauvegardée.
        if (newWidth <= 0 || newHeight <= 0) continue;

        setSize((prev) => {
          if (prev && prev.width === newWidth && prev.height === newHeight) return prev;
          return { width: newWidth, height: newHeight };
        });
      }
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    // On ne commence le drag que si on clique sur le header (le titre h1 dans DefaultLayout)
    // Mais ici on n'a pas accès facilement au header de DefaultLayout.
    // On va garder le comportement actuel ou l'ajuster plus tard.
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: size ? `${size.width}px` : undefined,
        height: size ? `${size.height}px` : undefined,
      }}
      className="gb:absolute gb:min-w-[400px] gb:min-h-[100px] gb:rounded-[14px] gb:shadow-[0_12px_35px_rgba(0,0,0,0.25)] gb:backdrop-blur-[8px] gb:resize gb:overflow-auto gb:bg-background/80 gb:border gb:border-border"
    >
      <DefaultLayout onHeaderMouseDown={onMouseDown}>
        <div className="gb:flex gb:flex-col gb:gap-4">
          <TypographyH1 className="gb:text-sm">Bienvenue dans GrepoBot Modern.</TypographyH1>
        </div>
      </DefaultLayout>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
