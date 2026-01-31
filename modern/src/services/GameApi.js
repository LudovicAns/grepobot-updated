/**
 * Retrieves the base URL of the current webpage.
 *
 * @return {string} The origin part of the current window location (protocol, hostname, and port).
 */
function baseUrl() {
  return window.location.origin
}

/**
 * Constructs a full URL by appending the given path to the base URL
 * and adding query parameters if provided.
 *
 * @param {string} path - The path to be appended to the base URL.
 * @param {Object} [queryParameters={}] - An object representing query parameters as key-value pairs.
 * @return {string} The constructed URL with the provided path and query parameters.
 */
function buildUrl(path, queryParameters = {}) {
  let url = baseUrl() + path;
  if (queryParameters) {
    url += '?' + Object.keys(queryParameters).map((key) => `${key}=${queryParameters[key]}`).join(`&`)
  }
}

const game = {
  getData: async (townId, csrfToken) => {
    const url = buildUrl(`/api/data`, {
      townId,
      action: "get",
      h: csrfToken
    })

    const payload = JSON.stringify({
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
          type: "backbone"
        }
      ]
    })

    // todo: request
  }
}

export const GameApi = {

}