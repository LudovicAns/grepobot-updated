/**
 * ModuleManager: central coordinator for modules and town task queue.
 * Responsibilities: manage towns, scheduling, and module buttons.
 */
ModuleManager = {
  models: {
    Town: function () {
      // Lightweight town model used by the bot queue.
      this.key = null;
      this.id = null;
      this.name = null;
      this.farmTowns = {};
      this.relatedTowns = [];
      this.currentFarmCount = 0;
      this.modules = {
        Autofarm: {
          isReadyTime: 0,
        },
        Autoculture: {
          isReadyTime: 0,
        },
        Autobuild: {
          isReadyTime: 0,
        },
      };
      this.startFarming = function () {
        Autofarm.startFarming(this);
      };
      this.startCulture = function () {
        Autoculture.startCulture(this);
      };
      this.startBuild = function () {
        Autobuild.startBuild(this);
      };
    },
  },
  Queue: {
    total: 0,
    queue: [],
    // Simple FIFO queue to serialize module work.
    /**
     * Add item to the queue
     * @param {Item addded to queue} _item
     */
    add: function (_item) {
      this.total++;
      this.queue.push(_item);
    },
    /**
     * Start the queue
     */
    start: function () {
      this.next();
    },
    /**
     * Stop the queue
     */
    stop: function () {
      this.queue = [];
    },
    isRunning: function () {
      return this.queue.length > 0 || this.total > 0;
    },
    /**
     * Execute the next item in queue
     */
    next: function () {
      ModuleManager.updateTimer();
      var _nextQueueItem = this.queue.shift();
      // if this is not null, execute it
      if (_nextQueueItem) {
        _nextQueueItem.fx();
        //Queue is empty
      } else {
        if (this.queue.length <= 0) {
          this.total = 0;
          ModuleManager.finished();
        }
      }
    },
  },
  currentTown: null,
  playerTowns: [],
  /**
   * ID of the interval timing the next cycle
   */
  interval: false,
  modules: {
    Autofarm: {
      isOn: false,
    },
    Autoculture: {
      isOn: false,
    },
    Autobuild: {
      isOn: false,
    },
    Autoattack: {
      isOn: false,
    },
  },
  /**
   * Initilize the Autobuild feature
   */
  init: function () {
    ModuleManager.loadPlayerTowns();
    ModuleManager.initButtons();
    ModuleManager.initTimer();
  },
  /**
   * Start function to decide which feature should start or get the lowest timer to next start
   */
  start: function () {
    var queueNotEmpty = false;
    var nextTimestamp = null;
    $.each(ModuleManager.playerTowns, function (index, town) {
      //Autofarm
      if (typeof Autofarm !== "undefined") {
        var readyStatus = Autofarm.checkReady(town);
        if (readyStatus == true) {
          queueNotEmpty = true;
          ModuleManager.Queue.add({
            townId: town.id,
            fx: function () {
              town.startFarming();
            },
          });
        } else {
          if (
            readyStatus != false &&
            (nextTimestamp == null || readyStatus < nextTimestamp)
          ) {
            nextTimestamp = readyStatus;
          }
        }
      }
      //Autoculture
      if (typeof Autoculture !== "undefined") {
        var readyStatus = Autoculture["checkReady"](town);
        if (readyStatus == true) {
          queueNotEmpty = true;
          ModuleManager.Queue.add({
            townId: town.id,
            fx: function () {
              town.startCulture();
            },
          });
        } else {
          if (
            readyStatus != false &&
            (nextTimestamp == null || readyStatus < nextTimestamp)
          ) {
            nextTimestamp = readyStatus;
          }
        }
      }
      //Autobuild
      if (typeof Autobuild !== "undefined") {
        var readyStatus = Autobuild["checkReady"](town);
        if (readyStatus == true) {
          queueNotEmpty = true;
          ModuleManager.Queue.add({
            townId: town.id,
            fx: function () {
              town.startBuild();
            },
          });
        } else {
          if (
            readyStatus != false &&
            (nextTimestamp == null || readyStatus < nextTimestamp)
          ) {
            nextTimestamp = readyStatus;
          }
        }
      }
    });
    if (nextTimestamp === null && !queueNotEmpty) {
      ConsoleLog.Log("Nothing is ready yet!", 0);
      ModuleManager.startTimer(30, function () {
        ModuleManager.start();
      });
    } else {
      if (!queueNotEmpty) {
        var nextInterval = nextTimestamp - Timestamp.now() + 10;
        ModuleManager.startTimer(nextInterval, function () {
          ModuleManager.start();
        });
      } else {
        ModuleManager.Queue.start();
      }
    }
  },
  /**
   * Stop the bot.
   */
  stop: function () {
    clearInterval(ModuleManager.interval);
    ModuleManager["Queue"]["stop"]();
    $("#time_autobot .caption .value_container .curr")["html"]("Stopped");
  },
  /**
   * On finish the queue cycle, call the start function to get the next timer
   */
  finished: function () {
    ModuleManager.start();
  },
  /**
   * Put the "Start GrepoBot Updated" text into the timer window
   */
  initTimer: function () {
    $(".nui_main_menu").css("top", "276px");
    $("#time_autobot")
      .append(
        FormBuilder.timerBoxSmall({
          id: "Autofarm_timer",
          styles: "",
          text: "Start GrepoBot Updated",
        }),
      )
      .show();
  },
  /**
   * Updates the timer for progress of actual queue
   */
  updateTimer: function (/*_0xa6b2xb, _0xa6b2xc*/) {
    var _progress = 0;
    /*if (typeof _0xa6b2xb !== 'undefined' && typeof _0xa6b2xc !== 'undefined') {*/
    //_0xa6b2xd = (((ModuleManager.Queuetotal - (ModuleManager.Queue.queue.length + 1)) + (_0xa6b2xc / _0xa6b2xb)) / ModuleManager['Queue']['total'] * 100)
    //} else {
    _progress =
      ((ModuleManager.Queue.total - ModuleManager.Queue.queue.length) /
        ModuleManager.Queue.total) *
      100;
    //};
    if (!isNaN(_progress)) {
      $("#time_autobot .progress .indicator").width(_progress + "%");
      $("#time_autobot .caption .value_container .curr").html(
        Math.round(_progress) + "%",
      );
    }
  },
  checkAutostart: function () {
    if (Autofarm["settings"]["autostart"]) {
      ModuleManager["modules"]["Autofarm"]["isOn"] = true;
      var toggleEl = $("#Autofarm_onoff");
      toggleEl["addClass"]("on");
      toggleEl["find"]("span")["mousePopup"](new MousePopup("Stop Autofarm"));
    }
    if (Autoculture["settings"]["autostart"]) {
      ModuleManager["modules"]["Autoculture"]["isOn"] = true;
      var toggleEl = $("#Autoculture_onoff");
      toggleEl["addClass"]("on");
      toggleEl["find"]("span")["mousePopup"](
        new MousePopup("Stop Autoculture"),
      );
    }
    if (Autobuild["settings"]["autostart"]) {
      ModuleManager["modules"]["Autobuild"]["isOn"] = true;
      var toggleEl = $("#Autobuild_onoff");
      toggleEl["addClass"]("on");
      toggleEl["find"]("span")["mousePopup"](new MousePopup("Stop Autobuild"));
    }
    if (
      Autofarm["settings"]["autostart"] ||
      Autoculture["settings"]["autostart"] ||
      Autobuild["settings"]["autostart"]
    ) {
      ModuleManager["start"]();
    }
  },
  /**
   * Timer that ticks every second to check if Queue has to start
   * @param {*} _0xa6b2xf
   * @param {Starts after the interval elapsed} _callback
   */
  startTimer: function (intervalSeconds, onComplete) {
    var initialInterval = intervalSeconds;
    ModuleManager.interval = setInterval(function () {
      $("#time_autobot .caption .value_container .curr")["html"](
        Autobot["toHHMMSS"](intervalSeconds),
      );
      $("#time_autobot .progress .indicator")["width"](
        ((initialInterval - intervalSeconds) / initialInterval) * 100 + "%",
      );
      intervalSeconds--;
      if (intervalSeconds < 0) {
        clearInterval(ModuleManager["interval"]);
        onComplete();
      }
    }, 1000);
  },
  initButtons: function (moduleName) {
    var toggleEl = $("#" + moduleName + "_onoff");
    toggleEl["removeClass"]("disabled");
    toggleEl["on"]("click", function (event) {
      event["preventDefault"]();
      if (moduleName == "Autoattack" && !Autobot["checkPremium"]("captain")) {
        HumanMessage["error"](
          Game["premium_data"]["captain"]["name"] +
            " " +
            DM["getl10n"]("premium")["advisors"]["not_activated"][
              "toLowerCase"
            ]() +
            ".",
        );
        return false;
      }
      if (ModuleManager["modules"][moduleName]["isOn"] == true) {
        ModuleManager["modules"][moduleName]["isOn"] = false;
        toggleEl["removeClass"]("on");
        toggleEl["find"]("span")["mousePopup"](
          new MousePopup("Start " + moduleName),
        );
        HumanMessage["success"](moduleName + " is deactivated.");
        ConsoleLog.Log(moduleName + " is deactivated.", 0);
        if (moduleName == "Autofarm") {
          Autofarm["stop"]();
        } else {
          if (moduleName == "Autoculture") {
            Autoculture["stop"]();
          } else {
            if (moduleName == "Autobuild") {
              Autobuild["stop"]();
            } else {
              if (moduleName == "Autoattack") {
                Autoattack["stop"]();
              }
            }
          }
        }
      } else {
        if (ModuleManager["modules"][moduleName]["isOn"] == false) {
          toggleEl["addClass"]("on");
          HumanMessage["success"](moduleName + " is activated.");
          ConsoleLog.Log(moduleName + " is activated.", 0);
          toggleEl["find"]("span")["mousePopup"](
            new MousePopup("Stop " + moduleName),
          );
          ModuleManager["modules"][moduleName]["isOn"] = true;
          if (moduleName == "Autoattack") {
            Autoattack["start"]();
          }
        }
      }
      if (moduleName != "Autoattack") {
        ModuleManager["checkWhatToStart"]();
      }
    });
    toggleEl["find"]("span")["mousePopup"](
      new MousePopup("Start " + moduleName),
    );
  },
  checkWhatToStart: function () {
    var activeModulesCount = 0;
    $["each"](ModuleManager["modules"], function (moduleName, moduleConfig) {
      if (moduleConfig["isOn"] && moduleConfig != "Autoattack") {
        activeModulesCount++;
      }
    });
    if (activeModulesCount == 0) {
      ModuleManager["stop"]();
    } else {
      if (activeModulesCount >= 0 && !ModuleManager["Queue"]["isRunning"]()) {
        clearInterval(ModuleManager["interval"]);
        ModuleManager["start"]();
      }
    }
  },
  loadPlayerTowns: function () {
    var townIndex = 0;
    $["each"](ITowns["towns"], function (index, town) {
      var townModel = new ModuleManager["models"]["Town"]();
      townModel["key"] = townIndex;
      townModel["id"] = town["id"];
      townModel["name"] = town["name"];
      $["each"](ITowns["towns"], function (index, relatedTown) {
        if (
          town["getIslandCoordinateX"]() ==
            relatedTown["getIslandCoordinateX"]() &&
          town["getIslandCoordinateY"]() ==
            relatedTown["getIslandCoordinateY"]() &&
          town["id"] != relatedTown["id"]
        ) {
          townModel["relatedTowns"]["push"](relatedTown["id"]);
        }
      });
      ModuleManager["playerTowns"]["push"](townModel);
      townIndex++;
    });
    ModuleManager["playerTowns"]["sort"](function (townA, townB) {
      var nameA = townA["name"],
        nameB = townB["name"];
      if (nameA == nameB) {
        return 0;
      }
      return nameA > nameB ? 1 : -1;
    });
  },
  loadModules: function () {
    Autobot["isLogged"] = true;
    //Autobot['trial_time'] = _0xa6b2x1e['trial_time'];
    //Autobot['premium_time'] = _0xa6b2x1e['premium_time'];
    //Autobot['facebook_like'] = _0xa6b2x1e['facebook_like'];
    //if (_0xa6b2x1e['assistant_settings'] != '') {
    //    Assistant['setSettings'](_0xa6b2x1e['assistant_settings'])
    //};
    /*if (!_0xa6b2x1e['player_email']) {
            Autobot['verifyEmail']()
        };*/
    //if (Autobot['trial_time'] - Timestamp['now']() >= 0 || Autobot['premium_time'] - Timestamp['now']() >= 0) {
    if (
      typeof Autofarm == "undefined" &&
      typeof Autoculture == "undefined" &&
      typeof Autobuild == "undefined" &&
      typeof Autoattack == "undefined"
    ) {
      $["when"](
        $["ajax"]({
          method: "GET",
          //data: Autobot['Account'],
          url: Autobot["domain"] + "Autofarm.js",
          dataType: "script",
        }),
        $["ajax"]({
          method: "GET",
          //data: Autobot['Account'],
          url: Autobot["domain"] + "Autoculture.js",
          dataType: "script",
        }),
        $["ajax"]({
          method: "GET",
          //data: Autobot['Account'],
          url: Autobot["domain"] + "Autobuild.js",
          dataType: "script",
        }),
        $["ajax"]({
          method: "GET",
          //data: Autobot['Account'],
          url: Autobot["domain"] + "Autoattack.js",
          dataType: "script",
        }),
        $.Deferred(function (deferred) {
          $(deferred["resolve"]);
        }),
      )["done"](function () {
        ModuleManager["init"]();
        Autofarm["init"]();
        //Autofarm['setSettings'](_0xa6b2x1e['autofarm_settings']);
        Autoculture["init"]();
        //Autoculture['setSettings'](_0xa6b2x1e['autoculture_settings']);
        Autobuild["init"]();
        //Autobuild['setSettings'](_0xa6b2x1e['autobuild_settings']);
        //Autobuild['setQueue'](_0xa6b2x1e['building_queue'], _0xa6b2x1e['units_queue'], _0xa6b2x1e['ships_queue']);
        Autoattack["init"]();
        ModuleManager["checkAutostart"]();
      });
    }
    /*} else {
            if (typeof Autofarm == 'undefined') {
                $['when']($['ajax']({
                    method: 'GET',
                    //data: Autobot['Account'],
                    url: Autobot['domain'] + 'Autofarm.js',
                    dataType: 'script'
                }), $.Deferred(function(_0xa6b2x1f) {
                    $(_0xa6b2x1f['resolve'])
                }))['done'](function() {
                    ModuleManager['init']();
                    Autofarm['init']()
                })
            };
            $('#Autoculture_onoff')['mousePopup'](new MousePopup(ModuleManager['requiredPrem']));
            $('#Autobuild_onoff')['mousePopup'](new MousePopup(ModuleManager['requiredPrem']));
            $('#Autoattack_onoff')['mousePopup'](new MousePopup(ModuleManager['requiredPrem']));
            Autobot['createNotification']('getPremiumNotification', 'Unfortunately your premium membership is over. Please upgrade now!')
        }*/
  },
  requiredPrem:
    DM["getl10n"]("tooltips")["requirements"]["replace"](".", "") + " premium",
};
