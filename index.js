"use strict";

/**
 * @param {Array.<string>} childDomains           Array of permited domains.
 */
exports.setupParentListener = (childDomains) => {
  console.log('calling setup parent')
  window.addEventListener(
    "message",
    (e) => _parentMessageHandler(e, childDomains),
    false
  );
};

/**
 * @param {string} key           Key of the desired data you want to retrieve from parent
 * @param {Function} callback    Callback function to handle/save data
 */
exports.getDataFromParent = (key, callback) => {
  window.addEventListener(
    "message",
    (e) => _childMessageHandler(e, callback),
    false
  );

  window.parent.postMessage({ action: "get", key: key }, "*");
};

// Private methods
function _childMessageHandler(event, callback) {
  const { action, data } = event.data;
  if (action === "returnData") {
    callback(data);
    return data;
  }
}

function _parentMessageHandler(event, domains) {
  console.log('parent message received')
  if (!domains.includes(event.origin)) return;

  const { action, key, value } = event.data;

  switch (action) {
    case "update":
      // Just in case child needs to update parent
      window.localStorage.setItem(key, JSON.stringify(value));
      break;
    case "get":
      let data = JSON.parse(window.localStorage.getItem(key));
      event.source.postMessage({ action: "returnData", key, data }, "*");
    default:
      break;
  }
}
