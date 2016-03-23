exports.swap = (oldModule, newModule) => {
  const oldExports = oldModule.exports;
  const newExports = newModule.exports;

  require('./fire')().emit('swap', oldModule, newModule);
  if (oldExports && typeof oldExports.__hotReload === 'function') {
    oldExports.__hotReload(oldModule, newModule);
  }

  const difference = require('lodash/difference');
  const keys = require('lodash/keys');
  difference(keys(oldExports), keys(newExports)).forEach((key) => {
    delete oldExports[key];
  })

  Object.assign(oldExports, newExports);
};
