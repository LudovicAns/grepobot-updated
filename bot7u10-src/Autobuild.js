/**
 * Autobuild feature for automatic build buildings and units
 */
Autobuild = {
  settings: {
    autostart: false,
    enable_building: true,
    enable_units: true,
    enable_ships: true,
    timeinterval: 120,
    instant_buy: false,
  },
  building_queue: {},
  town_queues: [],
  town: null,
  iTown: null,
  interval: null,
  currentWindow: null,
  isCaptain: false,
  isCurator: false,
  Queue: 0,
  buildingQueueMax: 0,

  /**
   * Initilize Autobuild
   */
  init: function () {
    ConsoleLog.Log("Initialize Autobuild", 3);
    Autobuild.initFunction();
    Autobuild.initButton();
    Autobuild.checkCaptain();
    Autobuild.activateCss();
    Autobuild.loadSettings();
    Autobuild.loadQueue();
  },
  /**
   * Load the Autobuild settings from local storage
   */
  loadSettings: function () {
    let _settings = localStorage.getItem("Autobuild.Settings");
    if (_settings) {
      $.extend(Autobuild.settings, JSON.parse(_settings));
    }
  },
  /**
   * Add css class to show Autobuild is active
   */
  activateCss: function () {
    $(".construction_queue_order_container").addClass("active");
  },
  /**
   * Load the queue from local storage
   */
  loadQueue: function () {
    let _queues = localStorage.getItem("Autobuild.Queue");
    if (_queues) {
      Autobuild.town_queues = JSON.parse(_queues);
    }
    $.each(Autobuild.town_queues, function (_index, _queue) {
      if (_queue && _queue.building_queue) {
        $.each(_queue.building_queue, function (_entryIndex, _entry) {
          if (_entry && _entry.item_name) {
            _entry.item_name = Autobuild.normalizeBuildingId(_entry.item_name);
          }
        });
      }
    });
    localStorage.setItem(
      "Autobuild.Queue",
      JSON.stringify(Autobuild.town_queues),
    );
  },
  /**
   * React to ajax response
   * @param {Action from Ajax Response} _action
   */
  calls: function (_action) {
    switch (_action) {
      case "building_main/index":
      case "building_main/build":
      case "building_main/cancel":
      case "building_main/tear_down":
        Autobuild.windows.building_main_index(_action);
        break;
      case "building_barracks/index":
      case "building_barracks/build":
      case "building_barracks/cancel":
      case "building_barracks/tear_down":
        Autobuild.windows.building_barracks_index(_action);
        break;
    }
  },
  initFunction: function () {
    var _renderQueue = function (_originalRenderQueue) {
      return function () {
        _originalRenderQueue["apply"](this, arguments);
        var ordersView = this.$el;
        if (!ordersView.hasClass("ui_various_orders")) {
          ordersView = this.$el.find(".ui_various_orders");
        }
        if (ordersView.length > 0) {
          var ordersEl = ordersView.first();
          if (ordersEl.hasClass("type_building_queue")) {
            Autobuild["initQueue"](this.$el, "building");
            return;
          }
          if (ordersEl.hasClass("barracks")) {
            Autobuild["initQueue"](this.$el, "unit");
            return;
          }
          if (ordersEl.hasClass("docks")) {
            Autobuild["initQueue"](this.$el, "ship");
            return;
          }
        }
        if (
          this.$el.closest("#building_tasks_main").length > 0 ||
          this.$el.find("#building_tasks_main").length > 0
        ) {
          Autobuild["initQueue"](this.$el, "building");
          return;
        }
        if (
          this.$el.closest("#unit_orders_queue").length > 0 ||
          this.$el.find("#unit_orders_queue").length > 0
        ) {
          var unitOrdersView = this.$el.find(".ui_various_orders");
          if (unitOrdersView["hasClass"]("barracks")) {
            Autobuild["initQueue"](this.$el, "unit");
          } else {
            if (unitOrdersView["hasClass"]("docks")) {
              Autobuild["initQueue"](this.$el, "ship");
            }
          }
        }
      };
    };
    GameViews["ConstructionQueueBaseView"]["prototype"]["renderQueue"] =
      _renderQueue(
        GameViews["ConstructionQueueBaseView"]["prototype"]["renderQueue"],
      );
    var wrapSelectUnit = function (originalSelectUnit) {
      return function () {
        originalSelectUnit["apply"](this, arguments);
        if (this["barracks"]) {
          Autobuild["initUnitOrder"](this, "unit");
        } else {
          if (!this["barracks"]) {
            Autobuild["initUnitOrder"](this, "ship");
          }
        }
      };
    };
    UnitOrder["selectUnit"] = wrapSelectUnit(UnitOrder["selectUnit"]);
  },
  /**
   * Initilize the Buttons for Autobuild
   */
  initButton: function () {
    ModuleManager["initButtons"]("Autobuild");
  },
  /**
   * Check if Captain is active: Set Queue length to 7.
   */
  checkCaptain: function () {
    if ($(".advisor_frame.captain div").hasClass("captain_active")) {
      Autobuild.isCaptain = true;
    }
    if ($(".advisor_frame.curator div").hasClass("curator_active")) {
      Autobuild.isCurator = true;
    }
    Autobuild.Queue = Autobuild.isCurator ? 7 : 2;
  },
  /**
   * Check if current town can build
   * @param {Current Town} _town
   */
  checkReady: function (_town) {
    var _iTown = ITowns.towns[_town.id];
    //if Autobuild is off
    if (!ModuleManager.modules.Autobuild.isOn) {
      return false;
    }
    //Town has conqueror
    if (_iTown.hasConqueror()) {
      return false;
    }
    //nothing is enabled for town
    if (
      !Autobuild.settings.enable_building &&
      !Autobuild.settings.enable_units &&
      !Autobuild.settings.enable_ships
    ) {
      return false;
    }
    //is not ready
    if (_town.modules.Autobuild.isReadyTime >= Timestamp.now()) {
      return _town.modules.Autobuild.isReadyTime;
    }
    //is any bot queue not empty
    if (
      Autobuild.town_queues.filter((e) => e.town_id === _town.id).length > 0
    ) {
      let current_town = Autobuild.town_queues.find(
        (e) => e.town_id === _town.id,
      );
      return (
        current_town.building_queue.length > 0 ||
        current_town.unit_queue.length > 0 ||
        current_town.ship_queue.length > 0 ||
        (GameDataInstantBuy.isEnabled() && Autobuild.settings.instant_buy)
      );
    }
    //Instant buy is enabled
    return GameDataInstantBuy.isEnabled() && Autobuild.settings.instant_buy;
  },

  /**
   * Start point for Autobuild cycle
   * @param {Town} _town
   */
  startBuild: function (_town) {
    //if not enabled
    if (!Autobuild.checkEnabled()) {
      return false;
    }
    Autobuild.town = _town;
    Autobuild.iTown = ITowns.towns[Autobuild.town.id];
    if (ModuleManager.currentTown != Autobuild.town.key) {
      ConsoleLog.Log(Autobuild.town.name + " move to town.", 3);
      ModuleManager.currentTown = Autobuild.town.key;
    }
    /*DataExchanger.switch_town(Autobuild.town.id, function () {
                ModuleManager.currentTown = Autobuild.town.key;
                Autobuild.startUpgrade();
            })*/
    Autobuild.startUpgrade();
  },

  /**
   * Check if a building is autocompletable
   */
  startUpgrade: function () {
    if (!Autobuild.checkEnabled()) {
      return false;
    }

    if (
      GameDataInstantBuy.isEnabled() &&
      Autobuild.checkInstantComplete(Autobuild.town.id)
    ) {
      //Timeout before instant buy
      Autobuild.interval = setTimeout(
        function () {
          //send request to instant buy town
          DataExchanger.frontend_bridge(
            Autobuild.town.id,
            {
              model_url: "BuildingOrder/" + Autobuild.instantBuyTown.order_id,
              action_name: "buyInstant",
              arguments: {
                order_id: Autobuild.instantBuyTown.order_id,
              },
              town_id: Autobuild.town.id,
              nl_init: true,
            },
            function (_response) {
              if (_response.success) {
                //refresh queue
                if (Autobuild.town.id == Game.townId) {
                  let _buildingWindows = GPWindowMgr.getByType(
                    GPWindowMgr.TYPE_BUILDING,
                  );
                  for (let i = 0; _buildingWindows.length > i; i++) {
                    _buildingWindows[i].getHandler().refresh();
                  }
                }
                //if current town is not the selected town, sometimes the completed building remains in the queue
                if (
                  MM.getModels().BuildingOrder[
                    Autobuild.instantBuyTown.order_id
                  ]
                ) {
                  delete MM.getModels().BuildingOrder[
                    Autobuild.instantBuyTown.order_id
                  ];
                }

                ConsoleLog.Log(
                  '<span style="color: #ffa03d;">' +
                    Autobuild.instantBuyTown.building_name.capitalize() +
                    " - " +
                    _response.success +
                    "</span>",
                  3,
                );
              }
              if (_response.error) {
                ConsoleLog.Log(
                  Autobuild["town"]["name"] + " " + _response.error,
                  3,
                );
              }
              //timeout before continuing queue
              Autobuild.interval = setTimeout(
                function () {
                  Autobuild.instantBuyTown = false;
                  Autobuild.startQueueing();
                },
                Autobot.randomize(500, 700),
              );
            },
          );
        },
        Autobot.randomize(1000, 2000),
      );
      //if no instant buy is available or not activated
    } else {
      Autobuild.startQueueing();
    }
  },

  /**
   * Start to add items from bot queue to ingame queue
   */
  startQueueing: function () {
    if (!Autobuild.checkEnabled()) {
      return;
    }
    //If this town doesnt have any queues, finish
    if (
      Autobuild.town_queues.filter((e) => e.town_id === Autobuild.town.id)
        .length <= 0
    ) {
      Autobuild.finished();
      return;
    }

    //which to start next
    var _startNext = Autobuild.getReadyTime(Autobuild.town.id).shouldStart;
    switch (_startNext) {
      case "building":
        Autobuild.startBuildBuilding();
        break;
      case "unit":
      case "ship":
        Autobuild.startBuildUnits(_startNext);
        break;
      default:
        Autobuild.finished();
        break;
    }
  },

  /**
   * Start to build buildings
   */
  startBuildBuilding: function () {
    if (!Autobuild.checkEnabled()) {
      return false;
    }
    //check if town has building queues
    if (
      Autobuild.town_queues.filter((e) => e.town_id === Autobuild.town.id)
        .length > 0
    ) {
      let current_town_queue = Autobuild.town_queues.find(
        (e) => e.town_id === Autobuild.town.id,
      ).building_queue;

      //if there is something to build
      if (current_town_queue.length > 0) {
        //timeout before build
        Autobuild.interval = setTimeout(
          function () {
            ConsoleLog.Log(
              Autobuild.town.name + " getting building information.",
              3,
            );
            DataExchanger.building_main(
              Autobuild.town.id,
              function (_response_building_main) {
                if (Autobuild.hasFreeBuildingSlots(_response_building_main)) {
                  var _firstBuilding = current_town_queue[0];
                  //search the building in the response
                  var _building_from_resp = Autobuild.getBuildings(
                    _response_building_main,
                  )[_firstBuilding.item_name];
                  //if the building is upgradeable
                  if (_building_from_resp.can_upgrade) {
                    DataExchanger.frontend_bridge(
                      Autobuild.town.id,
                      {
                        model_url: "BuildingOrder",
                        action_name: "buildUp",
                        arguments: {
                          building_id: _firstBuilding.item_name,
                        },
                        town_id: Autobuild.town.id,
                        nl_init: true,
                      },
                      function (_response_buildUp) {
                        if (_response_buildUp.success) {
                          if (Autobuild.town.id == Game.townId) {
                            let _buildingWindows = GPWindowMgr.getByType(
                              GPWindowMgr.TYPE_BUILDING,
                            );
                            for (let i = 0; _buildingWindows.length > i; i++) {
                              _buildingWindows[i].getHandler().refresh();
                            }
                          }
                          ConsoleLog.Log(
                            '<span style="color: #ffa03d;">' +
                              _firstBuilding.item_name.capitalize() +
                              " - " +
                              _response_buildUp.success +
                              "</span>",
                            3,
                          );

                          Autobuild.saveBuilding({
                            type: "remove",
                            town_id: Game["townId"],
                            item_id: _firstBuilding["id"],
                          });

                          $(".queue_id_" + _firstBuilding.id).remove();
                        }
                        if (_response_buildUp.error) {
                          ConsoleLog.Log(
                            Autobuild.town.name + " " + _response_buildUp.error,
                            3,
                          );
                        }
                        Autobuild.finished();
                      },
                    );
                  } else {
                    if (!_building_from_resp.enough_population) {
                      ConsoleLog.Log(
                        Autobuild.town.name +
                          " not enough population for " +
                          _firstBuilding.item_name +
                          ".",
                        3,
                      );
                      Autobuild.finished();
                    } else {
                      if (!_building_from_resp.enough_resources) {
                        ConsoleLog.Log(
                          Autobuild.town.name +
                            " not enough resources for " +
                            _firstBuilding.item_name +
                            ".",
                          3,
                        );
                        Autobuild.finished();
                      } else {
                        ConsoleLog.Log(
                          Autobuild.town.name +
                            " " +
                            _firstBuilding.item_name +
                            " can not be started due dependencies.",
                          3,
                        );

                        Autobuild.saveBuilding({
                          type: "remove",
                          town_id: Game.townId,
                          item_id: _firstBuilding.id,
                        });

                        $(".queue_id_" + _firstBuilding.id).remove();
                        Autobuild.finished();
                      }
                    }
                  }
                } else {
                  ConsoleLog.Log(
                    Autobuild.town.name + " no free building slots available.",
                    3,
                  );
                  Autobuild.finished();
                }
              },
            );
          },
          Autobot.randomize(1000, 2000),
        );
      } else {
        Autobuild.finished();
      }
    } else {
      Autobuild.finished();
    }
  },

  /**
   * Start to build units (barracks or ships)
   * @param {Which queue to start} _queue
   */
  startBuildUnits: function (_queue) {
    if (!Autobuild["checkEnabled"]()) {
      return false;
    }
    //check if town has building queues
    if (
      Autobuild.town_queues.filter((e) => e.town_id === Autobuild.town.id)
        .length > 0
    ) {
      //get unit or ship queue
      let current_town_queue = Autobuild.town_queues.find(
        (e) => e.town_id === Autobuild.town.id,
      )[_queue + "_queue"];
      //if queue is not empty
      if (current_town_queue.length > 0) {
        var _firstQueueItem = current_town_queue[0];
        if (
          GameDataUnits.getMaxBuildForSingleUnit(_firstQueueItem.item_name) >=
          _firstQueueItem.count
        ) {
          Autobuild.interval = setTimeout(
            function () {
              DataExchanger.building_barracks(
                Autobuild.town.id,
                {
                  unit_id: _firstQueueItem.item_name,
                  amount: _firstQueueItem.count,
                  town_id: Autobuild.town.id,
                  nl_init: true,
                },
                function (_response) {
                  if (_response.error) {
                    ConsoleLog.Log(
                      Autobuild.town.name + " " + _response.error,
                      3,
                    );
                  } else {
                    //if successfull: remove the item from the bot queue
                    if (Autobuild.town.id == Game.townId) {
                      var _buildingWindows = GPWindowMgr.getByType(
                        GPWindowMgr.TYPE_BUILDING,
                      );
                      for (let i = 0; _buildingWindows.length > i; i++) {
                        _buildingWindows[i].getHandler().refresh();
                      }
                    }
                    ConsoleLog.Log(
                      '<span style="color: ' +
                        (_queue == "unit" ? "#ffe03d" : "#3dadff") +
                        ';">Units - ' +
                        _firstQueueItem.count +
                        " " +
                        GameData.units[_firstQueueItem.item_name].name_plural +
                        " added.</span>",
                      3,
                    );

                    Autobuild.saveUnits({
                      action: "remove",
                      town_id: Game.townId,
                      item_id: _firstQueueItem.id,
                      type: _queue,
                    });

                    $(".queue_id_" + _firstQueueItem.id).remove();
                  }
                  Autobuild.finished();
                },
              );
            },
            Autobot.randomize(1000, 2000),
          );
        } else {
          ConsoleLog.Log(
            Autobuild.town.name +
              " recruiting " +
              _firstQueueItem.count +
              " " +
              GameData.units[_firstQueueItem.item_name].name_plural +
              " not ready.",
            3,
          );
          Autobuild.finished();
        }
      } else {
        Autobuild.finished();
      }
    } else {
      Autobuild.finished();
    }
  },

  /**
   * Calculate the next queue to build and the time left until the building should start
   * @param {ID of the town} _townId
   */
  getReadyTime: function (_townId) {
    var _queues = {
      building: {
        queue: [],
        timeLeft: 0,
      },
      unit: {
        queue: [],
        timeLeft: 0,
      },
      ship: {
        queue: [],
        timeLeft: 0,
      },
    };
    if (MM.getModels().BuildingOrder) {
      $.each(MM.getModels().BuildingOrder, function (_index, _element) {
        if (_townId == _element.getTownId()) {
          _queues.building.queue.push({
            type: "building",
            model: _element,
          });
          if (_queues.building.timeLeft == 0) {
            _queues.building.timeLeft = _element.getTimeLeft();
          }
        }
      });
    }

    if (MM.getModels().UnitOrder) {
      $.each(MM.getModels().UnitOrder, function (_index, _element) {
        if (_townId == _element.attributes.town_id) {
          if (_element.attributes.kind == "ground") {
            _queues.unit.queue.push({
              type: "unit",
              model: _element,
            });
            if (_queues.unit.timeLeft == 0) {
              _queues.unit.timeLeft = _element.getTimeLeft();
            }
          }
          if (_element.attributes.kind == "naval") {
            _queues.ship.queue.push({
              type: "ship",
              model: _element,
            });
            if (_queues.ship.timeLeft == 0) {
              _queues.ship.timeLeft = _element.getTimeLeft();
            }
          }
        }
      });
    }
    var _readyTime = -1;
    var _doNext = "nothing";
    //check which bot queue has elements and take the one which has the lowest timeLeft
    $.each(_queues, function (_type, _model) {
      if (
        Autobuild.town_queues.filter((e) => e.town_id === _townId).length > 0
      ) {
        let current_town = Autobuild.town_queues.find(
          (e) => e.town_id === _townId,
        );
        if (
          (_type == "building" && current_town.building_queue.length > 0) ||
          (_type == "unit" && current_town.unit_queue.length > 0) ||
          (_type == "ship" && current_town.ship_queue.length > 0)
        ) {
          if (_readyTime == -1) {
            _readyTime = _model.timeLeft;
            _doNext = _type;
          } else {
            if (_model.timeLeft < _readyTime) {
              _readyTime = _model.timeLeft;
              _doNext = _type;
            }
          }
          //if there is space in the queue, start after the interval
          var _queueLimit =
            _type == "building" && Autobuild.buildingQueueMax > 0
              ? Autobuild.buildingQueueMax
              : Autobuild.Queue;
          if (_queues[_type].queue.length < _queueLimit) {
            _readyTime = +Autobuild.settings.timeinterval;
            _doNext = _type;
          }
        }
      }
    });
    //if instant buy is enabled
    if (GameDataInstantBuy.isEnabled() && Autobuild.settings.instant_buy) {
      //if there are buildings in the queue
      if (_queues.building.queue.length > 0) {
        let _firstBuildingTime =
          _queues.building.queue[0].model.getTimeLeft() - 300;
        if (_firstBuildingTime <= 0) {
          _firstBuildingTime = 0;
        }
        if (
          _firstBuildingTime < _readyTime ||
          _firstBuildingTime <= +Autobuild.settings.timeinterval
        ) {
          _readyTime = _firstBuildingTime;
        }
      }
    }
    return {
      readyTime:
        Timestamp.now() +
        (_readyTime >= 0 ? _readyTime : +Autobuild.settings.timeinterval),
      shouldStart: _doNext,
    };
  },
  /**
   * Stop Autobuild
   */
  stop: function () {
    clearInterval(Autobuild.interval);
  },
  /**
   * Check if Autobuild is enabled
   */
  checkEnabled: function () {
    return ModuleManager.modules.Autobuild.isOn;
  },
  /**
   * Called on the end of the Autobuild Queue.
   */
  finished: function () {
    if (!Autobuild.checkEnabled()) {
      return false;
    }
    Autobuild.town.modules.Autobuild.isReadyTime = Autobuild.getReadyTime(
      Autobuild.town.id,
    ).readyTime;
    ModuleManager.Queue.next();
  },
  /**
   * Check if a Building in the town has only 5 minutes left
   * @param {Town ID} _townId
   */
  checkInstantComplete: function (_townId) {
    Autobuild.instantBuyTown = false;
    $.each(MM.getModels().BuildingOrder, function (_index, _element) {
      if (_townId == _element.getTownId() && _element.getTimeLeft() < 300) {
        Autobuild.instantBuyTown = {
          order_id: _element.id,
          building_name: _element.getBuildingId(),
        };
        return false;
      }
    });
    return Autobuild.instantBuyTown;
  },
  /**
   * Check if the building can be upgraded
   * @param {ID of the building} _buildingId
   * @param {iTown Object of the town} _iTown
   */
  checkBuildingDependencies: function (_buildingId, _iTown) {
    var _building = GameData.buildings[_buildingId],
      _AllDependencies = _building.dependencies,
      _iTownBuildings = _iTown.getBuildings(),
      _buildingsLevel = _iTownBuildings.getBuildings();

    var _dependencies = [];
    $.each(_AllDependencies, function (_index, _requiredLevel) {
      var _dependencieBuildingLevel = _buildingsLevel[_index];
      if (_dependencieBuildingLevel < _requiredLevel) {
        _dependencies.push({
          building_id: _index,
          level: _requiredLevel,
        });
      }
    });
    return _dependencies;
  },

  /**
   * Update the buildingqueue.
   * @param {Object with Building Data} _building_data
   */
  saveBuilding: function (_building_data) {
    let newBuilding;
    var _townId = String(_building_data.town_id);
    let townQueue = Autobuild.town_queues.find(
      (e) => String(e.town_id) === _townId,
    );
    //if town doesnt exists in town_queues, add them
    if (!townQueue) {
      townQueue = {
        town_id: _building_data.town_id,
        building_queue: [],
        unit_queue: [],
        ship_queue: [],
      };
      Autobuild.town_queues.push(townQueue);
    }
    //Add new item to building queue
    if (_building_data.type === "add") {
      newBuilding = {
        id: Autobuild.getQueueItemId(),
        item_name: Autobuild.normalizeBuildingId(_building_data.item_name),
        count: _building_data.count,
      };
      townQueue.building_queue.push(newBuilding);
    } else if (_building_data.type === "remove") {
      let current_town_queue = townQueue.building_queue;
      var _itemId = String(_building_data.item_id);
      var _removeIndex = current_town_queue.findIndex(
        (e) => String(e.id) === _itemId,
      );
      if (_removeIndex >= 0) {
        current_town_queue.splice(_removeIndex, 1);
      }
    }

    $(
      "#building_tasks_main .ui_various_orders, .construction_queue_order_container .ui_various_orders",
    ).each(function () {
      $(this).find(".empty_slot").remove();
      //Add new item to building queue
      if (_building_data.type === "add") {
        $(this).append(Autobuild.buildingElement(newBuilding));
      }
      Autobuild.setEmptyItems($(this));
    });

    localStorage.setItem(
      "Autobuild.Queue",
      JSON.stringify(Autobuild.town_queues),
    );
  },

  /**
   * Check if the main building has free slots
   * @param {Response} _buildingMainResponse
   */
  hasFreeBuildingSlots: function (_buildingMainResponse) {
    var _hasFreeSlots = false;
    if (_buildingMainResponse != undefined) {
      if (
        /BuildingMain\.full_queue = false;/g.test(_buildingMainResponse.html)
      ) {
        _hasFreeSlots = true;
      }
    }
    return _hasFreeSlots;
  },

  /**
   * Get buildings from the main building respons.
   * @param {Response} _buildingMainResponse
   */
  getBuildings: function (_buildingMainResponse) {
    var _buildings = null;
    if (_buildingMainResponse.html != undefined) {
      var _match = _buildingMainResponse.html.match(
        /BuildingMain\.buildings = (.*);/g,
      );
      if (_match[0] != undefined) {
        _buildings = JSON.parse(_match[0].substring(25, _match[0].length - 1));
      }
    }
    return _buildings;
  },

  /**
   * Add the bot queue items to the queue
   * @param {JQuery Element to add the Items to} _jqueryElement
   * @param {building, unit or ship} _queueType
   */
  initQueue: function (_jqueryElement, _queueType) {
    var _guiQueue = _jqueryElement.find(".ui_various_orders");
    _guiQueue.find(".empty_slot").remove();

    switch (_queueType) {
      case "building":
        $("#building_tasks_main").addClass("active");

        if (
          Autobuild.town_queues.filter((e) => e.town_id == Game.townId).length >
          0
        ) {
          let current_town_queue = Autobuild.town_queues.find(
            (e) => e.town_id == Game.townId,
          ).building_queue;
          $.each(current_town_queue, function (_index, _element) {
            if (_element && _element.item_name) {
              _element.item_name = Autobuild.normalizeBuildingId(
                _element.item_name,
              );
            }
            _guiQueue.append(Autobuild.buildingElement(_element));
          });
        }
        break;
      case "unit":
        $("#unit_orders_queue").addClass("active");

        if (
          Autobuild.town_queues.filter((e) => e.town_id == Game.townId).length >
          0
        ) {
          let current_town_queue = Autobuild.town_queues.find(
            (e) => e.town_id == Game.townId,
          ).unit_queue;
          $.each(current_town_queue, function (_index, _element) {
            _guiQueue.append(Autobuild.unitElement(_element, _queueType));
          });
        }
        break;
      case "ship":
        $("#unit_orders_queue").addClass("active");

        if (
          Autobuild.town_queues.filter((e) => e.town_id == Game.townId).length >
          0
        ) {
          let current_town_queue = Autobuild.town_queues.find(
            (e) => e.town_id == Game.townId,
          ).ship_queue;
          $.each(current_town_queue, function (_index, _element) {
            _guiQueue.append(Autobuild.unitElement(_element, _queueType));
          });
        }
        break;
      default:
        break;
    }

    Autobuild.setEmptyItems(_guiQueue);
    _guiQueue.parent().mousewheel(function (_event, _speed) {
      this.scrollLeft -= _speed * 30;
      _event.preventDefault();
    });

    if (_queueType === "building") {
      setTimeout(function () {
        Autobuild.windows.building_main_index();
      }, 0);
    }
  },
  initUnitOrder: function (_selectedUnit, _type) {
    var unitData = _selectedUnit["units"][_selectedUnit["unit_id"]];
    var confirmButton = _selectedUnit["$el"]["find"]("#unit_order_confirm");
    var addQueueButton = _selectedUnit["$el"]["find"]("#unit_order_addqueue");
    var sliderEl = _selectedUnit["$el"]["find"]("#unit_order_slider");
    if (
      addQueueButton["length"] >= 0 &&
      (unitData["missing_building_dependencies"]["length"] >= 1 ||
        unitData["missing_research_dependencies"]["length"] >= 1)
    ) {
      addQueueButton["hide"]();
    }
    if (
      unitData["missing_building_dependencies"]["length"] == 0 &&
      unitData["missing_research_dependencies"]["length"] == 0
    ) {
      var currentTown = ITowns["towns"][Game["townId"]];
      var maxBuild = unitData["max_build"];
      var maxResourceCost = Math["max"]["apply"](this, [
        unitData["resources"]["wood"],
        unitData["resources"]["stone"],
        unitData["resources"]["iron"],
      ]);
      var limits = [];
      limits["push"](
        Math["floor"](currentTown["getStorage"]() / maxResourceCost),
      );
      limits["push"](
        Math["floor"](
          (currentTown["getAvailablePopulation"]() -
            Autobuild["checkPopulationBeingBuild"]()) /
            unitData["population"],
        ),
      );
      if (unitData["favor"] > 0) {
        limits["push"](Math["floor"](500 / unitData["favor"]));
      }
      var maxAllowed = Math["min"]["apply"](this, limits);
      if (maxAllowed > 0 && maxAllowed >= maxBuild) {
        _selectedUnit["slider"]["setMax"](maxAllowed);
      }
      if (addQueueButton["length"] == 0) {
        addQueueButton = $("<a/>", {
          href: "#",
          id: "unit_order_addqueue",
          class: "confirm",
        });
        confirmButton["after"](addQueueButton);
        addQueueButton["mousePopup"](new MousePopup("Add to reqruite queue"))[
          "on"
        ]("click", function (event) {
          event["preventDefault"]();
          Autobuild["addUnitQueueItem"](unitData, _type);
        });
      } else {
        addQueueButton["unbind"]("click");
        addQueueButton["on"]("click", function (event) {
          event["preventDefault"]();
          Autobuild["addUnitQueueItem"](unitData, _type);
        });
      }
      if (maxAllowed <= 0) {
        addQueueButton["hide"]();
      } else {
        addQueueButton["show"]();
      }
      confirmButton["show"]();
      sliderEl["slider"]({
        slide: function (event, ui) {
          if (ui["value"] > maxBuild) {
            confirmButton["hide"]();
          } else {
            if (ui["value"] >= 0 && ui["value"] <= maxBuild) {
              confirmButton["show"]();
            }
          }
          if (ui["value"] == 0) {
            addQueueButton["hide"]();
          } else {
            if (ui["value"] > 0 && maxAllowed > 0) {
              addQueueButton["show"]();
            }
          }
        },
      });
    }
  },
  checkBuildingLevel: function (queueItem) {
    var buildingId = Autobuild.normalizeBuildingId(queueItem["item_name"]);
    var currentLevel =
      ITowns["towns"][Game["townId"]]["getBuildings"]()["attributes"][
        buildingId
      ];
    $["each"](
      ITowns["towns"][Game["townId"]]["buildingOrders"]()["models"],
      function (index, order) {
        if (order["attributes"]["building_type"] == buildingId) {
          currentLevel++;
        }
      },
    );
    if (
      Autobuild.town_queues.filter((e) => e.town_id == Game.townId).length > 0
    ) {
      $.each(
        Autobuild.town_queues.find((e) => e.town_id === Game.townId)
          .building_queue,
        function (index, queueEntry) {
          if (queueEntry["id"] == queueItem["id"]) {
            return false;
          }
          if (
            Autobuild.normalizeBuildingId(queueEntry["item_name"]) == buildingId
          ) {
            currentLevel++;
          }
        },
      );
    }
    currentLevel++;
    return currentLevel;
  },

  /**
   * Calculate the population being build in the unit and ship queue
   */
  checkPopulationBeingBuild: function () {
    var _count = 0;
    if (
      Autobuild.town_queues.filter((e) => e.town_id == Game.townId).length > 0
    ) {
      let current_town = Autobuild.town_queues.find(
        (e) => e.town_id == Game.townId,
      );
      //unit queue
      $.each(current_town.unit_queue, function (_index, _element) {
        _count +=
          _element.count * GameData.units[_element.item_name].population;
      });
      //ships queue
      $.each(current_town.ship_queue, function (_index, _element) {
        _count +=
          _element.count * GameData.units[_element.item_name].population;
      });
    }
    return _count;
  },

  /**
   * Generate a unique id for bot queue items.
   */
  getQueueItemId: function () {
    if (Autobuild.queueIdCounter === undefined) {
      Autobuild.queueIdCounter = 0;
    }
    Autobuild.queueIdCounter += 1;
    return Timestamp.now() + "_" + Autobuild.queueIdCounter;
  },

  normalizeBuildingId: function (buildingId) {
    if (!buildingId) {
      return buildingId;
    }
    var normalized = String(buildingId);
    normalized = normalized.replace(/^building_main_not_possible_button_/, "");
    normalized = normalized.replace(/^building_main_/, "");
    normalized = normalized.replace(/^not_possible_button_/, "");
    normalized = normalized.replace(/^building_/, "");
    return normalized;
  },

  /**
   * Add unit or ship to the the queue
   * @param {Unit} _unit
   * @param {ship or unit} _type
   */
  addUnitQueueItem: function (_unit, _type) {
    Autobuild.saveUnits({
      action: "add",
      town_id: Game.townId,
      item_name: _unit.id,
      type: _type,
      count: UnitOrder.slider.getValue(),
    });
  },

  /**
   * Add or remove the Unit from the bot queue and render it
   * @param {Unit Data} _unitData
   */
  saveUnits: function (_unitData) {
    var _townId = String(_unitData.town_id);
    let townQueue = Autobuild.town_queues.find(
      (e) => String(e.town_id) === _townId,
    );
    //if town doesnt exists in town_queues, add them
    if (!townQueue) {
      townQueue = {
        town_id: _unitData.town_id,
        building_queue: [],
        unit_queue: [],
        ship_queue: [],
      };
      Autobuild.town_queues.push(townQueue);
    }
    let newUnit;
    //Add new item to unit queue
    if (_unitData.action === "add") {
      newUnit = {
        id: Autobuild.getQueueItemId(),
        item_name: _unitData.item_name,
        count: _unitData.count,
      };
      townQueue[_unitData.type + "_queue"].push(newUnit);
    } else if (_unitData.action === "remove") {
      let current_town_queue = townQueue[_unitData.type + "_queue"];
      var _itemId = String(_unitData.item_id);
      var _removeIndex = current_town_queue.findIndex(
        (e) => String(e.id) === _itemId,
      );
      if (_removeIndex >= 0) {
        current_town_queue.splice(_removeIndex, 1);
      }
    }

    let _alreadyAdded = false;
    $("#unit_orders_queue .ui_various_orders").each(function () {
      $(this).find(".empty_slot").remove();
      //Add new item to gui queue
      if (_unitData.action === "add" && !_alreadyAdded) {
        $(this).append(Autobuild.unitElement(newUnit, _unitData.type));
        _alreadyAdded = true;
      }
      Autobuild.setEmptyItems($(this));
      UnitOrder.selectUnit(UnitOrder.unit_id);
    });

    localStorage.setItem(
      "Autobuild.Queue",
      JSON.stringify(Autobuild.town_queues),
    );
  },

  /**
   * Add empty queue item to the Element
   * @param {Element to add the empty items to} _jqueryElement
   */
  setEmptyItems: function (_jqueryElement) {
    var _width = 0;
    var _queueParentWidth = _jqueryElement["parent"]()["width"]();
    $.each(_jqueryElement.find(".js-tutorial-queue-item"), function () {
      _width += $(this).outerWidth(true);
    });
    var _freeWidth = _queueParentWidth - _width;
    if (_freeWidth >= 0) {
      _jqueryElement.width(_queueParentWidth);
      for (let i = 1; i <= Math.floor(_freeWidth) / 60; i++) {
        _jqueryElement.append(
          $("<div/>", {
            class:
              "js-queue-item js-tutorial-queue-item construction_queue_sprite empty_slot",
          }),
        );
      }
    } else {
      _jqueryElement.width(_width + 25);
    }
  },

  /**
   * Render the building element for the queue
   * @param {Building Object} _building
   */
  buildingElement: function (_building) {
    var buildingId = Autobuild.normalizeBuildingId(_building.item_name);
    var buildingName =
      GameData["buildings"] && GameData["buildings"][buildingId]
        ? GameData["buildings"][buildingId]["name"]
        : buildingId.capitalize();
    return $("<div/>", {
      class:
        "grepobot-queue-item js-tutorial-queue-item queued_building_order last_order " +
        buildingId +
        " queue_id_" +
        _building.id,
    })
      .append(
        $("<div/>", {
          class: "construction_queue_sprite frame",
        })
          .mousePopup(
            new MousePopup(buildingName + " queued"),
          )
          .append(
            $("<div/>", {
              class:
                "item_icon building_icon40x40 js-item-icon build_queue " +
                buildingId,
            }).append(
              $("<div/>", {
                class: "building_level",
              }).append(
                '<span class="construction_queue_sprite arrow_green_ver"></span>' +
                  Autobuild.checkBuildingLevel(_building),
              ),
            ),
          ),
      )
      .append(
        $("<div/>", {
          class:
            "btn_cancel_order button_new square remove build_queue grepobot-queue-remove",
          //remove Event
        })
          .on("click", function (_event) {
            _event.preventDefault();
            _event.stopPropagation();
            _event.stopImmediatePropagation();

            Autobuild.saveBuilding({
              type: "remove",
              town_id: Game["townId"],
              item_id: _building["id"],
            });

            $(this).closest(".grepobot-queue-item").remove();
            return false;
          })
          .append(
            $("<div/>", {
              class: "left",
            }),
          )
          .append(
            $("<div/>", {
              class: "right",
            }),
          )
          .append(
            $("<div/>", {
              class: "caption js-caption",
            }).append(
              $("<div/>", {
                class: "effect js-effect",
              }),
            ),
          ),
      );
  },

  /**
   * Render the unit element to the queue
   * @param {Unit Object} _unit
   * @param {Ship or unit} _queueType
   */
  unitElement: function (_unit, _queueType) {
    return $("<div/>", {
      class:
        "grepobot-queue-item js-tutorial-queue-item queued_building_order last_order " +
        _unit.item_name +
        " queue_id_" +
        _unit.id,
    })
      ["append"](
        $("<div/>", {
          class: "construction_queue_sprite frame",
        })
          ["mousePopup"](
            new MousePopup(
              _unit.item_name.capitalize().replace("_", " ") + " queued",
            ),
          )
          .append(
            $("<div/>", {
              class:
                "item_icon unit_icon40x40 js-item-icon build_queue " +
                _unit["item_name"],
            }).append(
              $("<div/>", {
                class: "unit_count text_shadow",
              }).html(_unit.count),
            ),
          ),
      )
      .append(
        $("<div/>", {
          class:
            "btn_cancel_order button_new square remove build_queue grepobot-queue-remove",
          //remove event
        })
          .on("click", function (_event) {
            _event.preventDefault();
            _event.stopPropagation();
            _event.stopImmediatePropagation();

            Autobuild.saveUnits({
              action: "remove",
              town_id: Game.townId,
              item_id: _unit.id,
              type: _queueType,
            });

            $(this).closest(".grepobot-queue-item").remove();
            return false;
          })
          .append(
            $("<div/>", {
              class: "left",
            }),
          )
          .append(
            $("<div/>", {
              class: "right",
            }),
          )
          .append(
            $("<div/>", {
              class: "caption js-caption",
            }).append(
              $("<div/>", {
                class: "effect js-effect",
              }),
            ),
          ),
      );
  },

  /**
   * Render Settings Tab
   */
  contentSettings: function () {
    return $("<fieldset/>", {
      id: "Autobuild_settings",
      style: "float:left; width:472px; height: 270px;",
    })
      .append($("<legend/>").html("Autobuild Settings"))
      .append(
        FormBuilder.checkbox({
          text: "AutoStart Autobuild.",
          id: "autobuild_autostart",
          name: "autobuild_autostart",
          checked: Autobuild.settings.autostart,
        }),
      )
      .append(
        FormBuilder.selectBox({
          id: "autobuild_timeinterval",
          name: "autobuild_timeinterval",
          label: "Check every: ",
          styles: "width: 120px;",
          value: Autobuild.settings.timeinterval,
          options: [
            {
              value: "120",
              name: "2 minutes",
            },
            {
              value: "300",
              name: "5 minutes",
            },
            {
              value: "600",
              name: "10 minutes",
            },
            {
              value: "900",
              name: "15 minutes",
            },
          ],
        }),
      )
      .append(
        FormBuilder.checkbox({
          text: "Enable building queue.",
          id: "autobuild_building_enable",
          name: "autobuild_building_enable",
          style: "width: 100%;padding-top: 35px;",
          checked: Autobuild.settings.enable_building,
        }),
      )
      .append(
        FormBuilder.checkbox({
          text: "Enable barracks queue.",
          id: "autobuild_barracks_enable",
          name: "autobuild_barracks_enable",
          style: "width: 100%;",
          checked: Autobuild.settings.enable_units,
        }),
      )
      .append(
        FormBuilder.checkbox({
          text: "Enable ships queue.",
          id: "autobuild_ships_enable",
          name: "autobuild_ships_enable",
          style: "width: 100%;padding-bottom: 35px;",
          checked: Autobuild.settings.enable_ships,
        }),
      )
      .append(function () {
        if (GameDataInstantBuy.isEnabled()) {
          return FormBuilder.checkbox({
            text: "Free Instant Buy.",
            id: "autobuild_instant_buy",
            name: "autobuild_instant_buy",
            style: "width: 100%;",
            checked: Autobuild.settings.instant_buy,
          });
        }
      })
      .append(
        FormBuilder.button({
          name: DM.getl10n("notes").btn_save,
          style: "top: 10px;",
          //Save Settings
        }).on("click", function () {
          var _settings = $("#Autobuild_settings").serializeObject();
          Autobuild.settings.autostart =
            _settings.autobuild_autostart != undefined;
          Autobuild.settings.timeinterval = parseInt(
            _settings.autobuild_timeinterval,
          );
          Autobuild.settings.autostart =
            _settings.autobuild_autostart != undefined;
          Autobuild.settings.enable_building =
            _settings.autobuild_building_enable != undefined;
          Autobuild.settings.enable_units =
            _settings.autobuild_barracks_enable != undefined;
          Autobuild.settings.enable_ships =
            _settings.autobuild_ships_enable != undefined;
          Autobuild.settings.instant_buy =
            _settings.autobuild_instant_buy != undefined;

          localStorage.setItem(
            "Autobuild.Settings",
            JSON.stringify(Autobuild.settings),
          );

          ConsoleLog.Log("Settings saved", 3);
          HumanMessage.success("The settings were saved!");
        }),
      );
  },
  /**
   * Window events on open main building and barracks
   */
  windows: {
    wndId: null,
    wndContent: null,
    building_main_index: function () {
      Autobuild.currentWindow = Autobuild.getBuildingWindowContent();
      if (Autobuild.currentWindow && Autobuild.currentWindow.length > 0) {
        if (Autobuild.isUpdatingBuildingButtons) {
          return;
        }
        Autobuild.isUpdatingBuildingButtons = true;
        try {
          var _mainTasks = Autobuild.currentWindow.find("#main_tasks h4");
          Autobuild.currentWindow.find("#building_tasks_main").addClass("active");
          //replace max count of building tasks with infinit
          var _mainTasksText = _mainTasks.text();
          if (_mainTasksText) {
            var _queueMatch = _mainTasksText.match(
              /\((\d+)\s*\/\s*(\d+)\s*\)?/,
            );
            if (_queueMatch) {
              Autobuild.buildingQueueMax = parseInt(_queueMatch[2], 10);
            }
          }
          if (_mainTasksText) {
            var _slashIndex = _mainTasksText.indexOf("/");
            if (_slashIndex !== -1) {
              var _prefix = _mainTasksText.slice(0, _slashIndex);
              _prefix = _prefix.replace(/\s+$/, "");
              _mainTasks.html(_prefix + " /&infin;)");
            }
          }
          var _isQueueFull = false;
          if (
            typeof BuildingMain !== "undefined" &&
            Object.prototype.hasOwnProperty.call(BuildingMain, "full_queue")
          ) {
            _isQueueFull = BuildingMain.full_queue === true;
          } else if (_mainTasksText) {
            var _queueMatch = _mainTasksText.match(
              /\((\d+)\s*\/\s*(\d+)\s*\)?/,
            );
            if (_queueMatch && _queueMatch[1] === _queueMatch[2]) {
              _isQueueFull = true;
            }
          }
          var _specialBuildings = [
            "theater",
            "thermal",
            "library",
            "lighthouse",
            "tower",
            "statue",
            "oracle",
            "trade_office",
          ];
          //replace the "cant upgrade" with "add to queue"
          $.each(
            Autobuild.currentWindow.find("#buildings .button_build.build_up"),
            function () {
              var _button = $(this);
              var _isDisabled =
                _button.hasClass("build_grey") ||
                _button.hasClass("disabled") ||
                _button.hasClass("inactive") ||
                _button.attr("disabled") !== undefined ||
                _button.attr("aria-disabled") === "true" ||
                _button.data("disabled") === true;
              if (!_isQueueFull && !_isDisabled) {
                return;
              }

              var _buildingRoot = _button.closest("[id^='building_main_']");
              if (_buildingRoot.length === 0) {
                return;
              }
              var _buildingId = _buildingRoot.attr("id").replace(
                "building_main_",
                "",
              );

              var _allowQueue = false;
              if (_isQueueFull) {
                _allowQueue = !_buildingRoot.hasClass("main_not_possible");
              } else {
                try {
                  _allowQueue =
                    Autobuild.checkBuildingDependencies(
                      _buildingId,
                      ITowns.getTown(Game.townId),
                    ).length <= 0;
                } catch (err) {
                  _allowQueue = true;
                }
              }
              if (!_allowQueue) {
                return;
              }

              //if the building is not a special building
              if ($.inArray(_buildingId, _specialBuildings) == -1) {
                if (!_button.data("grepobotQueue")) {
                  _button
                    .removeClass("build_grey")
                    .removeClass("disabled")
                    .removeClass("inactive")
                    .addClass("build")
                    .data("grepobotQueue", true)
                    .off("click.grepobotQueue")
                    .on("click.grepobotQueue", function (_event) {
                      _event.preventDefault();

                      Autobuild.saveBuilding({
                        type: "add",
                        town_id: Game.townId,
                        item_name: _buildingId,
                        count: 1,
                      });
                    });
                  _buildingRoot.removeClass("main_not_possible");
                  if (_button.find(".caption").length > 0) {
                    _button.find(".caption").text("Add to queue");
                  } else {
                    _button.text("Add to queue");
                  }
                }
              }
            },
          );
          Autobuild.observeBuildingWindow();
        } finally {
          Autobuild.isUpdatingBuildingButtons = false;
        }
      }
    },
    //replace max count of building tasks with infinit
    building_barracks_index: function () {
      Autobuild.currentWindow = Autobuild.getBuildingWindowContent();
      if (Autobuild.currentWindow && Autobuild.currentWindow.length > 0) {
        var _unitQueue = Autobuild.currentWindow.find("#unit_orders_queue h4");
        _unitQueue.find(".js-max-order-queue-count").html("&infin;");
      }
    },
  },
  getBuildingWindowContent: function () {
    var _wndType =
      Layout &&
      Layout.wnd &&
      Layout.wnd.TYPE_BUILDING !== undefined
        ? Layout.wnd.TYPE_BUILDING
        : GPWindowMgr && GPWindowMgr.TYPE_BUILDING !== undefined
          ? GPWindowMgr.TYPE_BUILDING
          : null;
    if (GPWindowMgr && _wndType !== null) {
      var _wnd = GPWindowMgr.getOpenFirst(_wndType);
      if (_wnd) {
        return _wnd.getJQElement().find(".gpwindow_content");
      }
    }
    return $(".gpwindow_content:visible")
      .filter(function () {
        return $(this).find("#buildings").length > 0;
      })
      .first();
  },
  observeBuildingWindow: function () {
    if (!Autobuild.currentWindow || Autobuild.currentWindow.length === 0) {
      return;
    }
    var target = Autobuild.currentWindow.find("#buildings")[0];
    if (!target) {
      return;
    }
    if (
      Autobuild.buildingObserver &&
      Autobuild.buildingObserverTarget === target
    ) {
      return;
    }
    if (Autobuild.buildingObserver) {
      Autobuild.buildingObserver.disconnect();
    }
    Autobuild.buildingObserverTarget = target;
    Autobuild.buildingObserver = new MutationObserver(function () {
      if (Autobuild.isUpdatingBuildingButtons) {
        return;
      }
      Autobuild.windows.building_main_index();
    });
    Autobuild.buildingObserver.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });
  },
};
