(function () {
    'use strict';

    var log = require('loglevel');
    var logLevel = process.env.LOG_LEVEL || 'info';

    log.setDefaultLevel(logLevel);

    module.exports = log;
})();
