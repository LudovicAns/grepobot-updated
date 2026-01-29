/**
 * Main bootstrap module for the bot.
 * Responsibilities: load modules, wire AJAX hooks, and render the bot UI.
 */
var GrepoBotUpdated = {
  title: "GrepoBot Updated",
  version: "0.1.0",
  domain:
    window.location.protocol +
    "//cdn.jsdelivr.net/gh/alexandre2017009p-star/bot7u10@5.99/",
  botWnd: "",
  isLogged: false,
  Account: {
    player_id: Game.player_id,
    player_name: Game.player_name,
    world_id: Game.world_id,
    locale_lang: Game.locale_lang,
    premium_grepolis: Game.premium_user,
    csrfToken: Game.csrfToken,
  },
  init: function () {
    ConsoleLog.Log("Initialize GrepoBot Updated", 0);
    GrepoBotUpdated.loadModules();
    GrepoBotUpdated.initAjax();
    GrepoBotUpdated.initMapTownFeature();
    GrepoBotUpdated.fixMessage();
    Assistant.init();
  },
  /**
   * Load all bot modules from CDN
   */
  loadModules: function () {
    ModuleManager.loadModules();
  },
  /**
   * Initialize bot window
   */
  initWnd: function () {
    if (!GrepoBotUpdated["isLogged"]) {
      return;
    }
    //if window is already initialized
    if (typeof GrepoBotUpdated.botWnd != "undefined") {
      try {
        GrepoBotUpdated["botWnd"]["close"]();
      } catch (F) {}
      GrepoBotUpdated["botWnd"] = undefined;
    }

    GrepoBotUpdated.botWnd = Layout.dialogWindow.open(
      "",
      GrepoBotUpdated.title + " " + GrepoBotUpdated.version,
      500,
      350,
      "",
      false,
    );
    GrepoBotUpdated.botWnd.setHeight([350]);
    GrepoBotUpdated.botWnd.setPosition(["center", "center"]);
    var botWindow = GrepoBotUpdated.botWnd.getJQElement();
    botWindow["append"](
      $("<div/>", {
        "\x63\x6C\x61\x73\x73": "menu_wrapper",
        "\x73\x74\x79\x6C\x65": "left: -60px; top: 6px;",
      })["append"](
        $("<ul/>", {
          "\x63\x6C\x61\x73\x73": "menu_inner",
        })
          ["prepend"](GrepoBotUpdated["addMenuItem"]("AUTHORIZE", "Account", "Account"))
          ["prepend"](
            GrepoBotUpdated["addMenuItem"]("CONSOLE", "Assistant", "Assistant"),
          )
          ["prepend"](
            GrepoBotUpdated["addMenuItem"]("ASSISTANT", "Console", "Console"),
          ) /*['prepend'](GrepoBotUpdated['addMenuItem']('SUPPORT', 'Support', 'Support'))*/,
      ),
    );
    if (typeof Autoattack !== "undefined") {
      botWindow["find"](".menu_inner li:last-child")["before"](
        GrepoBotUpdated["addMenuItem"]("ATTACKMODULE", "Attack", "Autoattack"),
      );
    }
    if (typeof Autobuild !== "undefined") {
      botWindow["find"](".menu_inner li:last-child")["before"](
        GrepoBotUpdated["addMenuItem"]("CONSTRUCTMODULE", "Build", "Autobuild"),
      );
    }
    if (typeof Autoculture !== "undefined") {
      botWindow["find"](".menu_inner li:last-child")["before"](
        GrepoBotUpdated["addMenuItem"]("CULTUREMODULE", "Culture", "Autoculture"),
      );
    }
    if (typeof Autofarm !== "undefined") {
      botWindow["find"](".menu_inner li:last-child")["before"](
        GrepoBotUpdated["addMenuItem"]("FARMMODULE", "Farm", "Autofarm"),
      );
    }
    $("#GrepoBotUpdated-AUTHORIZE")["click"]();
  },
  addMenuItem: function (menuId, label, relKey) {
    return $("<li/>")["append"](
      $("<a/>", {
        "\x63\x6C\x61\x73\x73": "submenu_link",
        "\x68\x72\x65\x66": "#",
        "\x69\x64": "GrepoBotUpdated-" + menuId,
        "\x72\x65\x6C": relKey,
      })
        ["click"](function () {
          GrepoBotUpdated["botWnd"]
            ["getJQElement"]()
            ["find"]("li a.submenu_link")
            ["removeClass"]("active");
          $(this)["addClass"]("active");
          GrepoBotUpdated["botWnd"]["setContent2"](
            GrepoBotUpdated["getContent"]($(this)["attr"]("rel")),
          );
          if ($(this)["attr"]("rel") == "Console") {
            var terminal = $(".terminal");
            var scrollHeight = $(".terminal-output")[0]["scrollHeight"];
            terminal["scrollTop"](scrollHeight);
          }
        })
        ["append"](function () {
          return relKey != "Support"
            ? $("<span/>", {
                "\x63\x6C\x61\x73\x73": "left",
              })["append"](
                $("<span/>", {
                  "\x63\x6C\x61\x73\x73": "right",
                })["append"](
                  $("<span/>", {
                    "\x63\x6C\x61\x73\x73": "middle",
                  })["html"](label),
                ),
              )
            : '<a id="help-button" onclick="return false;" class="confirm"></a>';
        }),
    );
  },
  getContent: function (tabKey) {
    if (tabKey == "Console") {
      return ConsoleLog["contentConsole"]();
    } else {
      if (tabKey == "Account") {
        return GrepoBotUpdated["contentAccount"]();
      } else {
        /*if (tabKey == 'Support') {
                    return GrepoBotUpdated['contentSupport']()
                } else {*/
        if (typeof window[tabKey] != "undefined") {
          return window[tabKey]["contentSettings"]();
        }
        return "";
        //}
      }
    }
  },

  /**
   * First tab of bot
   */
  contentAccount: function () {
    var _rows = {
      "Name:": Game.player_name,
      "World:": Game.world_id,
      "Rank:": Game.player_rank,
      "Towns:": Game.player_villages,
      "Language:": Game.locale_lang,
    };
    var _table = $("<table/>", {
      class: "game_table layout_main_sprite",
      cellspacing: "0",
      width: "100%",
    }).append(function () {
      var _counter = 0;
      var _tbody = $("<tbody/>");
      $.each(_rows, function (_index, _value) {
        _tbody.append(
          $("<tr/>", {
            class: _counter % 2 ? "game_table_even" : "game_table_odd",
          })
            .append(
              $("<td/>", {
                style: "background-color: #DFCCA6;width: 30%;",
              }).html(_index),
            )
            .append($("<td/>").html(_value)),
        );
        _counter++;
      });
      return _tbody;
    });
    return FormBuilder.gameWrapper(
      "Account",
      "account_property_wrapper",
      _table,
      "margin-bottom:9px;",
    )[0]["outerHTML"];
  },
  fixMessage: function () {
    var wrapInitialize = function (originalInit) {
      return function () {
        originalInit["apply"](this, arguments);
        $(window)["unbind"]("click");
      };
    };
    HumanMessage["_initialize"] = wrapInitialize(HumanMessage._initialize);
  },

  /**
   * Subscribe to ajaxComplete Event
   */
  initAjax: function () {
    $(document).ajaxComplete(function (_event, _xhr, _settings) {
      if (
        _settings.url.indexOf(GrepoBotUpdated.domain) == -1 &&
        _settings.url.indexOf("/game/") != -1 &&
        _xhr.readyState == 4 &&
        _xhr.status == 200
      ) {
        // Normalize the game action for module dispatch.
        var _url = _settings.url.split("?");
        var _action = _url[0].substr(6) + "/" + _url[1].split("&")[1].substr(7);
        if (typeof Autobuild !== "undefined") {
          Autobuild.calls(_action);
        }
        if (typeof Autoattack !== "undefined") {
          Autoattack.calls(_action, _xhr.responseText);
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
        "GrepoBot Updated" +
        "</b></span>" +
        message +
        "<span class='small notification_date'>" +
        "Version " +
        GrepoBotUpdated["version"] +
        "</span>",
    );
  },
  toHHMMSS: function (totalSeconds) {
    var hours = ~~(totalSeconds / 3600);
    var minutes = ~~((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    ret = "";
    if (hours > 0) {
      ret += "" + hours + ":" + (minutes < 10 ? "0" : "");
    }
    ret += "" + minutes + ":" + (seconds < 10 ? "0" : "");
    ret += "" + seconds;
    return ret;
  },
  stringify: function (value) {
    var valueType = typeof value;
    if (valueType === "string") {
      return '"' + value + '"';
    }
    if (valueType === "boolean" || valueType === "number") {
      return value;
    }
    if (valueType === "function") {
      return value.toString();
    }
    var pairs = [];
    for (var key in value) {
      pairs["push"]('"' + key + '":' + this["stringify"](value[key]));
    }
    return "{" + pairs["join"](",") + "}";
  },
  town_map_info: function (townDivs, townData) {
    if (
      townDivs != undefined &&
      townDivs["length"] > 0 &&
      townData["player_name"]
    ) {
      for (var i = 0; i < townDivs["length"]; i++) {
        if (townDivs[i]["className"] == "flag town") {
          if (typeof Assistant !== "undefined") {
            if (Assistant["settings"]["town_names"]) {
              $(townDivs[i])["addClass"]("active_town");
            }
            if (Assistant["settings"]["player_name"]) {
              $(townDivs[i])["addClass"]("active_player");
            }
            if (Assistant["settings"]["alliance_name"]) {
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
  checkPremium: function (advisorKey) {
    return $(".advisor_frame." + advisorKey + " div")["hasClass"](
      advisorKey + "_active",
    );
  },
  initWindow: function () {
    $(".nui_main_menu")["css"]("top", "276px");
    $("<div/>", {
      class: "nui_bot_toolbox",
    })
      ["append"](
        $("<div/>", {
          class: "bot_menu layout_main_sprite",
        })["append"](
          $("<ul/>")
            ["append"](
              $("<li/>", {
                id: "Autofarm_onoff",
                class: "disabled",
              })["append"](
                $("<span/>", {
                  class: "autofarm farm_town_status_0",
                }),
              ),
            )
            ["append"](
              $("<li/>", {
                id: "Autoculture_onoff",
                class: "disabled",
              })["append"](
                $("<span/>", {
                  class: "autoculture farm_town_status_0",
                }),
              ),
            )
            ["append"](
              $("<li/>", {
                id: "Autobuild_onoff",
                class: "disabled",
              })["append"](
                $("<span/>", {
                  class: "autobuild toolbar_activities_recruits",
                }),
              ),
            )
            ["append"](
              $("<li/>", {
                id: "Autoattack_onoff",
                class: "disabled",
              })["append"](
                $("<span/>", {
                  class: "autoattack sword_icon",
                }),
              ),
            )
            ["append"](
              $("<li/>")["append"](
                $("<span/>", {
                  href: "#",
                  class: "botsettings circle_button_settings",
                })
                  ["on"]("click", function () {
                    if (GrepoBotUpdated["isLogged"]) {
                      GrepoBotUpdated["initWnd"]();
                    }
                  })
                  ["mousePopup"](
                    new MousePopup(
                      DM["getl10n"]("COMMON")["main_menu"]["settings"],
                    ),
                  ),
              ),
            ),
        ),
      )
      ["append"](
        $("<div/>", {
          id: "time_grepobot_updated",
          class: "time_row",
        }),
      )
      ["append"](
        $("<div/>", {
          class: "bottom",
        }),
      )
      ["insertAfter"](".nui_left_box");
  },
  initMapTownFeature: function () {
    var wrapCreateTownDiv = function (originalCreateTownDiv) {
      return function () {
        var townDivs = originalCreateTownDiv["apply"](this, arguments);
        return GrepoBotUpdated["town_map_info"](townDivs, arguments[0]);
      };
    };
    MapTiles["createTownDiv"] = wrapCreateTownDiv(MapTiles["createTownDiv"]);
  },
  checkAutoRelogin: function () {
    if (
      typeof $["cookie"]("pid") !== "undefined" &&
      typeof $["cookie"]("ig_conv_last_site") !== "undefined"
    ) {
      var worldId = $["cookie"]("ig_conv_last_site")
        ["match"](/\/\/(.*?)\.grepolis\.com/g)[0]
        ["replace"]("//", "")
        ["replace"](".grepolis.com", "");
      /* TODO
            DataExchanger.Auth('checkAutorelogin', {
                player_id: $['cookie']('pid'),
                world_id: worldId
            }, function(_0xe20bx9) {
                if (_0xe20bx9 != 0) {
                    setTimeout(function() {
                        DataExchanger['login_to_game_world'](worldId)
                    }, _0xe20bx9 * 1000)
                }
            })*/
    }
  },
};
(function () {
  String["prototype"]["capitalize"] = function () {
    return this["charAt"](0)["toUpperCase"]() + this["slice"](1);
  };
  String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, "g"), replacement);
  };
  $["fn"]["serializeObject"] = function () {
    var formData = {};
    var formArray = this["serializeArray"]();
    $["each"](formArray, function () {
      if (formData[this["name"]] !== undefined) {
        if (!formData[this["name"]]["push"]) {
          formData[this["name"]] = [formData[this["name"]]];
        }
        formData[this["name"]]["push"](this["value"] || "");
      } else {
        formData[this["name"]] = this["value"] || "";
      }
    });
    return formData;
  };
  var pollInterval = setInterval(function () {
    if (window != undefined) {
      if (
        $(".nui_main_menu")["length"] &&
        !$["isEmptyObject"](ITowns["towns"])
      ) {
        clearInterval(pollInterval);
        GrepoBotUpdated["initWindow"]();
        GrepoBotUpdated["initMapTownFeature"]();

        $["when"](
          $["getScript"](GrepoBotUpdated["domain"] + "DataExchanger.js"),
          $["getScript"](GrepoBotUpdated["domain"] + "ConsoleLog.js"),
          $["getScript"](GrepoBotUpdated["domain"] + "FormBuilder.js"),
          $["getScript"](GrepoBotUpdated["domain"] + "ModuleManager.js"),
          $["getScript"](GrepoBotUpdated["domain"] + "Assistant.js"),
          $.Deferred(function (deferred) {
            $(deferred["resolve"]);
          }),
        )["done"](function () {
          GrepoBotUpdated["init"]();
        });
      } else {
        if (
          /grepolis\.com\/start\?nosession/g["test"](window["location"]["href"])
        ) {
          clearInterval(pollInterval);
          $["when"](
            $["getScript"](GrepoBotUpdated["domain"] + "DataExchanger.js"),
            $["getScript"](GrepoBotUpdated["domain"] + "Redirect.js"),
            $.Deferred(function (deferred) {
              $(deferred["resolve"]);
            }),
          )["done"](function () {
            GrepoBotUpdated["checkAutoRelogin"]();
          });
        }
      }
    }
  }, 100);
})();
