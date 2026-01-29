/**
 * Autoattack module: builds a planned attack list and schedules sends.
 * Flow: start -> checkAttack per item -> send if requirements match.
 */
Autoattack = {
  settings: {
    autostart: false,
  },
  attacks: [],
  attacks_timers: [],
  view: null,
  checked_count: 0,
  init: function () {
    ConsoleLog.Log("Initialize Autoattack", 4);
    Autoattack["initButton"]();
    if (GrepoBotUpdated["checkPremium"]("captain")) {
      Autoattack["loadAttackQueue"]();
    }
  },
  setSettings: function (settingsJson) {
    if (settingsJson != "" && settingsJson != null) {
      $["extend"](Autoattack["settings"], JSON["parse"](settingsJson));
    }
  },
  initButton: function () {
    ModuleManager["initButtons"]("Autoattack");
  },
  start: function () {
    Autoattack["attacks_timers"] = [];
    // Run checks in parallel and summarize when all are done.
    var attackChecks = $["map"](
      Autoattack["attacks"],
      function (attack, attackIndex) {
        var deferred = $.Deferred();
        Autoattack["checkAttack"](attack, attackIndex)["then"](function () {
          deferred["resolve"]();
        });
        return deferred;
      },
    );
    $["when"]["apply"]($, attackChecks)["done"](function () {
      Autoattack["checked_count"] = 0;
      var statusMessage = null;
      if (Autoattack["countRunningAttacks"]() == 0) {
        statusMessage = DM["getl10n"]("COMMON")["no_results"] + ".";
        HumanMessage["error"](statusMessage);
        ConsoleLog.Log(
          '<span style="color: #ff4f23;">' + statusMessage + "</span>",
          4,
        );
        Autoattack["disableStart"]();
      } else {
        statusMessage =
          DM["getl10n"]("alliance")["index"]["button_send"] +
          ": " +
          Autoattack["countRunningAttacks"]() +
          " " +
          DM["getl10n"]("layout")["toolbar_activities"]["incomming_attacks"][
            "toLocaleLowerCase"
          ]() +
          ".";
        HumanMessage["success"](statusMessage);
        ConsoleLog.Log(
          '<span style="color: #ff4f23;">' + statusMessage + "</span>",
          4,
        );
      }
    });
  },
  checkAttack: function (attack, attackIndex) {
    var deferred = $.Deferred();
    if (attack["send_at"] >= Timestamp["now"]()) {
      Autoattack["checked_count"]++;
      setTimeout(
        function () {
          DataExchanger["town_info_attack"](
            attack["town_id"],
            attack,
            function (response) {
              if (response["json"] != undefined) {
                if (
                  !response["json"]["same_island"] ||
                  GameDataUnits["hasNavalUnits"](attack["units"])
                ) {
                  var capacityInfo = GameDataUnits["calculateCapacity"](
                    attack["town_id"],
                    attack["units"],
                  );
                  if (
                    capacityInfo["needed_capacity"] >
                    capacityInfo["total_capacity"]
                  ) {
                    var statusMessage =
                      DM["getl10n"]("place")["support_overview"][
                        "slow_transport_ship"
                      ];
                    $("#attack_order_id_" + attack["id"] + " .attack_bot_timer")
                      ["removeClass"]("success")
                      ["html"](statusMessage);
                    Autoattack["addAttack"](attackIndex, statusMessage);
                    deferred["resolve"]();
                    return false;
                  }
                }
                Autoattack["addAttack"](attackIndex);
                deferred["resolve"]();
              }
            },
          );
        },
        (Autoattack["checked_count"] * 1000) / 2,
      );
    } else {
      var statusMessage = "Expired";
      Autoattack["addAttack"](attackIndex, statusMessage);
      $("#attack_order_id_" + attack["id"] + " .attack_bot_timer")
        ["removeClass"]("success")
        ["html"](statusMessage);
      deferred["resolve"]();
    }
    return deferred;
  },
  addAttack: function (attackIndex, messageText) {
    var timerInfo = {
      is_running: false,
      attack_id: Autoattack["attacks"][attackIndex]["id"],
      interval: null,
      message: "",
      message_text: "",
    };
    if (messageText != undefined) {
      timerInfo["message_text"] = messageText;
    } else {
      timerInfo["is_running"] = true;
      timerInfo["interval"] = setInterval(function () {
        if (Autoattack["attacks"][attackIndex] != undefined) {
          var secondsRemaining =
            Autoattack["attacks"][attackIndex]["send_at"] - Timestamp["now"]();
          timerInfo["message"] = $(
            "#attack_order_id_" + timerInfo["attack_id"] + " .attack_bot_timer",
          );
          timerInfo["message"]["html"](GrepoBotUpdated["toHHMMSS"](secondsRemaining));
          if (
            secondsRemaining == 300 ||
            secondsRemaining == 120 ||
            secondsRemaining == 60
          ) {
            ConsoleLog.Log(
              '<span style="color: #ff4f23;">[' +
                Autoattack["attacks"][attackIndex]["origin_town_name"] +
                " &#62; " +
                Autoattack["attacks"][attackIndex]["target_town_name"] +
                "] " +
                DM["getl10n"]("heroes")
                  ["common"]["departure"]["toLowerCase"]()
                  ["replace"](":", "") +
                " " +
                DM["getl10n"]("place")["support_overview"]["just_in"] +
                " " +
                hours_minutes_seconds(secondsRemaining) +
                ".</span>",
              4,
            );
          }
          if (
            Autoattack["attacks"][attackIndex]["send_at"] <= Timestamp["now"]()
          ) {
            timerInfo["is_running"] = false;
            Autoattack["sendAttack"](Autoattack["attacks"][attackIndex]);
            Autoattack["stopTimer"](timerInfo);
          }
        } else {
          timerInfo["is_running"] = false;
          timerInfo["message"]["html"]("Stopped");
          Autoattack["stopTimer"](timerInfo);
        }
      }, 1000);
    }
    Autoattack["attacks_timers"]["push"](timerInfo);
  },
  countRunningAttacks: function () {
    var runningCount = 0;
    Autoattack["attacks_timers"]["forEach"](function (timerInfo) {
      if (timerInfo["is_running"]) {
        runningCount++;
      }
    });
    return runningCount;
  },
  stopTimer: function (timerInfo) {
    clearInterval(timerInfo["interval"]);
    if (Autoattack["countRunningAttacks"]() == 0) {
      ConsoleLog.Log('<span style="color: #ff4f23;">All finished.</span>', 4);
      Autoattack["stop"]();
    }
  },
  stop: function () {
    Autoattack["disableStart"]();
    Autoattack["attacks_timers"]["forEach"](function (timerInfo) {
      if (timerInfo["is_running"]) {
        $("#attack_order_id_" + timerInfo["attack_id"] + " .attack_bot_timer")[
          "html"
        ]("");
      }
      clearInterval(timerInfo["interval"]);
    });
  },
  disableStart: function () {
    ModuleManager["modules"]["Autoattack"]["isOn"] = false;
    $("#Autoattack_onoff")
      ["removeClass"]("on")
      ["find"]("span")
      ["mousePopup"](new MousePopup("Start Autoattack"));
  },
  sendAttack: function (attack) {
    DataExchanger["send_units"](
      attack["town_id"],
      attack["type"],
      attack["target_town_id"],
      Autoattack["unitsToSend"](attack["units"]),
      function (response) {
        var timers = Autoattack["attacks_timers"]["filter"](
          function (timerInfo) {
            return timerInfo["attack_id"] === attack["id"];
          },
        );
        if (response["success"] != undefined && timers["length"]) {
          timers[0]["message_text"] = "Success";
          timers[0]["message"]["addClass"]("success")["html"]("Success");
          ConsoleLog.Log(
            '<span style="color: #ff9e22;">[' +
              attack["origin_town_name"] +
              " &#62; " +
              attack["target_town_name"] +
              "] " +
              response["success"] +
              "</span>",
            4,
          );
        } else {
          if (response["error"] != undefined && timers["length"]) {
            timers[0]["message_text"] = "Invalid";
            timers[0]["message"]["html"]("Invalid");
            ConsoleLog.Log(
              '<span style="color: #ff3100;">[' +
                attack["origin_town_name"] +
                " &#62; " +
                attack["target_town_name"] +
                "] " +
                response["error"] +
                "</span>",
              4,
            );
          }
        }
      },
    );
  },
  unitsToSend: function (units) {
    var filteredUnits = {};
    $["each"](units, function (unitId, unitAmount) {
      if (unitAmount > 0) {
        filteredUnits[unitId] = unitAmount;
      }
    });
    return filteredUnits;
  },
  calls: function (action, payload) {
    switch (action) {
      case "attack_planer/add_origin_town":
      case "attack_planer/edit_origin_town":
        Autoattack["stop"]();
        Autoattack["loadAttackQueue"]();
        break;
      case "attack_planer/attacks":
        payload = JSON["parse"](payload);
        if (payload["json"]["data"] != undefined) {
          Autoattack["setAttackData"](payload["json"]);
        }
        break;
    }
  },
  setAttackData: function (response) {
    if (GrepoBotUpdated["checkPremium"]("captain")) {
      Autoattack["attacks"] =
        response["data"]["attacks"] != undefined
          ? response["data"]["attacks"]
          : [];
    }
  },
  attackOrderRow: function (attack, rowIndex) {
    var unitsList = $("<div/>", {
      "\x63\x6C\x61\x73\x73": "origin_town_units",
    });
    if (attack["units"] != undefined) {
      $["each"](attack["units"], function (unitId, unitAmount) {
        if (unitAmount > 0) {
          unitsList["append"](
            $("<div/>", {
              "\x63\x6C\x61\x73\x73": "unit_icon25x25 " + unitId,
            })["html"](unitAmount),
          );
        }
      });
    }
    var row = $("<li/>", {
      "\x63\x6C\x61\x73\x73":
        "attacks_row " + (rowIndex % 2 == 0 ? "odd" : "even"),
      "\x69\x64": "attack_order_id_" + attack["id"],
    });
    if (attack["send_at"] > Timestamp["now"]()) {
      row["hover"](function () {
        $(this)["toggleClass"]("brown");
      });
    }
    return row["append"](
      $("<div/>", {
        "\x63\x6C\x61\x73\x73": "attack_type32x32 " + attack["type"],
      }),
    )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "arrow",
        }),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "row1",
        })
          ["append"](" " + attack["origin_town_link"] + " ")
          ["append"]("(" + attack["origin_player_link"] + ")")
          ["append"](
            $("<span/>", {
              "\x63\x6C\x61\x73\x73": "small_arrow",
            }),
          )
          ["append"](" " + attack["target_town_link"] + " ")
          ["append"]("(" + attack["origin_player_link"] + ") "),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73":
            "row2" +
            (attack["send_at"] <= Timestamp["now"]() ? " expired" : ""),
        })
          ["append"](
            $("<span/>")["html"](
              DM["getl10n"]("heroes")["common"]["departure"],
            ),
          )
          ["append"](
            " " + DateHelper["formatDateTimeNice"](attack["send_at"]) + " ",
          )
          ["append"](
            $("<span/>")["html"](DM["getl10n"]("heroes")["common"]["arrival"]),
          )
          ["append"](
            " " + DateHelper["formatDateTimeNice"](attack["arrival_at"]) + " ",
          ),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "show_units",
        })["on"]("click", function () {
          unitsList["toggle"]();
        }),
      )
      ["append"](
        $("<div/>", {
          "\x63\x6C\x61\x73\x73": "attack_bot_timer",
        })["html"](function () {
          var timers = Autoattack["attacks_timers"]["filter"](
            function (timerInfo) {
              return timerInfo["attack_id"] === attack["id"];
            },
          );
          if (timers["length"]) {
            if (timers[0]["is_running"]) {
              return GrepoBotUpdated["toHHMMSS"](
                attack["send_at"] - Timestamp["now"](),
              );
            } else {
              return timers[0]["message_text"];
            }
          }
        }),
      )
      ["append"](unitsList);
  },
  loadAttackQueue: function () {
    DataExchanger["attack_planner"](Game["townId"], function (response) {
      Autoattack["setAttackData"](response);
      Autoattack["setAttackQueue"]($("#attack_bot"));
    });
  },
  setAttackQueue: function (container) {
    if (container["length"]) {
      var list = container["find"]("ul.attacks_list");
      list["empty"]();
      DataExchanger["attack_planner"](Game["townId"], function (response) {
        Autoattack["setAttackData"](response);
        $["each"](Autoattack["attacks"], function (attackIndex, attack) {
          attackIndex++;
          list["append"](Autoattack["attackOrderRow"](attack, attackIndex));
        });
      });
    }
  },
  contentSettings: function () {
    var container = $(
      '<div id="attack_bot" class="attack_bot attack_planner attacks">' +
        '<div class="game_border">' +
        '<div class="game_border_top"></div>' +
        '<div class="game_border_bottom"></div>' +
        '<div class="game_border_left"></div>' +
        '<div class="game_border_right"></div>' +
        '<div class="game_border_top"></div>' +
        '<div class="game_border_corner corner1">' +
        '</div><div class="game_border_corner corner2">' +
        '</div><div class="game_border_corner corner3">' +
        '</div><div class="game_border_corner corner4">' +
        '</div><div class="game_header bold" id="settings_header">AutoAttack</div>' +
        "<div>" +
        '<div class="attacks_list">' +
        '<ul class="attacks_list">' +
        "</ul>" +
        "</div>" +
        '<div class="game_list_footer autoattack_settings"></div>' +
        "</div>" +
        "</div>" +
        "</div>",
    );
    container["find"](".autoattack_settings")
      ["append"](function () {
        var button = FormBuilder["button"]({
          name: DM["getl10n"]("premium")["advisors"]["short_advantages"][
            "attack_planner"
          ],
          style: "float: left;",
          class: !GrepoBotUpdated["checkPremium"]("captain") ? " disabled" : "",
        });
        return GrepoBotUpdated["checkPremium"]("captain")
          ? button["click"](function () {
              AttackPlannerWindowFactory["openAttackPlannerWindow"]();
            })
          : button;
      })
      ["append"](function () {
        var button = FormBuilder["button"]({
          name: DM["getl10n"]("update_notification")["refresh"],
          style: "float: left;",
          class: !GrepoBotUpdated["checkPremium"]("captain") ? " disabled" : "",
        });
        return GrepoBotUpdated["checkPremium"]("captain")
          ? button["click"](function () {
              Autoattack["setAttackQueue"](container);
            })
          : button;
      })
      ["append"](function () {
        if (!GrepoBotUpdated["checkPremium"]("captain")) {
          return FormBuilder["button"]({
            name: DM["getl10n"]("construction_queue")["advisor_banner"][
              "activate"
            ](Game["premium_data"]["captain"]["name"]),
            style: "float: right;",
          })["click"](function () {
            PremiumWindowFactory["openBuyAdvisorsWindow"]();
          });
        }
      });
    Autoattack["setAttackQueue"](container);
    return container;
  },
};
