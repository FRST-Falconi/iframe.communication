'use-strict'

/**
 * @param {Array.<string>} childDomains           Array of permited domains.
 */
exports.setupParentListener = (childDomains, debug = false) => {
  if (debug) console.log('Setting up Parent Listener')

  window.addEventListener(
    'message',
    (e) => _parentMessageHandler(e, childDomains, debug),
    false
  )
}

/**
 * @param {string || Array.<string>} key Key of the desired data you want to retrieve from parent
 * @param {Function || Array.<function>} callback    Callback function to handle/save data
 */
exports.getDataFromParent = (key, callback, debug = false) => {
  if (debug) console.log(`Asking parent for key ${key} `)

  window.addEventListener(
    'message',
    (e) => _childMessageHandler(e, callback, debug),
    false
  )

  window.parent.postMessage({ action: 'get', key: key }, '')
}

/**
 * @param {string} key           Key of the desired data you want to retrieve from parent
 * @param {Object} value         Value that must be updated on parent
 */
exports.updateDataFromChildren = (key, value, debug = false) => {
  if (debug) console.log(`Updating parent key ${key} `)

  window.parent.postMessage({ action: 'update', key: key, value: value }, '*')
}

// Private methods
function _childMessageHandler(event, callback, debug) {
  if (debug) console.log('received event in children', event)
  const { action, data } = event.data
  if (action === 'returnData') {
    callback(data)
    return data
  }
}

function _parentMessageHandler(event, domains, debug) {
  if (debug) console.log('received event in parent', event)

  if (!domains.includes(event.origin)) return

  const { action, key, value } = event.data

  if (action === 'update') {
    window.localStorage.setItem(key, JSON.stringify(value))
  } else if (action === 'get') {
    let data = {}

    if (Array.isArray(key)) {
      key.forEach((nameKey) => {
        data[nameKey] = JSON.parse(window.localStorage.getItem(nameKey))
      })
    } else {
      data = JSON.parse(window.localStorage.getItem(key))
    }

    event.source.postMessage({ action: 'returnData', key, data }, '*')
  }
}
