import { useState, useEffect } from 'react';

export function useBot() {
  const [botState, setBotState] = useState({
    initialized: !!window.GrepoBotCore,
    modules: {
      Autofarm: typeof window.Autofarm?.checkEnabled === 'function' ? window.Autofarm.checkEnabled() : false,
      Autoculture: typeof window.Autoculture?.checkEnabled === 'function' ? window.Autoculture.checkEnabled() : false,
      Autobuild: typeof window.Autobuild?.checkEnabled === 'function' ? window.Autobuild.checkEnabled() : false,
      Autoattack: typeof window.Autoattack?.checkEnabled === 'function' ? window.Autoattack.checkEnabled() : false,
    },
    settings: {
      Autofarm: window.Autofarm?.settings || {},
      Autoculture: window.Autoculture?.settings || {},
      Autobuild: window.Autobuild?.settings || {},
      Autoattack: window.Autoattack?.settings || {},
      Assistant: window.Assistant?.settings || {},
    },
    towns: window.ModuleManager?.playerTowns || [],
    logs: window.ConsoleLog?.RawLogs || []
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setBotState({
        initialized: !!window.GrepoBotCore,
        modules: {
          Autofarm: typeof window.Autofarm?.checkEnabled === 'function' ? window.Autofarm.checkEnabled() : false,
          Autoculture: typeof window.Autoculture?.checkEnabled === 'function' ? window.Autoculture.checkEnabled() : false,
          Autobuild: typeof window.Autobuild?.checkEnabled === 'function' ? window.Autobuild.checkEnabled() : false,
          Autoattack: typeof window.Autoattack?.checkEnabled === 'function' ? window.Autoattack.checkEnabled() : false,
        },
        settings: {
          Autofarm: window.Autofarm?.settings || {},
          Autoculture: window.Autoculture?.settings || {},
          Autobuild: window.Autobuild?.settings || {},
          Autoattack: window.Autoattack?.settings || {},
          Assistant: window.Assistant?.settings || {},
        },
        towns: window.ModuleManager?.playerTowns || [],
        logs: [...(window.ConsoleLog?.RawLogs || [])]
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleModule = (moduleName) => {
    if (window.ModuleManager && window.ModuleManager.modules[moduleName]) {
        // Simuler le click sur les boutons jQuery originaux si possible ou appeler la logique
        // Pour simplifier, on va appeler directement la logique de ModuleManager
        // Note: l'original initButtons attachait un event listener qui faisait tout.
        
        const isOn = window.ModuleManager.modules[moduleName].isOn;
        let newStatus = !isOn;

        window.ModuleManager.modules[moduleName].isOn = newStatus;
        if (!newStatus) {
            if (window[moduleName] && window[moduleName].stop) window[moduleName].stop();
            window.GrepoBotCore.debugLog(moduleName + " deactivated", 0);
        } else {
            if (moduleName === 'Autoattack' && window.Autoattack) {
                window.Autoattack.start();
            }
            window.GrepoBotCore.debugLog(moduleName + " activated", 0);
        }
        
        if (moduleName !== "Autoattack") {
            window.ModuleManager.checkWhatToStart();
        }

        // Update local state immediately for better responsiveness
        setBotState(prev => ({
            ...prev,
            modules: {
                ...prev.modules,
                [moduleName]: newStatus
            }
        }));
    }
  };

  const updateSettings = (moduleName, newSettings) => {
    if (window[moduleName] && window[moduleName].settings) {
        window[moduleName].settings = { ...window[moduleName].settings, ...newSettings };
        
        // Update local state immediately for better responsiveness
        setBotState(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [moduleName]: { ...prev.settings[moduleName], ...newSettings }
            }
        }));

        window.GrepoBotCore.debugLog("Settings updated for " + moduleName, 0);
    }
  };

  return { botState, toggleModule, updateSettings, t: window.GrepoBotCore?.t.bind(window.GrepoBotCore) || ((k, f) => f || k) };
}
