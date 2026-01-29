/**
 * DataExchanger module: wraps game AJAX endpoints and normalizes responses.
 * Responsibilities: call endpoints and handle redirects/notifications.
 */
DataExchanger = {
  default_handler: function (callback, useFullResponse) {
    return function (payload, status, xhr) {
      useFullResponse = useFullResponse != undefined;
      var responseJson = payload["json"];
      // Normalize common response behaviors before invoking callbacks.
      if (responseJson["redirect"]) {
        window["location"]["href"] = responseJson["redirect"];
        delete responseJson["redirect"];
        return;
      }
      if (responseJson["maintenance"]) {
        return MaintenanceWindowFactory["openMaintenanceWindow"](
          responseJson["maintenance"],
        );
      }
      if (responseJson["notifications"]) {
        if (NotificationLoader) {
          NotificationLoader["recvNotifyData"](responseJson, "data");
          delete responseJson["notifications"];
          delete responseJson["next_fetch_in"];
        }
      }
      if (
        responseJson["bar"] &&
        responseJson["bar"]["gift"] &&
        responseJson["bar"]["gift"]["length"]
      ) {
        var windowIds = require("game/windows/ids");
        var dailyLoginId = windowIds["DAILY_LOGIN"];
        var giftData = HelperLayout["getGiftData"](
          responseJson["bar"]["gift"],
          "gift.daily_reward",
        );
        if (giftData && !WM["isOpened"](dailyLoginId)) {
          HelperLayout["openDailyLoginGift"](giftData);
        }
      }
      if (useFullResponse) {
        return callback(payload);
      } else {
        return callback(responseJson);
      }
    };
  },
  game_data: function (townId, callback) {
    var currentTownId = townId,
      url,
      payload;
    url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/data?" +
      $["param"]({
        town_id: currentTownId,
        action: "get",
        h: Game["csrfToken"],
      });
    payload = {
      json: JSON["stringify"]({
        types: [
          {
            type: "map",
            param: {
              x: 0,
              y: 0,
            },
          },
          {
            type: "bar",
          },
          {
            type: "backbone",
          },
        ],
        town_id: currentTownId,
        nl_init: false,
      }),
    };
    $["ajax"]({
      url: url,
      data: payload,
      method: "POST",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  switch_town: function (townId, callback) {
    var requestTownId = townId,
      url;
    url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/index?" +
      $["param"]({
        town_id: requestTownId,
        action: "switch_town",
        h: Game["csrfToken"],
      });
    $["ajax"]({
      url: url,
      method: "GET",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  claim_load: function (townId, claimOption, timeOption, targetId, callback) {
    var requestTownId = townId,
      url,
      payload;
    url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/farm_town_info?" +
      $["param"]({
        town_id: requestTownId,
        action: "claim_load",
        h: Game["csrfToken"],
      });
    payload = {
      json: JSON["stringify"]({
        target_id: targetId,
        claim_type: claimOption,
        time: timeOption,
        town_id: requestTownId,
        nl_init: true,
      }),
    };
    $["ajax"]({
      url: url,
      data: payload,
      method: "POST",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  farm_town_overviews: function (townId, callback) {
    var currentTownId = townId,
      url,
      payload;
    payload = {
      town_id: Game["townId"],
      action: "get_farm_towns_for_town",
      h: Game["csrfToken"],
      json: JSON["stringify"]({
        island_x: ITowns["towns"][currentTownId]["getIslandCoordinateX"](),
        island_y: ITowns["towns"][currentTownId]["getIslandCoordinateY"](),
        current_town_id: currentTownId,
        booty_researched: ITowns["towns"][currentTownId]["researches"]()[
          "attributes"
        ]["booty"]
          ? true
          : "",
        diplomacy_researched: ITowns["towns"][currentTownId]["researches"]()[
          "attributes"
        ]["diplomacy"]
          ? true
          : "",
        itrade_office:
          ITowns["towns"][currentTownId]["buildings"]()["attributes"][
            "trade_office"
          ],
        town_id: Game["townId"],
        nl_init: true,
      }),
    };
    url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/farm_town_overviews";
    $["ajax"]({
      url: url,
      data: payload,
      method: "GET",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  claim_loads: function (
    townId,
    farmTownIds,
    claimOption,
    timeOption,
    callback,
  ) {
    var url =
        window["location"]["protocol"] +
        "//" +
        document["domain"] +
        "/game/farm_town_overviews?" +
        $["param"]({
          town_id: Game["townId"],
          action: "claim_loads",
          h: Game["csrfToken"],
        }),
      payload;
    payload = {
      json: JSON["stringify"]({
        farm_town_ids: farmTownIds,
        time_option: timeOption,
        claim_factor: claimOption,
        current_town_id: townId,
        town_id: Game["townId"],
        nl_init: true,
      }),
    };
    $["ajax"]({
      url: url,
      data: payload,
      method: "POST",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  building_place: function (townId, callback) {
    var requestTownId = townId,
      url,
      payload;
    payload = {
      town_id: requestTownId,
      action: "culture",
      h: Game["csrfToken"],
      json: JSON["stringify"]({
        town_id: requestTownId,
        nl_init: true,
      }),
    };
    url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/building_place";
    $["ajax"]({
      url: url,
      data: payload,
      method: "GET",
      dataType: "json",
      success: DataExchanger["default_handler"](callback, true),
    });
  },
  building_main: function (townId, callback) {
    var requestTownId = townId,
      url,
      payload;
    payload = {
      town_id: requestTownId,
      action: "index",
      h: Game["csrfToken"],
      json: JSON["stringify"]({
        town_id: requestTownId,
        nl_init: true,
      }),
    };
    url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/building_main";
    $["ajax"]({
      url: url,
      data: payload,
      method: "GET",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  start_celebration: function (townId, celebrationType, callback) {
    var url =
        window["location"]["protocol"] +
        "//" +
        document["domain"] +
        "/game/building_place?" +
        $["param"]({
          town_id: townId,
          action: "start_celebration",
          h: Game["csrfToken"],
        }),
      payload;
    payload = {
      json: JSON["stringify"]({
        celebration_type: celebrationType,
        town_id: townId,
        nl_init: true,
      }),
    };
    $["ajax"]({
      url: url,
      data: payload,
      method: "POST",
      dataType: "json",
      success: DataExchanger["default_handler"](callback, true),
    });
  },
  email_validation: function (callback) {
    var payload = {
      town_id: Game["townId"],
      action: "email_validation",
      h: Game["csrfToken"],
      json: JSON["stringify"]({
        town_id: Game["townId"],
        nl_init: true,
      }),
    };
    var url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/player";
    $["ajax"]({
      url: url,
      data: payload,
      method: "GET",
      dataType: "json",
      success: DataExchanger["default_handler"](callback, true),
    });
  },
  members_show: function (callback) {
    var payload = {
      town_id: Game["townId"],
      action: "members_show",
      h: Game["csrfToken"],
      json: JSON["stringify"]({
        town_id: Game["townId"],
        nl_init: true,
      }),
    };
    var url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/alliance";
    $["ajax"]({
      url: url,
      data: payload,
      method: "GET",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  login_to_game_world: function (worldId) {
    $["redirect"](
      window["location"]["protocol"] +
        "//" +
        document["domain"] +
        "/start?" +
        $["param"]({
          action: "login_to_game_world",
        }),
      {
        world: worldId,
        facebook_session: "",
        facebook_login: "",
        portal_sid: "",
        name: "",
        password: "",
      },
    );
  },
  frontend_bridge: function (townId, requestData, callback) {
    var url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/frontend_bridge?" +
      $["param"]({
        town_id: townId,
        action: "execute",
        h: Game["csrfToken"],
      });
    var payload = {
      json: JSON["stringify"](requestData),
    };
    $["ajax"]({
      url: url,
      data: payload,
      method: "POST",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  building_barracks: function (townId, requestData, callback) {
    var url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/building_barracks?" +
      $["param"]({
        town_id: townId,
        action: "build",
        h: Game["csrfToken"],
      });
    var payload = {
      json: JSON["stringify"](requestData),
    };
    $["ajax"]({
      url: url,
      data: payload,
      method: "POST",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  attack_planner: function (townId, callback) {
    var requestTownId = townId,
      url,
      payload;
    payload = {
      town_id: requestTownId,
      action: "attacks",
      h: Game["csrfToken"],
      json: JSON["stringify"]({
        town_id: requestTownId,
        nl_init: true,
      }),
    };
    url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/attack_planer";
    $["ajax"]({
      url: url,
      data: payload,
      method: "GET",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  town_info_attack: function (townId, attackData, callback) {
    var requestTownId = townId,
      url,
      payload;
    payload = {
      town_id: requestTownId,
      action: "attack",
      h: Game["csrfToken"],
      json: JSON["stringify"]({
        id: attackData["target_id"],
        nl_init: true,
        origin_town_id: attackData["town_id"],
        preselect: true,
        preselect_units: attackData["units"],
        town_id: Game["townId"],
      }),
    };
    url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/town_info";
    $["ajax"]({
      url: url,
      data: payload,
      method: "GET",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
  send_units: function (
    townId,
    attackType,
    targetTownId,
    unitsPayload,
    callback,
  ) {
    var url =
      window["location"]["protocol"] +
      "//" +
      document["domain"] +
      "/game/town_info?" +
      $["param"]({
        town_id: townId,
        action: "send_units",
        h: Game["csrfToken"],
      });
    var payload = {
      json: JSON["stringify"](
        $["extend"](
          {
            id: targetTownId,
            type: attackType,
            town_id: townId,
            nl_init: true,
          },
          unitsPayload,
        ),
      ),
    };
    $["ajax"]({
      url: url,
      data: payload,
      method: "POST",
      dataType: "json",
      success: DataExchanger["default_handler"](callback),
    });
  },
};
