/**
 * Core module for GrepoBot Modern.
 * Ported from GrepoBotCore.js but stripped of jQuery UI logic.
 */

window.GrepoBotCore = {
  title: "GrepoBot Modern",
  version: "1.0.0",
  isLogged: false,
  Account: {
    player_id: typeof Game !== 'undefined' ? Game.player_id : null,
    player_name: typeof Game !== 'undefined' ? Game.player_name : null,
    world_id: typeof Game !== 'undefined' ? Game.world_id : null,
    locale_lang: typeof Game !== 'undefined' ? Game.locale_lang : null,
    premium_grepolis: typeof Game !== 'undefined' ? Game.premium_user : false,
    csrfToken: typeof Game !== 'undefined' ? Game.csrfToken : null,
  },
  locales: {},
  currentLocale: null,
  
  getLocaleKey: function () {
    var raw =
      (typeof Game !== 'undefined' && Game.locale_lang) ||
      (typeof Game !== 'undefined' && Game.locale) ||
      (navigator && (navigator.language || navigator.userLanguage)) ||
      "en";
    var normalized = String(raw).toLowerCase();
    if (normalized.indexOf("_") !== -1) {
      normalized = normalized.split("_")[0];
    }
    if (normalized.indexOf("-") !== -1) {
      normalized = normalized.split("-")[0];
    }
    return normalized || "en";
  },
  
  initI18n: function () {
    this.currentLocale = this.getLocaleKey();
  },
  
  t: function (key, fallback) {
    var locale = this.currentLocale || this.getLocaleKey();
    var locales = this.locales || {};
    var value =
      locales[locale] &&
      Object.prototype.hasOwnProperty.call(locales[locale], key)
        ? locales[locale][key]
        : undefined;
    if (value === undefined && locales.en) {
      value = locales.en[key];
    }
    if (value === undefined) {
      return fallback !== undefined ? fallback : key;
    }
    return value;
  },
  
  format: function (template, tokens) {
    if (!template) {
      return "";
    }
    return template.replace(/\{(\w+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(tokens, key)
        ? tokens[key]
        : match;
    });
  },
  
  tFormat: function (key, tokens, fallback) {
    return this.format(
      this.t(key, fallback),
      tokens || {},
    );
  },
  
  debugLog: function (message, type) {
    var resolvedType =
      typeof type === "number" && !isNaN(type) ? type : 0;
    var text = "";
    if (message !== undefined && message !== null) {
      if (typeof message === "string") {
        text = message;
      } else {
        try {
          text = JSON.stringify(message);
        } catch (err) {
          text = String(message);
        }
      }
    }
    if (typeof window.ConsoleLog !== "undefined" && window.ConsoleLog.Log) {
      window.ConsoleLog.Log(text, resolvedType);
    } else {
      console.log("[GrepoBot Modern]", text);
    }
  },
  
  init: function () {
    console.log("Initializing GrepoBot Modern Core");
    this.initI18n();
    this.initAjax();
    this.initMapTownFeature();
    this.fixMessage();
    
    // Initialize all modules
    if (window.ModuleManager) window.ModuleManager.init();
    if (window.Autofarm) window.Autofarm.init();
    if (window.Autoculture) window.Autoculture.init();
    if (window.Autobuild) window.Autobuild.init();
    if (window.Autoattack) window.Autoattack.init();
    if (window.Assistant) window.Assistant.init();
    
    // Finalize ModuleManager
    if (window.ModuleManager) window.ModuleManager.checkAutostart();
  },
  
  fixMessage: function () {
    if (typeof HumanMessage === 'undefined') return;
    var wrapInitialize = function (originalInit) {
      return function () {
        originalInit["apply"](this, arguments);
        $(window)["unbind"]("click");
      };
    };
    HumanMessage["_initialize"] = wrapInitialize(HumanMessage._initialize);
  },
  
  initAjax: function () {
    $(document).ajaxComplete(function (_event, _xhr, _settings) {
      if (
        _settings.url.indexOf("/game/") != -1 &&
        _xhr.readyState == 4 &&
        _xhr.status == 200
      ) {
        // Normalize the game action for module dispatch.
        var _url = _settings.url.split("?");
        var _action = _url[0].substr(6) + "/" + _url[1].split("&")[1].substr(7);
        if (typeof window.Autobuild !== "undefined") {
          window.Autobuild.calls(_action);
        }
        if (typeof window.Autoattack !== "undefined") {
          window.Autoattack.calls(_action, _xhr.responseText);
        }
      }
    });
  },
  
  randomize: function (min, max) {
    return Math["floor"](Math["random"]() * (max - min + 1)) + min;
  },
  
  secondsToTime: function (seconds) {
    var days = Math["floor"](seconds / 86400);
    var hours = Math["floor"]((seconds % 86400) / 3600);
    var minutes = Math["floor"](((seconds % 86400) % 3600) / 60);
    return (
      (days ? days + " days " : "") +
      (hours ? hours + " hours " : "") +
      (minutes ? minutes + " minutes " : "")
    );
  },
  
  timeToSeconds: function (timeString) {
    var parts = timeString["split"](":"),
      totalSeconds = 0,
      multiplier = 1;
    while (parts["length"] > 0) {
      totalSeconds += multiplier * parseInt(parts["pop"](), 10);
      multiplier *= 60;
    }
    return totalSeconds;
  },
  
  createNotification: function (type, message) {
    var notifier =
      typeof Layout["notify"] == "undefined"
        ? new NotificationHandler()
        : Layout;
    notifier["notify"](
      $("#notification_area>.notification")["length"] + 1,
      type,
      "<span><b>" +
        "GrepoBot Modern" +
        "</b></span>" +
        message +
        "<span class='small notification_date'>" +
        "Version " +
        this["version"] +
        "</span>",
    );
  },
  
  toHHMMSS: function (totalSeconds) {
    var hours = ~~(totalSeconds / 3600);
    var minutes = ~~((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    var ret = "";
    if (hours > 0) {
      ret += "" + hours + ":" + (minutes < 10 ? "0" : "");
    }
    ret += "" + minutes + ":" + (seconds < 10 ? "0" : "");
    ret += "" + seconds;
    return ret;
  },
  
  checkPremium: function (advisorKey) {
    return $(".advisor_frame." + advisorKey + " div")["hasClass"](
      advisorKey + "_active",
    );
  },
  
  initMapTownFeature: function () {
    if (typeof MapTiles === 'undefined') return;
    var self = this;
    var wrapCreateTownDiv = function (originalCreateTownDiv) {
      return function () {
        var townDivs = originalCreateTownDiv["apply"](this, arguments);
        return self.town_map_info(townDivs, arguments[0]);
      };
    };
    MapTiles["createTownDiv"] = wrapCreateTownDiv(MapTiles["createTownDiv"]);
  },

  town_map_info: function (townDivs, townData) {
    if (
      townDivs != undefined &&
      townDivs["length"] > 0 &&
      townData["player_name"]
    ) {
      for (var i = 0; i < townDivs["length"]; i++) {
        if (townDivs[i]["className"] == "flag town") {
          if (typeof window.Assistant !== "undefined") {
            if (window.Assistant["settings"]["town_names"]) {
              $(townDivs[i])["addClass"]("active_town");
            }
            if (window.Assistant["settings"]["player_name"]) {
              $(townDivs[i])["addClass"]("active_player");
            }
            if (window.Assistant["settings"]["alliance_name"]) {
              $(townDivs[i])["addClass"]("active_alliance");
            }
          }
          $(townDivs[i])["append"](
            '<div class="player_name">' +
              (townData["player_name"] || "") +
              "</div>",
          );
          $(townDivs[i])["append"](
            '<div class="town_name">' + townData["name"] + "</div>",
          );
          $(townDivs[i])["append"](
            '<div class="alliance_name">' +
              (townData["alliance_name"] || "") +
              "</div>",
          );
          break;
        }
      }
    }
    return townDivs;
  },
};

// Alias for compatibility
window.GrepoBotCore = window.GrepoBotCore;
