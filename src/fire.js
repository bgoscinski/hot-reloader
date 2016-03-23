'use strict';

const lodash = require('lodash')

module.exports = lodash.once((opts) => {
  const fire = new (require('events').EventEmitter)()
  const watcherOpts = lodash.defaults(opts, {
    ignoreInitial: true,
    persistent: false,
    ignored: /(node_modules|jspm_packages|bower_components)/
  })

  const watcher = require('agg-watcher')
    .watch(require.main.filename, watcherOpts, (changes, done) => {
      changes.changed.forEach(onFileChange);
      done()
    })


  const Module = require.main.constructor
  const load = Module.prototype.load
  Module.prototype.load = function(filename) {
    const loaded = load.call(this, filename)
    watcher.add(filename)
    return loaded
  }

  return fire
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
