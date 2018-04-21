(function () {
    'use strict';

    var mocha = require('mocha');
    var sinon = require('sinon');
    var logLevel = require('loglevel');

    var module = '../src/logger.js';

    mocha.describe('Logger', function () {
        mocha.beforeEach(function () {
            // Clean up the environment variable
            delete process.env['LOG_LEVEL'];
        });

        mocha.it('Default log level is info', function () {
            // Set expectations
            var mock = sinon.mock(logLevel);
            mock.expects('setDefaultLevel').once().withArgs('info');

            require(module);

            // Verify
            mock.verify();
        });

        mocha.it('Environment variable should be respected', function () {
            // Set expectations
            var level = 'debug';
            process.env.LOG_LEVEL = level;
            var mock = sinon.mock(logLevel);
            mock.expects('setDefaultLevel').once().withArgs(level);

            require(module);

            // Verify
            mock.verify();
        });

        mocha.afterEach(function () {
            // Clean the require cache so it can be freshly loaded again
            delete require.cache[require.resolve(module)];
        });
    });
})();
