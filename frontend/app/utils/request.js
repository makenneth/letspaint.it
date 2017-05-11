export default function request(url, options = { }) {
  let requestUrl = url;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.query) {
    const queryString = serializeParams(options.query);
    requestUrl = `${requestUrl}?${queryString}`;
  }

  options.headers = {
    ...headers,
    ...options.headers,
  };

  return fetch(requestUrl, options)
    .then(checkStatus, checkRequestError)
    .then(parseJSON);
}

function parseJSON(response) {
  if (response.status !== 204) {
    return response.json();
  }
  return true;
}

function checkStatus(response) {
  if (response.ok) {
    return response;
  }

  const error = new Error();
  error.error_description = response.statusText;
  error.code = response.status;

  return response.json()
    .then(json => {
      if (json.error_description) {
        // on valid json responses, there will be at least code and error_description
        throw json;
      }
      if (json.error) {
        if (json.error.error_description) {
          throw json.error;
        } else if (json.error.message) {
          error.error_description = json.error.message;
        }
      }
      throw error;
    }, () => {
      throw error;
    });
}

function checkRequestError(err) {
  return Promise.reject({
    error_description: err.message,
    error_native: err,
  });
}

function serializeParams(obj) {
  const str = [];
  Object.keys(obj).forEach(p => {
    if (Object.prototype.hasOwnProperty.call(obj, p) && obj[p] !== undefined && obj[p] !== null) {
      // we need to pass 0 and empty string
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  });
  return str.join('&');
}
