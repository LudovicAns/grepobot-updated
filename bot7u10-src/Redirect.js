/**
 * Redirect helper: posts data by building a temporary form.
 * Used for navigating with POST params in the game.
 */
(function (jqlite) {
  "use strict";
  jqlite["redirect"] = function (url, params, method, target) {
    method = method && method["toUpperCase"]() === "GET" ? "GET" : "POST";
    if (!params) {
      var parsed = jqlite["parseUrl"](url);
      url = parsed["url"];
      params = parsed["params"];
    }
    var form = jqlite("<form>")
      ["attr"]("method", method)
      ["attr"]("action", url);
    if (target) {
      form["attr"]("target", target);
    }
    appendParams(params, [], form);
    jqlite("body")["append"](form);
    form[0]["submit"]();
  };
  jqlite["parseUrl"] = function (url) {
    if (url["indexOf"]("?") === -1) {
      return {
        url: url,
        params: {},
      };
    }
    var urlParts = url["split"]("?"),
      queryString = urlParts[1],
      pairs = queryString["split"]("&");
    url = urlParts[0];
    var pairIndex,
      pair,
      parsedParams = {};
    for (pairIndex = 0; pairIndex < pairs["length"]; pairIndex += 1) {
      pair = pairs[pairIndex]["split"]("=");
      parsedParams[pair[0]] = pair[1];
    }
    return {
      url: url,
      params: parsedParams,
    };
  };
  var buildInput = function (name, value, path, isArray) {
    var fullName;
    if (path["length"] > 0) {
      fullName = path[0];
      var pathIndex;
      for (pathIndex = 1; pathIndex < path["length"]; pathIndex += 1) {
        fullName += "[" + path[pathIndex] + "]";
      }
      if (isArray) {
        name = fullName + "[]";
      } else {
        name = fullName + "[" + name + "]";
      }
    }
    return jqlite("<input>")
      ["attr"]("type", "hidden")
      ["attr"]("name", name)
      ["attr"]("value", value);
  };
  var appendParams = function (params, path, form, isArray) {
    var key,
      nextPath = [];
    for (key in params) {
      if (typeof params[key] === "object") {
        nextPath = path["slice"]();
        if (isArray) {
          nextPath["push"]("");
        } else {
          nextPath["push"](key);
        }
        appendParams(
          params[key],
          nextPath,
          form,
          Array["isArray"](params[key]),
        );
      } else {
        form["append"](buildInput(key, params[key], path, isArray));
      }
    }
  };
})(window["jQuery"] || window["Zepto"] || window["jqlite"]);
