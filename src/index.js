"use strict";
/**
 * @param {Array.<string>} childDomains           Array of permited domains.
 */
exports.setupParentListener = function (childDomains) {
    window.addEventListener("message", function (e) { return _parentMessageHandler(e, childDomains); }, false);
};
/**
 * @param {string} key           Key of the desired data you want to retrieve from parent
 * @param {Function} callback    Callback function to handle/save data
 */
exports.getDataFromParent = function (key, callback) {
    window.addEventListener("message", function (e) { return _childMessageHandler(e, callback); }, false);
    window.parent.postMessage({ action: "get", key: key }, "*");
};
// Private methods
function _childMessageHandler(event, callback) {
    var _a = event.data, action = _a.action, data = _a.data;
    if (action === "returnData") {
        callback(data);
        return data;
    }
}
function _parentMessageHandler(event, domains) {
    if (!domains.includes(event.origin))
        return;
    var _a = event.data, action = _a.action, key = _a.key, value = _a.value;
    switch (action) {
        case "update":
            // Just in case child needs to update parent
            window.localStorage.setItem(key, JSON.stringify(value));
            break;
        case "get":
            var data = JSON.parse(window.localStorage.getItem(key));
            event.source.postMessage({ action: "returnData", key: key, data: data }, "*");
        default:
            break;
    }
}
