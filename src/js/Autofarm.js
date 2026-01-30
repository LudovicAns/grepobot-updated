/**
 * Autofarm module: automates farming towns based on resource rules.
 * Responsibilities: decide when to farm and schedule farming actions.
 */
Autofarm = {
  settings: {
    autostart: false,
    method: 300,
    timebetween: 1,
    skipwhenfull: true,
    lowresfirst: true,
    stoplootbelow: true,
  },
  title: "Autofarm settings",
  town: null,
  isPauzed: false,
  iTown: null,
  interval: null,
  isCaptain: false,
  hasP: true,
  shouldFarm: [],
  checkReady: function (town) {
    // Decide if the town should farm based on resources and settings.
    var iTown = ITowns["towns"][town["id"]];
    if (!iTown) {
      return false;
    }
    if (iTown["hasConqueror"]()) {
      return false;
    }
    if (!Autofarm["checkEnabled"]()) {
      return false;
    }
    if (town["modules"]["Autofarm"]["isReadyTime"] >= Timestamp["now"]()) {
      return town["modules"]["Autofarm"]["isReadyTime"];
    }
    var resources;
    try {
      resources = iTown["resources"]();
    } catch (err) {
      return false;
    }
    if (
      resources["wood"] == resources["storage"] &&
      resources["stone"] == resources["storage"] &&
      resources["iron"] == resources["storage"] &&
      Autofarm["settings"]["skipwhenfull"]
    ) {
      return false;
    }
    var skipTown = false;
    $["each"](ModuleManager["Queue"]["queue"], function (index, queueItem) {
      if (queueItem["module"] == "Autofarm") {
        var relatedIndex = town["relatedTowns"]["indexOf"](queueItem["townId"]);
        if (relatedIndex != -1) {
          skipTown = true;
          return false;
        }
      }
    });
    if (Autofarm["settings"]["lowresfirst"]) {
      if (town["relatedTowns"]["length"] > 0) {
        skipTown = false;
        $["each"](town["relatedTowns"], function (index, relatedTownId) {
          var townResources;
          var relatedResources;
          try {
            townResources = iTown["resources"]();
            relatedResources = ITowns["towns"][relatedTownId]["resources"]();
          } catch (err) {
            return false;
          }
          if (
            townResources["wood"] +
              townResources["stone"] +
              townResources["iron"] >
            relatedResources["wood"] +
              relatedResources["stone"] +
              relatedResources["iron"]
          ) {
            skipTown = true;
            return false;
          }
        });
      }
    }
    if (skipTown) {
      return false;
    }
    return true;
  },
  disableP: function () {
    Autoattack["settings"] = {
      autostart: false,
      method: 300,
      timebetween: 1,
      skipwhenfull: true,
      lowresfirst: true,
      stoplootbelow: true,
    };
  },
  checkEnabled: function () {
    return ModuleManager["modules"]["Autofarm"]["isOn"];
  },
  startFarming: function (town) {
    if (!Autofarm["checkEnabled"]()) {
      return false;
    }
    Autofarm["town"] = town;
    Autofarm["shouldFarm"] = [];
    Autofarm["iTown"] = ITowns["towns"][Autofarm["town"]["id"]];
    var startFarmCycle = function () {
      Autofarm["interval"] = setTimeout(
        function () {
          ConsoleLog.Log(
            Autofarm["town"]["name"] + " getting farm information.",
            1,
          );
          if (!Autofarm["isCaptain"]) {
            Autofarm["initFarmTowns"](function () {
              if (!Autofarm["checkEnabled"]()) {
                return false;
              }
              Autofarm["town"]["currentFarmCount"] = 0;
              Autofarm["claimResources"]();
            });
          } else {
            Autofarm["initFarmTownsCaptain"](function () {
              if (!Autofarm["checkEnabled"]()) {
                return false;
              }
              Autofarm["claimResources"]();
            });
          }
        },
        GrepoBotUpdated["randomize"](1000, 2000),
      );
    };
    if (ModuleManager["currentTown"] != Autofarm["town"]["key"]) {
      Autofarm["interval"] = setTimeout(
        function () {
          ConsoleLog.Log(Autofarm["town"]["name"] + " move to town.", 1);
          if (!Autofarm["checkEnabled"]()) {
            return false;
          }
          ModuleManager["currentTown"] = Autofarm["town"]["key"];

          /*DataExchanger['switch_town'](Autofarm['town']['id'], function() {
                    if (!Autofarm['checkEnabled']()) {
                        return false
                    };
                    ModuleManager['currentTown'] = Autofarm['town']['key'];
                    startFarmCycle()
                });*/

          Autofarm["town"]["isSwitched"] = true;
        },
        GrepoBotUpdated["randomize"](1000, 2000),
      );
    }
    startFarmCycle();
  },
  initFarmTowns: function (onReady) {
    DataExchanger["game_data"](Autofarm["town"]["id"], function (response) {
      if (!Autofarm["checkEnabled"]()) {
        return false;
      }
      var mapData = response["map"]["data"]["data"]["data"];
      $["each"](mapData, function (index, island) {
        var farmTowns = [];
        $["each"](island["towns"], function (index, townData) {
          if (
            townData["x"] == Autofarm["iTown"]["getIslandCoordinateX"]() &&
            townData["y"] == Autofarm["iTown"]["getIslandCoordinateY"]() &&
            townData["relation_status"] == 1
          ) {
            farmTowns["push"](townData);
          }
        });
        Autofarm["town"]["farmTowns"] = farmTowns;
      });
      $["each"](Autofarm["town"]["farmTowns"], function (index, farmTown) {
        var lootRemaining = farmTown["loot"] - Timestamp["now"]();
        if (lootRemaining <= 0) {
          Autofarm["shouldFarm"]["push"](farmTown);
        }
      });
      onReady(true);
    });
  },
  initFarmTownsCaptain: function (onReady) {
    DataExchanger["farm_town_overviews"](
      Autofarm["town"]["id"],
      function (response) {
        if (!Autofarm["checkEnabled"]()) {
          return false;
        }
        var farmTowns = [];
        $["each"](response["farm_town_list"], function (index, farmTown) {
          if (
            farmTown["island_x"] ==
              Autofarm["iTown"]["getIslandCoordinateX"]() &&
            farmTown["island_y"] ==
              Autofarm["iTown"]["getIslandCoordinateY"]() &&
            farmTown["rel"] == 1
          ) {
            farmTowns["push"](farmTown);
          }
        });
        Autofarm["town"]["farmTowns"] = farmTowns;
        $["each"](Autofarm["town"]["farmTowns"], function (index, farmTown) {
          var lootRemaining = farmTown["loot"] - Timestamp["now"]();
          if (lootRemaining <= 0) {
            Autofarm["shouldFarm"]["push"](farmTown);
          }
        });
        onReady(true);
      },
    );
  },
  claimResources: function () {
    if (!Autofarm["town"]["farmTowns"][0]) {
      ConsoleLog.Log(Autofarm["town"]["name"] + " has no farm towns.", 1);
      Autofarm["finished"](1800);
      return false;
    }
    if (
      Autofarm["town"]["currentFarmCount"] < Autofarm["shouldFarm"]["length"]
    ) {
      Autofarm["interval"] = setTimeout(
        function () {
          var lootOption = "normal";
          if (!Game["features"]["battlepoint_villages"]) {
            if (
              Autofarm["shouldFarm"][Autofarm["town"]["currentFarmCount"]][
                "mood"
              ] >= 86 &&
              Autofarm["settings"]["stoplootbelow"]
            ) {
              lootOption = "double";
            }
            if (!Autofarm["settings"]["stoplootbelow"]) {
              lootOption = "double";
            }
          }
          if (!Autofarm["isCaptain"]) {
            Autofarm["claimLoad"](
              Autofarm["shouldFarm"][Autofarm["town"]["currentFarmCount"]][
                "id"
              ],
              lootOption,
              function () {
                if (!Autofarm["checkEnabled"]()) {
                  return false;
                }
                Autofarm["shouldFarm"][Autofarm["town"]["currentFarmCount"]][
                  "loot"
                ] =
                  Timestamp["now"]() +
                  Autofarm["getMethodTime"](Autofarm["town"]["id"]);
                ModuleManager["updateTimer"](
                  Autofarm["shouldFarm"]["length"],
                  Autofarm["town"]["currentFarmCount"],
                );
                Autofarm["town"]["currentFarmCount"]++;
                Autofarm["claimResources"]();
              },
            );
          } else {
            var farmTownIds = [];
            $["each"](Autofarm["shouldFarm"], function (index, farmTown) {
              farmTownIds["push"](farmTown["id"]);
            });
            Autofarm["claimLoads"](farmTownIds, lootOption, function () {
              if (!Autofarm["checkEnabled"]()) {
                return false;
              }
              Autofarm["finished"](
                Autofarm["getMethodTime"](Autofarm["town"]["id"]),
              );
            });
          }
        },
        GrepoBotUpdated["randomize"](
          Autofarm["settings"]["timebetween"] * 1000,
          Autofarm["settings"]["timebetween"] * 1000 + 1000,
        ),
      );
    } else {
      var nextLootTime = null;
      $["each"](Autofarm["town"]["farmTowns"], function (index, farmTown) {
        var lootRemaining = farmTown["loot"] - Timestamp["now"]();
        if (nextLootTime == null) {
          nextLootTime = lootRemaining;
        } else {
          if (lootRemaining <= nextLootTime) {
            nextLootTime = lootRemaining;
          }
        }
      });
      if (Autofarm["shouldFarm"]["length"] > 0) {
        $["each"](Autofarm["shouldFarm"], function (index, farmTown) {
          var lootRemaining = farmTown["loot"] - Timestamp["now"]();
          if (nextLootTime == null) {
            nextLootTime = lootRemaining;
          } else {
            if (lootRemaining <= nextLootTime) {
              nextLootTime = lootRemaining;
            }
          }
        });
      } else {
        ConsoleLog.Log(Autofarm["town"]["name"] + " not ready yet.", 1);
      }
      Autofarm["finished"](nextLootTime);
    }
  },
  claimLoad: function (farmTown, lootOption, onComplete) {
    if (!Game["features"]["battlepoint_villages"]) {
      DataExchanger["claim_load"](
        Autofarm["town"]["id"],
        lootOption,
        Autofarm["getMethodTime"](Autofarm["town"]["id"]),
        farmTown,
        function (response) {
          Autofarm["claimLoadCallback"](farmTown, response);
          onComplete(response);
        },
      );
    } else {
      DataExchanger["frontend_bridge"](
        Autofarm["town"]["id"],
        {
          model_url:
            "FarmTownPlayerRelation/" +
            MM["getOnlyCollectionByName"]("FarmTownPlayerRelation")[
              "getRelationForFarmTown"
            ](farmTown)["id"],
          action_name: "claim",
          arguments: {
            "\x66\x61\x72\x6D\x5F\x74\x6F\x77\x6E\x5F\x69\x64": farmTown,
            "\x74\x79\x70\x65": "resources",
            "\x6F\x70\x74\x69\x6F\x6E": 1,
          },
        },
        function (response) {
          Autofarm["claimLoadCallback"](farmTown, response);
          onComplete(response);
        },
      );
    }
  },
  claimLoadCallback: function (farmTown, response) {
    if (response["success"]) {
      var satisfaction = response["satisfaction"],
        lootableHuman = response["lootable_human"];
      var farmTownId = farmTown["id"] || farmTown;
      if (response["relation_status"] === 2) {
        WMap["updateStatusInChunkTowns"](
          farmTownId,
          satisfaction,
          Timestamp["now"]() +
            Autofarm["getMethodTime"](Autofarm["town"]["id"]),
          Timestamp["now"](),
          lootableHuman,
          2,
        );
        WMap["pollForMapChunksUpdate"]();
      } else {
        WMap["updateStatusInChunkTowns"](
          farmTownId,
          satisfaction,
          Timestamp["now"]() +
            Autofarm["getMethodTime"](Autofarm["town"]["id"]),
          Timestamp["now"](),
          lootableHuman,
        );
      }
      Layout["hideAjaxLoader"]();
      ConsoleLog.Log(
        '<span style="color: #6FAE30;">' + response["success"] + "</span>",
        1,
      );
    } else {
      if (response["error"]) {
        ConsoleLog.Log(Autofarm["town"]["name"] + " " + response["error"], 1);
      }
    }
  },
  claimLoads: function (farmTownIds, lootOption, onComplete) {
    DataExchanger["claim_loads"](
      Autofarm["town"]["id"],
      farmTownIds,
      lootOption,
      Autofarm["getMethodTime"](Autofarm["town"]["id"]),
      function (response) {
        Autofarm["claimLoadsCallback"](response);
        onComplete(response);
      },
    );
  },
  getMethodTime: function (townId) {
    if (Game["features"]["battlepoint_villages"]) {
      var methodTime = Autofarm["settings"]["method"];
      $["each"](
        MM["getOnlyCollectionByName"]("Town")["getTowns"](),
        function (index, town) {
          if (town["id"] == townId) {
            if (town["getResearches"]()["hasResearch"]("booty")) {
              methodTime = Autofarm["settings"]["method"] * 2;
              return false;
            }
          }
        },
      );
      return methodTime;
    } else {
      return Autofarm["settings"]["method"];
    }
  },
  claimLoadsCallback: function (response) {
    if (response["success"]) {
      var notifications = response["notifications"],
        handledFarms = response["handled_farms"];
      $["each"](handledFarms, function (farmTownId, farmData) {
        if (farmData["relation_status"] == 2) {
          WMap["updateStatusInChunkTowns"](
            farmTownId,
            farmData["satisfaction"],
            Timestamp["now"]() +
              Autofarm["getMethodTime"](Autofarm["town"]["id"]),
            Timestamp["now"](),
            farmData["lootable_at"],
            2,
          );
          WMap["pollForMapChunksUpdate"]();
        } else {
          WMap["updateStatusInChunkTowns"](
            farmTownId,
            farmData["satisfaction"],
            Timestamp["now"]() +
              Autofarm["getMethodTime"](Autofarm["town"]["id"]),
            Timestamp["now"](),
            farmData["lootable_at"],
          );
        }
      });
      ConsoleLog.Log(
        '<span style="color: #6FAE30;">' + response["success"] + "</span>",
        1,
      );
    } else {
      if (response["error"]) {
        ConsoleLog.Log(Autofarm["town"]["name"] + " " + response["error"], 1);
      }
    }
  },
  finished: function (delaySeconds) {
    if (!Autofarm["checkEnabled"]()) {
      return false;
    }
    $["each"](ModuleManager["playerTowns"], function (index, town) {
      var relatedIndex = Autofarm["town"]["relatedTowns"]["indexOf"](
        town["id"],
      );
      if (relatedIndex != -1) {
        town["modules"]["Autofarm"]["isReadyTime"] =
          Timestamp["now"]() + delaySeconds;
      }
    });
    Autofarm["town"]["modules"]["Autofarm"]["isReadyTime"] =
      Timestamp["now"]() + delaySeconds;
    ModuleManager["Queue"]["next"]();
  },
  stop: function () {
    clearInterval(Autofarm["interval"]);
  },
  init: function () {
    ConsoleLog.Log("Initialize AutoFarm", 1);
    Autofarm["initButton"]();
    Autofarm["checkCaptain"]();
    Autofarm.loadSettings();
  },
  initButton: function () {
    ModuleManager["initButtons"]("Autofarm");
  },
  checkCaptain: function () {
    if ($(".advisor_frame.captain div")["hasClass"]("captain_active")) {
      Autofarm["isCaptain"] = true;
    }
  },
  /**
   * Load settings from local storage
   */
  loadSettings: function () {
    let _settings = localStorage.getItem("Autofarm.Settings");
    if (_settings) {
      $.extend(Autofarm.settings, JSON.parse(_settings));
    }
  },
  contentSettings: function () {
    return $("<fieldset/>", {
      id: "Autofarm_settings",
      style: "float:left; width:472px;height: 270px;",
    })
      ["append"]($("<legend/>")["html"](Autofarm["title"]))
      ["append"](
        FormBuilder["checkbox"]({
          text: "AutoStart AutoFarm.",
          id: "autofarm_autostart",
          name: "autofarm_autostart",
          checked: Autofarm["settings"]["autostart"],
          disabled: !Autofarm["hasP"],
        }),
      )
      ["append"](function () {
        var selectConfig = {
          id: "autofarm_method",
          name: "autofarm_method",
          label: "Farm method: ",
          styles: "width: 120px;",
          value: Autofarm["settings"]["method"],
          options: [
            {
              value: "300",
              name: "5 minute farm",
            },
            {
              value: "1200",
              name: "20 minute farm",
            },
            {
              value: "5400",
              name: "90 minute farm",
            },
            {
              value: "14400",
              name: "240 minute farm",
            },
          ],
          disabled: false,
        };
        if (!Autofarm["hasP"]) {
          selectConfig = $["extend"](selectConfig, {
            disabled: true,
          });
        }
        var selectBox = FormBuilder["selectBox"](selectConfig);
        if (!Autofarm["hasP"]) {
          selectBox["mousePopup"](new MousePopup("Premium required"));
        }
        return selectBox;
      })
      ["append"](function () {
        var selectConfig = {
          id: "autofarm_bewteen",
          name: "autofarm_bewteen",
          label: "Time before next farm: ",
          styles: "width: 120px;",
          value: Autofarm["settings"]["timebetween"],
          options: [
            {
              value: "1",
              name: "1-2 seconds",
            },
            {
              value: "3",
              name: "3-4 seconds",
            },
            {
              value: "5",
              name: "5-6 seconds",
            },
            {
              value: "7",
              name: "7-8 seconds",
            },
            {
              value: "9",
              name: "9-10 seconds",
            },
          ],
        };
        if (!Autofarm["hasP"]) {
          selectConfig = $["extend"](selectConfig, {
            disabled: true,
          });
        }
        var selectBox = FormBuilder["selectBox"](selectConfig);
        if (!Autofarm["hasP"]) {
          selectBox["mousePopup"](new MousePopup("Premium required"));
        }
        return selectBox;
      })
      ["append"](
        FormBuilder["checkbox"]({
          text: "Skip farm when warehouse is full.",
          id: "autofarm_warehousefull",
          name: "autofarm_warehousefull",
          checked: Autofarm["settings"]["skipwhenfull"],
          disabled: !Autofarm["hasP"],
        }),
      )
      ["append"](
        FormBuilder["checkbox"]({
          text: "Lowest resources first with more towns on one island.",
          id: "autofarm_lowresfirst",
          name: "autofarm_lowresfirst",
          checked: Autofarm["settings"]["lowresfirst"],
          disabled: !Autofarm["hasP"],
        }),
      )
      ["append"](
        FormBuilder["checkbox"]({
          text: "Stop loot farm until mood is below 80%.",
          id: "autofarm_loot",
          name: "autofarm_loot",
          checked: Autofarm["settings"]["stoplootbelow"],
          disabled: !Autofarm["hasP"],
        }),
      )
      ["append"](
        FormBuilder["button"]({
          name: DM["getl10n"]("notes")["btn_save"],
          class: !Autofarm["hasP"] ? " disabled" : "",
          style: "top: 62px;",
        })["on"]("click", function () {
          if (!Autofarm["hasP"]) {
            return false;
          }
          var formData = $("#Autofarm_settings")["serializeObject"]();
          Autofarm["settings"]["autostart"] =
            formData["autofarm_autostart"] != undefined;
          Autofarm["settings"]["method"] = parseInt(
            formData["autofarm_method"],
          );
          Autofarm["settings"]["timebetween"] = parseInt(
            formData["autofarm_bewteen"],
          );
          Autofarm["settings"]["skipwhenfull"] =
            formData["autofarm_warehousefull"] != undefined;
          Autofarm["settings"]["lowresfirst"] =
            formData["autofarm_lowresfirst"] != undefined;
          Autofarm["settings"]["stoplootbelow"] =
            formData["autofarm_loot"] != undefined;

          localStorage.setItem(
            "Autofarm.Settings",
            JSON.stringify(Autofarm.settings),
          );

          ConsoleLog.Log("Settings saved", 1);
          HumanMessage["success"]("The settings were saved!");
        }),
      );
  },
};
