/**
 * ConsoleLog module: central log buffer with in-game console rendering.
 * Responsibilities: store log entries and keep the UI scrolled.
 */
ConsoleLog = {
  Logs: [],
  Types: ["Autobot", "Farming", "Culture", "Builder", "Attack "],
  scrollInterval: "",
  scrollUpdate: true,
  contentConsole: function () {
    var consoleFieldset = $("<fieldset/>", {
      style: "float:left; width:472px;",
    })
      ["append"]($("<legend/>")["html"]("Autobot Console"))
      ["append"](
        $("<div/>", {
          class: "terminal",
        })
          ["append"](
            $("<div/>", {
              class: "terminal-output",
            }),
          )
          ["scroll"](function () {
            ConsoleLog.LogScrollBottom();
          }),
      );
    var terminalOutput = consoleFieldset["find"](".terminal-output");
    $["each"](ConsoleLog.Logs, function (index, logEntry) {
      terminalOutput["append"](logEntry);
    });
    return consoleFieldset;
  },
  Log: function (_message, _type) {
    if (this["Logs"]["length"] >= 500) {
      this["Logs"]["shift"]();
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
    var line = $("<div/>")["append"](
      $("<div/>", {
        style: "width: 100%;",
      })["html"](
        timestamp + " - " + "[" + ConsoleLog["Types"][_type] + "]: " + _message,
      ),
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
