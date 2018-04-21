(function () {
    'use strict';

    var Rollbar = require('rollbar');
    var logger = require('./logger.js');

    function rollbar() {
        var rbClient;

        if (process.env.ROLLBAR_ACCESS_TOKEN){
            rbClient = new Rollbar({
                accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
                environment: process.env.ENVIRONMENT || 'development',
            });
        }
        else {
            logger.warn('ROLLBAR_ACCESS_TOKEN environment variable is not set. Not logging anything to Rollbar.');
            rbClient = null;
        }

        return {
            errorRequest: function (error, request) {
                if (!rbClient) {
                    return;
                }

                var req = {
                    headers: request.headers,
                    protocol: request.uri.protocol,
                    domain: request.uri.domain,
                    url: request.uri.path,
                    method: request.method,
                    body: request.body,
                };
                rbClient.error(error, req);
            },
            error: function (error) {
                if (!rbClient) {
                    return;
                }

                rbClient.error(error);
            },
        };
    }

    module.exports = rollbar();
})();
