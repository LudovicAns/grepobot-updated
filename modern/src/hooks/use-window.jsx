import { createContext, useContext, useState, useRef, useEffect } from "react";

const WindowContext = createContext(null);

export function WindowProvider({ children }) {
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
  const dragOffset = useRef({ x: 0, y: 0 });

  // Sauvegarde de la position
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem("grepobot-modern-position", JSON.stringify(position));
    }
  }, [isDragging, position]);

  // Sauvegarde de la taille avec debounce
  useEffect(() => {
    if (!size || size.width <= 0 || size.height <= 0) return;
    const timeout = setTimeout(() => {
      localStorage.setItem("grepobot-modern-size", JSON.stringify(size));
    }, 500);
    return () => clearTimeout(timeout);
  }, [size]);

  // Observation du redimensionnement
  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // On récupère la taille du border-box si possible
        const measuredWidth = entry.borderBoxSize?.[0]?.inlineSize ?? target.offsetWidth;
        const measuredHeight = entry.borderBoxSize?.[0]?.blockSize ?? target.offsetHeight;

        const newWidth = Math.round(measuredWidth);
        const newHeight = Math.round(measuredHeight);

        // On ignore les dimensions à 0
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

  const onMouseDown = (e) => {
    // On ne commence le drag que si c'est un clic gauche
    if (e.button !== 0) return;
    
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
    <WindowContext.Provider value={{ 
      position, 
      size, 
      onMouseDown, 
      containerRef,
      isDragging 
    }}>
      {children}
    </WindowContext.Provider>
  );
}

export const useWindow = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error("useWindow must be used within a WindowProvider");
  }
  return context;
};
