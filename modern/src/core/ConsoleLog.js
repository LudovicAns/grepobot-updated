/**
 * ConsoleLog module: central log buffer with in-game console rendering.
 * Responsibilities: store log entries and keep the UI scrolled.
 */
window.ConsoleLog = {
  Logs: [],
  RawLogs: [],
  Types: [
    GrepoBotCore.t("console.type.bot", "GrepoBot Updated"),
    GrepoBotCore.t("console.type.farm", "Farming"),
    GrepoBotCore.t("console.type.culture", "Culture"),
    GrepoBotCore.t("console.type.build", "Builder"),
    GrepoBotCore.t("console.type.attack", "Attack"),
  ],
  scrollInterval: "",
  scrollUpdate: true,
  contentConsole: function () {
    // ... (keep original for compatibility if needed, though modern won't use it)
  },
  Log: function (_message, _type) {
    if (this["Logs"]["length"] >= 500) {
      this["Logs"]["shift"]();
      this["RawLogs"]["shift"]();
    }

    function pad2(value) {
      return value < 10 ? "0" + value : value;
    }
    var now = new Date();
    var timestamp =
      pad2(now["getHours"]()) +
      ":" +
      pad2(now["getMinutes"]()) +
      ":" +
      pad2(now["getSeconds"]());
    
    var typeStr = ConsoleLog["Types"][_type] || "Bot";
    var logText = timestamp + " - " + "[" + typeStr + "]: " + _message;
    
    this["RawLogs"].push({
        timestamp: timestamp,
        type: typeStr,
        message: _message,
        full: logText
    });

    var line = $("<div/>")["append"](
      $("<div/>", {
        style: "width: 100%;",
      })["html"](logText),
    );
    this["Logs"]["push"](line);
    var terminalOutput = $(".terminal-output");
    if (terminalOutput["length"]) {
      terminalOutput["append"](line);
      if (this["scrollUpdate"]) {
        var terminal = $(".terminal");
        var scrollHeight = $(".terminal-output")[0]["scrollHeight"];
        terminal["scrollTop"](scrollHeight);
      }
    }
  },
  LogScrollBottom: function () {
    clearInterval(this["scrollInterval"]);
    var terminal = $(".terminal");
    var terminalOutput = $(".terminal-output");
    // Toggle auto-scroll only when user is already at the bottom.
    if (
      terminal["scrollTop"]() + terminal["height"]() ==
      terminalOutput["height"]()
    ) {
      this["scrollUpdate"] = true;
    } else {
      this["scrollUpdate"] = false;
    }
    var scrollHeight = terminalOutput[0]["scrollHeight"];
    this["scrollInterval"] = setInterval(function () {
      terminal["scrollTop"](scrollHeight);
    }, 7000);
  },
};
