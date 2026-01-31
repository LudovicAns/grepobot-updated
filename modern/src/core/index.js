/**
 * Index for GrepoBot Core.
 * Imports all modules in the correct order.
 */

import "./GrepoBotCore.js";
import "./I18n.en.js";
import "./I18n.fr.js";
import "./ConsoleLog.js";
import "./DataExchanger.js";
import "./ModuleManager.js";
import "./Assistant.js";
import "./Autofarm.js";
import "./Autoculture.js";
import "./Autobuild.js";
import "./Autoattack.js";
import "./Redirect.js";

// Initialize core
if (typeof window !== "undefined") {
  // GrepoBotCore is attached to window by GrepoBotCore.js
  // ModuleManager and others are also attached to window
  
  // Wait for Grepolis objects to be ready before full init
  const pollInterval = setInterval(() => {
    if (typeof window.ITowns !== "undefined" && window.ITowns.towns && !jQuery.isEmptyObject(window.ITowns.towns)) {
      clearInterval(pollInterval);
      window.GrepoBotCore.init();
      console.log("GrepoBot Core initialized via modern index");
    }
  }, 500);
}
