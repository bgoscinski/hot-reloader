'use strict'

const swap = require('./swap.js')

exports.reloadFile = (filename) => {
  filename = require.resolve(filename) // normalize it
  const oldModule = require.cache[filename]

  delete require.cache[filename] // cache bust
  require(filename) // reload

  const newModule = require.cache[filename]
  require.cache[filename] = oldModule

  swap.swapModule(oldModule, newModule)
}

const forEach = require('lodash/fp/forEach')
const spread = require('lodash/spread')
exports.reloadMany = forEach(spread(exports.reloadFile))
