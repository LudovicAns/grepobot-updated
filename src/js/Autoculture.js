/**
 * Autoculture module: schedules culture actions (party/triumph/theater).
 * Responsibilities: check availability and fire actions per town.
 */
Autoculture = {
  settings: {
    autostart: false,
    towns: {},
  },
  town: null,
  iTown: null,
  interval: null,
  isStopped: false,
  init: function () {
    ConsoleLog.Log("Initialize Autoculture", 2);
    Autoculture["initButton"]();
  },
  initButton: function () {
    ModuleManager["initButtons"]("Autoculture");
  },
  setSettings: function (settingsJson) {
    if (settingsJson != "" && settingsJson != null) {
      $["extend"](Autoculture["settings"], JSON["parse"](settingsJson));
    }
  },
  checkAvailable: function (townId) {
    // Compute which culture actions are available in the given town.
    var availability = {
      party: false,
      triumph: false,
      theater: false,
    };
    var buildings = ITowns["towns"][townId]["buildings"]()["attributes"];
    var resources = ITowns["towns"][townId]["resources"]();
    if (
      buildings["academy"] >= 30 &&
      resources["wood"] >= 15000 &&
      resources["stone"] >= 18000 &&
      resources["iron"] >= 15000
    ) {
      availability["party"] = true;
    }
    if (
      buildings["theater"] == 1 &&
      resources["wood"] >= 10000 &&
      resources["stone"] >= 12000 &&
      resources["iron"] >= 10000
    ) {
      availability["theater"] = true;
    }
    if (
      MM["getModelByNameAndPlayerId"]("PlayerKillpoints")[
        "getUnusedPoints"
      ]() >= 300
    ) {
      availability["triumph"] = true;
    }
    return availability;
  },
  checkReady: function (town) {
    var iTown = ITowns["towns"][town["id"]];
    if (iTown["hasConqueror"]()) {
      return false;
    }
    if (!ModuleManager["modules"]["Autoculture"]["isOn"]) {
      return false;
    }
    if (town["modules"]["Autoculture"]["isReadyTime"] >= Timestamp["now"]()) {
      return town["modules"]["Autoculture"]["isReadyTime"];
    }
    if (
      Autoculture["settings"]["towns"][town["id"]] !== undefined &&
      ((Autoculture["settings"]["towns"][town["id"]]["party"] &&
        Autoculture["checkAvailable"](town["id"])["party"]) ||
        (Autoculture["settings"]["towns"][town["id"]]["triumph"] &&
          Autoculture["checkAvailable"](town["id"])["triumph"]) ||
        (Autoculture["settings"]["towns"][town["id"]]["theater"] &&
          Autoculture["checkAvailable"](town["id"])["theater"]))
    ) {
      return true;
    }
    return false;
  },
  startCulture: function (town) {
    if (!Autoculture["checkEnabled"]()) {
      return false;
    }
    if (!ModuleManager["modules"]["Autoculture"]["isOn"]) {
      Autoculture["finished"](0);
      return false;
    }
    Autoculture["town"] = town;
    Autoculture["iTown"] = ITowns["towns"][Autoculture["town"]["id"]];
    if (ModuleManager["currentTown"] != Autoculture["town"]["key"]) {
      ConsoleLog.Log(Autoculture["town"]["name"] + " move to town.", 2);
      DataExchanger["switch_town"](Autoculture["town"]["id"], function () {
        if (!Autoculture["checkEnabled"]()) {
          return false;
        }
        ModuleManager["currentTown"] = Autoculture["town"]["key"];
        Autoculture["start"]();
      });
    } else {
      Autoculture["start"]();
    }
  },
  start: function () {
    if (!Autoculture["checkEnabled"]()) {
      return false;
    }
    Autoculture["interval"] = setTimeout(
      function () {
        if (
          Autoculture["settings"]["towns"][Autoculture["town"]["id"]] !==
          undefined
        ) {
          ConsoleLog.Log(
            Autoculture["town"]["name"] + " getting event information.",
            2,
          );
          DataExchanger["building_place"](
            Autoculture["town"]["id"],
            function (response) {
              if (!Autoculture["checkEnabled"]()) {
                return false;
              }
              var celebrations = [];
              celebrations["push"]({
                name: "triumph",
                waiting: 19200,
                element: $(response["plain"]["html"])["find"]("#place_triumph"),
              });
              celebrations["push"]({
                name: "party",
                waiting: 57600,
                element: $(response["plain"]["html"])["find"]("#place_party"),
              });
              celebrations["push"]({
                name: "theater",
                waiting: 285120,
                element: $(response["plain"]["html"])["find"]("#place_theater"),
              });
              var startedAny = false;
              var celebrationIndex = 0;
              var nextDelay = 300;
              var processCelebration = function (celebration) {
                if (celebrationIndex == 3) {
                  if (!startedAny) {
                    ConsoleLog.Log(
                      Autoculture["town"]["name"] + " not ready yet.",
                      2,
                    );
                  }
                  Autoculture["finished"](nextDelay);
                  return false;
                }
                if (
                  celebration["name"] == "triumph" &&
                  (!Autoculture["settings"]["towns"][Autoculture["town"]["id"]][
                    "triumph"
                  ] ||
                    !Autoculture["checkAvailable"](Autoculture["town"]["id"])[
                      "triumph"
                    ] ||
                    MM["getModelByNameAndPlayerId"]("PlayerKillpoints")[
                      "getUnusedPoints"
                    ]() < 300)
                ) {
                  celebrationIndex++;
                  processCelebration(celebrations[celebrationIndex]);
                  return false;
                } else {
                  if (
                    celebration["name"] == "party" &&
                    (!Autoculture["settings"]["towns"][
                      Autoculture["town"]["id"]
                    ]["party"] ||
                      !Autoculture["checkAvailable"](Autoculture["town"]["id"])[
                        "party"
                      ])
                  ) {
                    celebrationIndex++;
                    processCelebration(celebrations[celebrationIndex]);
                    return false;
                  } else {
                    if (
                      celebration["name"] == "theater" &&
                      (!Autoculture["settings"]["towns"][
                        Autoculture["town"]["id"]
                      ]["theater"] ||
                        !Autoculture["checkAvailable"](
                          Autoculture["town"]["id"],
                        )["theater"])
                    ) {
                      celebrationIndex++;
                      processCelebration(celebrations[celebrationIndex]);
                      return false;
                    }
                  }
                }
                if (
                  celebration["element"]["find"](
                    "#countdown_" + celebration["name"],
                  )["length"]
                ) {
                  var countdownSeconds = GrepoBotUpdated["timeToSeconds"](
                    celebration["element"]
                      ["find"]("#countdown_" + celebration["name"])
                      ["html"](),
                  );
                  if (nextDelay == 300) {
                    nextDelay = countdownSeconds;
                  } else {
                    if (nextDelay > countdownSeconds) {
                      nextDelay = countdownSeconds;
                    }
                  }
                  celebrationIndex++;
                  processCelebration(celebrations[celebrationIndex]);
                  return false;
                } else {
                  if (
                    celebration["element"]
                      ["find"](".button, .button_new")
                      ["data"]("enabled") != "1"
                  ) {
                    celebrationIndex++;
                    processCelebration(celebrations[celebrationIndex]);
                    return false;
                  } else {
                    if (
                      celebration["element"]
                        ["find"](".button, .button_new")
                        ["data"]("enabled") == "1"
                    ) {
                      Autoculture["interval"] = setTimeout(
                        function () {
                          startedAny = true;
                          Autoculture["startCelebration"](
                            celebration,
                            function (delaySeconds) {
                              if (Autoculture["isPauzed"]) {
                                return false;
                              }
                              if (nextDelay == 300) {
                                nextDelay = delaySeconds;
                              } else {
                                if (nextDelay >= delaySeconds) {
                                  nextDelay = delaySeconds;
                                }
                              }
                              celebrationIndex++;
                              processCelebration(
                                celebrations[celebrationIndex],
                              );
                            },
                          );
                        },
                        (celebrationIndex + 1) *
                          GrepoBotUpdated["randomize"](1000, 2000),
                      );
                      return false;
                    }
                  }
                }
                celebrationIndex++;
                processCelebration(celebrations[celebrationIndex]);
              };
              processCelebration(celebrations[celebrationIndex]);
            },
          );
        }
      },
      GrepoBotUpdated["randomize"](2000, 4000),
    );
  },
  startCelebration: function (celebration, onComplete) {
    if (!Autoculture["checkEnabled"]()) {
      return false;
    }
    DataExchanger["start_celebration"](
      Autoculture["town"]["id"],
      celebration["name"],
      function (response) {
        if (!Autoculture["checkEnabled"]()) {
          return false;
        }
        var delaySeconds = 0;
        if (response["json"]["error"] == undefined) {
          var celebrationData = {};
          $["each"](
            response["json"]["notifications"],
            function (index, notification) {
              if (notification["subject"] == "Celebration") {
                celebrationData = JSON["parse"](notification["param_str"]);
              }
            },
          );
          if (Autoculture["town"]["id"] == Game["townId"]) {
            var buildingWindows = GPWindowMgr["getByType"](
              GPWindowMgr.TYPE_BUILDING,
            );
            for (var i = 0; buildingWindows["length"] > i; i++) {
              buildingWindows[i]["getHandler"]()["refresh"]();
            }
          }
          if (celebrationData["Celebration"] != undefined) {
            ConsoleLog.Log(
              '<span style="color: #fff;">' +
                Autoculture["getCelebrationText"](
                  celebrationData["Celebration"]["celebration_type"],
                ) +
                " is started.</span>",
              2,
            );
            delaySeconds =
              celebrationData["Celebration"]["finished_at"] -
              Timestamp["now"]();
          }
        } else {
          ConsoleLog.Log(
            Autoculture["town"]["name"] + " " + response["json"]["error"],
            2,
          );
        }
        onComplete(delaySeconds);
      },
    );
  },
  stop: function () {
    clearInterval(Autoculture["interval"]);
    Autoculture["isStopped"] = true;
  },
  finished: function (delaySeconds) {
    if (!Autoculture["checkEnabled"]()) {
      return false;
    }
    Autoculture["town"]["modules"]["Autoculture"]["isReadyTime"] =
      Timestamp["now"]() + delaySeconds;
    ModuleManager["Queue"]["next"]();
  },
  checkEnabled: function () {
    return ModuleManager["modules"]["Autoculture"]["isOn"];
  },
  getCelebrationText: function (key) {
    if (
      typeof PopupFactory !== "undefined" &&
      PopupFactory["texts"] &&
      PopupFactory["texts"][key]
    ) {
      return PopupFactory["texts"][key];
    }
    var labels = {
      party: "Party",
      triumph: "Triumph",
      theater: "Theater",
    };
    return labels[key] || key;
  },
  contentSettings: function () {
    var html = '<ul class="game_list" id="townsoverview"><li class="even">';
    html +=
      '<div class="towninfo small tag_header col w80 h25" id="header_town"></div>';
    html +=
      '<div class="towninfo small tag_header col w40" id="header_island"> Island</div>';
    html +=
      '<div class="towninfo small tag_header col w35" id="header_wood"><div class="col header wood"></div></div>';
    html +=
      '<div class="towninfo small tag_header col w40" id="header_stone"><div class="col header stone"></div></div>';
    html +=
      '<div class="towninfo small tag_header col w40" id="header_iron"><div class="col header iron"></div></div>';
    html +=
      '<div class="towninfo small tag_header col w35" id="header_free_pop"><div class="col header free_pop"></div></div>';
    html +=
      '<div class="towninfo small tag_header col w40" id="header_storage"><div class="col header storage"></div></div>';
    html +=
      '<div class="towninfo small tag_header col w50" id="header_storage"><div class="col header celebration party"></div></div>';
    html +=
      '<div class="towninfo small tag_header col w50" id="header_storage"><div class="col header celebration triumph"></div></div>';
    html +=
      '<div class="towninfo small tag_header col w50" id="header_storage"><div class="col header celebration theater"></div></div>';
    html += '<div style="clear:both;"></div>';
    html += '</li></ul><div id="bot_townsoverview_table_wrapper">';
    html += '<ul class="game_list scroll_content">';
    var rowIndex = 0;
    $["each"](ModuleManager["playerTowns"], function (index, town) {
      var iTown = ITowns["towns"][town["id"]];
      var islandX = iTown["getIslandCoordinateX"]();
      var islandY = iTown["getIslandCoordinateY"]();
      var resources = iTown["resources"]();
      html +=
        '<li class="' +
        (rowIndex % 2 ? "even" : "odd") +
        ' bottom" id="ov_town_' +
        iTown["id"] +
        '">';
      html += '<div class="towninfo small townsoverview col w80">';
      html += "<div>";
      html +=
        '<span><a href="#' +
        iTown["getLinkFragment"]() +
        '" class="gp_town_link">' +
        iTown["name"] +
        "</a></span><br>";
      html += "<span>(" + iTown["getPoints"]() + " Ptn.)</span>";
      html += "</div></div>";
      html += '<div class="towninfo small townsoverview col w40">';
      html += "<div>";
      html += "<span>" + islandX + "," + islandY + "</span>";
      html += "</div>";
      html += "</div>";
      html += '<div class="towninfo small townsoverview col w40">';
      html +=
        '<div class="wood' +
        (resources["wood"] == resources["storage"]
          ? " town_storage_full"
          : "") +
        '">';
      html += resources["wood"];
      html += "</div>";
      html += "</div>";
      html += '<div class="towninfo small townsoverview col w40">';
      html +=
        '<div class="stone' +
        (resources["stone"] == resources["storage"]
          ? " town_storage_full"
          : "") +
        '">';
      html += resources["stone"];
      html += "</div>";
      html += "</div>";
      html += '<div class="towninfo small townsoverview col w40">';
      html +=
        '<div class="iron' +
        (resources["iron"] == resources["storage"]
          ? " town_storage_full"
          : "") +
        '">';
      html += resources["iron"];
      html += "</div>";
      html += "</div>";
      html += '<div class="towninfo small townsoverview col w35">';
      html += "<div>";
      html +=
        '<span class="town_population_count">' +
        resources["population"] +
        "</span>";
      html += "</div>";
      html += "</div>";
      html += '<div class="towninfo small townsoverview col w40">';
      html += "<div>";
      html += '<span class="storage">' + resources["storage"] + "</span>";
      html += "</div>";
      html += "</div>";
      html += '<div class="towninfo small townsoverview col w50">';
      html +=
        '<div class="culture_party_row" id="culture_party_' +
        iTown["id"] +
        '">';
      html += "</div>";
      html += "</div>";
      html += '<div class="towninfo small townsoverview col w50">';
      html +=
        '<div class="culture_triumph_row" id="culture_triumph_' +
        iTown["id"] +
        '">';
      html += "</div>";
      html += "</div>";
      html += '<div class="towninfo small townsoverview col w50">';
      html +=
        '<div class="culture_theater_row" id="culture_theater_' +
        iTown["id"] +
        '">';
      html += "</div>";
      html += "</div>";
      html += '<div style="clear:both;"></div>';
      html += "</li>";
      rowIndex++;
    });
    html += "</ul></div>";
    html += '<div class="game_list_footer">';
    html += '<div id="bot_culture_settings"></div>';
    html += "</div>";
    var toggleState = {};

    function toggleRow(rowSelector) {
      var checkbox = $(rowSelector + " .checkbox_new");
      if (!toggleState[rowSelector]) {
        checkbox["addClass"]("checked");
        checkbox["find"]('input[type="checkbox"]')["prop"]("checked", true);
        toggleState[rowSelector] = true;
      } else {
        checkbox["removeClass"]("checked");
        checkbox["find"]('input[type="checkbox"]')["prop"]("checked", false);
        toggleState[rowSelector] = false;
      }
    }
    var content = $(html);
    content["find"](".celebration.party")
      ["mousePopup"](
        new MousePopup("Auto " + Autoculture["getCelebrationText"]("party")),
      )
      ["on"]("click", function () {
        toggleRow(".culture_party_row");
      });
    content["find"](".celebration.triumph")
      ["mousePopup"](
        new MousePopup("Auto " + Autoculture["getCelebrationText"]("triumph")),
      )
      ["on"]("click", function () {
        toggleRow(".culture_triumph_row");
      });
    content["find"](".celebration.theater")
      ["mousePopup"](
        new MousePopup("Auto " + Autoculture["getCelebrationText"]("theater")),
      )
      ["on"]("click", function () {
        toggleRow(".culture_theater_row");
      });
    $["each"](ModuleManager["playerTowns"], function (index, town) {
      content["find"]("#culture_party_" + town["id"])["html"](
        FormBuilder["checkbox"]({
          id: "bot_culture_party_" + town["id"],
          name: "bot_culture_party_" + town["id"],
          checked:
            town["id"] in Autoculture["settings"]["towns"]
              ? Autoculture["settings"]["towns"][town["id"]]["party"]
              : false,
          disabled: !Autoculture["checkAvailable"](town["id"])["party"],
        }),
      );
      content["find"]("#culture_triumph_" + town["id"])["html"](
        FormBuilder["checkbox"]({
          id: "bot_culture_triumph_" + town["id"],
          name: "bot_culture_triumph_" + town["id"],
          checked:
            town["id"] in Autoculture["settings"]["towns"]
              ? Autoculture["settings"]["towns"][town["id"]]["triumph"]
              : false,
          disabled: !Autoculture["checkAvailable"](town["id"])["triumph"],
        }),
      );
      content["find"]("#culture_theater_" + town["id"])["html"](
        FormBuilder["checkbox"]({
          id: "bot_culture_theater_" + town["id"],
          name: "bot_culture_theater_" + town["id"],
          checked:
            town["id"] in Autoculture["settings"]["towns"]
              ? Autoculture["settings"]["towns"][town["id"]]["theater"]
              : false,
          disabled: !Autoculture["checkAvailable"](town["id"])["theater"],
        }),
      );
    });
    content["find"]("#bot_culture_settings")
      ["append"](
        FormBuilder["button"]({
          name: DM["getl10n"]("notes")["btn_save"],
          style: "float: left;",
        })["on"]("click", function () {
          var formData = $("#bot_townsoverview_table_wrapper input")[
            "serializeObject"
          ]();
          $["each"](ModuleManager["playerTowns"], function (index, town) {
            Autoculture["settings"]["towns"][town["id"]] = {
              party: false,
              triumph: false,
              theater: false,
            };
          });
          $["each"](formData, function (key, value) {
            if (key["indexOf"]("bot_culture_party_") >= 0) {
              Autoculture["settings"]["towns"][
                key["replace"]("bot_culture_party_", "")
              ]["party"] = value != undefined;
            } else {
              if (key["indexOf"]("bot_culture_triumph_") >= 0) {
                Autoculture["settings"]["towns"][
                  key["replace"]("bot_culture_triumph_", "")
                ]["triumph"] = value != undefined;
              } else {
                if (key["indexOf"]("bot_culture_theater_") >= 0) {
                  Autoculture["settings"]["towns"][
                    key["replace"]("bot_culture_theater_", "")
                  ]["theater"] = value != undefined;
                }
              }
            }
          });
          Autoculture["settings"]["autostart"] = $("#autoculture_autostart")[
            "prop"
          ]("checked");
          ConsoleLog.Log("Settings saved", 2);
          HumanMessage["success"]("The settings were saved!");
        }),
      )
      ["append"](
        FormBuilder["checkbox"]({
          text: "AutoStart AutoCulture.",
          id: "autoculture_autostart",
          name: "autoculture_autostart",
          checked: Autoculture["settings"]["autostart"],
        }),
      );
    return FormBuilder["gameWrapper"](
      "AutoCulture",
      "bot_townsoverview",
      content,
      "margin-bottom:9px;",
    );
  },
};
