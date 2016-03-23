'use strict'

exports.swapModule = (oldModule, newModule) => {
  const oldExports = oldModule.exports
  const newExports = newModule.exports
  const hot = require('./hot').hot();

  hot.emit('swapping', oldModule, newModule)

  if (oldExports && typeof oldExports.__hotReload === 'function') {
    oldExports.__hotReload(oldModule, newModule)
  }

  const difference = require('lodash/difference')
  const keys = require('lodash/keys')
  difference(keys(oldExports), keys(newExports)).forEach((key) => {
    delete oldExports[key]
  })

  Object.assign(oldExports, newExports)

  hot.emit('swapped', oldModule, newModule)
}
