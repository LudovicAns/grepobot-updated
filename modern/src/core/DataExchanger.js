/**
 * DataExchanger module: wraps game AJAX endpoints and normalizes responses.
 * Responsibilities: call endpoints and handle redirects/notifications.
 *
 * For new code, prefer the structured API under DataExchanger["api"].
 */
window.DataExchanger = (function () {
  function default_handler(callback, useFullResponse) {
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
  }

  function baseUrl(path) {
    return (
      window["location"]["protocol"] + "//" + document["domain"] + path
    );
  }

  function buildUrl(path, queryParams) {
    var url = baseUrl(path);
    if (queryParams) {
      url += "?" + $["param"](queryParams);
    }
    return url;
  }

  function jsonPayload(data) {
    return {
      json: JSON["stringify"](data),
    };
  }

  function sendRequest(options, callback, useFullResponse) {
    options["success"] = default_handler(callback, useFullResponse);
    return $["ajax"](options);
  }

  var api = {
    game: {
      data: function (townId, callback) {
        var currentTownId = townId;
        var url = buildUrl("/game/data", {
          town_id: currentTownId,
          action: "get",
          h: Game["csrfToken"],
        });
        var payload = jsonPayload({
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
        });
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "POST",
            dataType: "json",
          },
          callback,
        );
      },
      switchTown: function (townId, callback) {
        var requestTownId = townId;
        var url = buildUrl("/game/index", {
          town_id: requestTownId,
          action: "switch_town",
          h: Game["csrfToken"],
        });
        return sendRequest(
          {
            url: url,
            method: "GET",
            dataType: "json",
          },
          callback,
        );
      },
    },
    farm: {
      claimLoad: function (townId, claimOption, timeOption, targetId, callback) {
        var requestTownId = townId;
        var url = buildUrl("/game/farm_town_info", {
          town_id: requestTownId,
          action: "claim_load",
          h: Game["csrfToken"],
        });
        var payload = jsonPayload({
          target_id: targetId,
          claim_type: claimOption,
          time: timeOption,
          town_id: requestTownId,
          nl_init: true,
        });
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "POST",
            dataType: "json",
          },
          callback,
        );
      },
      townOverviews: function (townId, callback) {
        var currentTownId = townId;
        var payload = {
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
        var url = baseUrl("/game/farm_town_overviews");
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "GET",
            dataType: "json",
          },
          callback,
        );
      },
      claimLoads: function (
        townId,
        farmTownIds,
        claimOption,
        timeOption,
        callback,
      ) {
        var url = buildUrl("/game/farm_town_overviews", {
          town_id: Game["townId"],
          action: "claim_loads",
          h: Game["csrfToken"],
        });
        var payload = jsonPayload({
          farm_town_ids: farmTownIds,
          time_option: timeOption,
          claim_factor: claimOption,
          current_town_id: townId,
          town_id: Game["townId"],
          nl_init: true,
        });
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "POST",
            dataType: "json",
          },
          callback,
        );
      },
    },
    buildings: {
      place: function (townId, callback) {
        var requestTownId = townId;
        var payload = {
          town_id: requestTownId,
          action: "culture",
          h: Game["csrfToken"],
          json: JSON["stringify"]({
            town_id: requestTownId,
            nl_init: true,
          }),
        };
        var url = baseUrl("/game/building_place");
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "GET",
            dataType: "json",
          },
          callback,
          true,
        );
      },
      main: function (townId, callback) {
        var requestTownId = townId;
        var payload = {
          town_id: requestTownId,
          action: "index",
          h: Game["csrfToken"],
          json: JSON["stringify"]({
            town_id: requestTownId,
            nl_init: true,
          }),
        };
        var url = baseUrl("/game/building_main");
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "GET",
            dataType: "json",
          },
          callback,
        );
      },
      startCelebration: function (townId, celebrationType, callback) {
        var url = buildUrl("/game/building_place", {
          town_id: townId,
          action: "start_celebration",
          h: Game["csrfToken"],
        });
        var payload = jsonPayload({
          celebration_type: celebrationType,
          town_id: townId,
          nl_init: true,
        });
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "POST",
            dataType: "json",
          },
          callback,
          true,
        );
      },
      barracks: function (townId, requestData, callback) {
        var url = buildUrl("/game/building_barracks", {
          town_id: townId,
          action: "build",
          h: Game["csrfToken"],
        });
        var payload = jsonPayload(requestData);
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "POST",
            dataType: "json",
          },
          callback,
        );
      },
    },
    player: {
      emailValidation: function (callback) {
        var payload = {
          town_id: Game["townId"],
          action: "email_validation",
          h: Game["csrfToken"],
          json: JSON["stringify"]({
            town_id: Game["townId"],
            nl_init: true,
          }),
        };
        var url = baseUrl("/game/player");
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "GET",
            dataType: "json",
          },
          callback,
          true,
        );
      },
    },
    alliance: {
      membersShow: function (callback) {
        var payload = {
          town_id: Game["townId"],
          action: "members_show",
          h: Game["csrfToken"],
          json: JSON["stringify"]({
            town_id: Game["townId"],
            nl_init: true,
          }),
        };
        var url = baseUrl("/game/alliance");
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "GET",
            dataType: "json",
          },
          callback,
        );
      },
    },
    auth: {
      loginToGameWorld: function (worldId) {
        $["redirect"](
          buildUrl("/start", {
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
    },
    bridge: {
      execute: function (townId, requestData, callback) {
        var url = buildUrl("/game/frontend_bridge", {
          town_id: townId,
          action: "execute",
          h: Game["csrfToken"],
        });
        var payload = jsonPayload(requestData);
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "POST",
            dataType: "json",
          },
          callback,
        );
      },
    },
    attack: {
      planner: function (townId, callback) {
        var requestTownId = townId;
        var payload = {
          town_id: requestTownId,
          action: "attacks",
          h: Game["csrfToken"],
          json: JSON["stringify"]({
            town_id: requestTownId,
            nl_init: true,
          }),
        };
        var url = baseUrl("/game/attack_planer");
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "GET",
            dataType: "json",
          },
          callback,
        );
      },
      townInfoAttack: function (townId, attackData, callback) {
        var requestTownId = townId;
        var payload = {
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
        var url = baseUrl("/game/town_info");
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "GET",
            dataType: "json",
          },
          callback,
        );
      },
      sendUnits: function (
        townId,
        attackType,
        targetTownId,
        unitsPayload,
        callback,
      ) {
        var url = buildUrl("/game/town_info", {
          town_id: townId,
          action: "send_units",
          h: Game["csrfToken"],
        });
        var payload = jsonPayload(
          $["extend"](
            {
              id: targetTownId,
              type: attackType,
              town_id: townId,
              nl_init: true,
            },
            unitsPayload,
          ),
        );
        return sendRequest(
          {
            url: url,
            data: payload,
            method: "POST",
            dataType: "json",
          },
          callback,
        );
      },
    },
  };

  return {
    default_handler: default_handler,
    api: api,
    game_data: api["game"]["data"],
    switch_town: api["game"]["switchTown"],
    claim_load: api["farm"]["claimLoad"],
    farm_town_overviews: api["farm"]["townOverviews"],
    claim_loads: api["farm"]["claimLoads"],
    building_place: api["buildings"]["place"],
    building_main: api["buildings"]["main"],
    start_celebration: api["buildings"]["startCelebration"],
    email_validation: api["player"]["emailValidation"],
    members_show: api["alliance"]["membersShow"],
    login_to_game_world: api["auth"]["loginToGameWorld"],
    frontend_bridge: api["bridge"]["execute"],
    building_barracks: api["buildings"]["barracks"],
    attack_planner: api["attack"]["planner"],
    town_info_attack: api["attack"]["townInfoAttack"],
    send_units: api["attack"]["sendUnits"],
  };
})();
