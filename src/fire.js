'use strict'

const lodash = require('lodash')

module.exports = lodash.once((matcherSrc, optsSrc) => {
  const reloader = new (require('events').EventEmitter)()
  const opts = lodash.defaults(optsSrc, {
    ignoreInitial: true,
    persistent: false,
    ignored: /(node_modules|jspm_packages|bower_components)/
  })

  const matcher = require('anymatch')(matcherSrc)
  const watcher = require('agg-watcher')
    .watch([require.main.filename].filter(matcher), opts, (changes, done) => {
      changes.changed.forEach(onFileChange)
      done()
    })


  const Module = require.main.constructor
  const load = Module.prototype.load
  Module.prototype.load = function(filename) {
    const loaded = load.call(this, filename)

    if (matcher(filename)) {
      watcher.add(filename)
    }

    return loaded
  }

  return reloader
})

const onFileChange = lodash.spread((filename) => {
  console.log(filename)
  filename = require.resolve(filename) // normalize it
  const oldModule = require.cache[filename]

  delete require.cache[filename] // cache bust
  require(filename) // reload

  const newModule = require.cache[filename]
  require.cache[filename] = oldModule

  require('./swap.js').swap(oldModule, newModule)
})
