'use strict'

const matchAll = () => true

exports.hot = require('lodash/once')((matcherSrc, optsSrc) => {
  const events = require('events')
  const opts = require('lodash/defaults')(optsSrc, {
    ignoreInitial: true,
    persistent: false,
    ignored: /(node_modules|jspm_packages|bower_components)/
  })

  const matcher = matcherSrc ? require('anymatch')(matcherSrc) : matchAll
  const aggWatcher = require('agg-watcher')
  const reloader = require('./reloader')
  const toWatch = Object.keys(require.cache).filter(matcher)
  const watcher = aggWatcher.watch(toWatch, opts, (diff, done) => {
    reloader.reloadMany(diff.changed)
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

  return new events.EventEmitter()
})
