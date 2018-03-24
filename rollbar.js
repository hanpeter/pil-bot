(function () {
    'use strict';

    var Rollbar = require('rollbar');

    function rollbar() {
        var rollbar = new Rollbar({
            accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
            environment: process.env.ENVIRONMENT,
        });

        return {
            errorRequest: function (error, request) {
                var req = {
                    headers: request.headers,
                    protocol: request.uri.protocol,
                    domain: request.uri.domain,
                    url: request.uri.path,
                    method: request.method,
                    body: request.body,
                };
                rollbar.error(error, req);
            },
            error: function (error) {
                rollbar.error(error);
            }
        }
    }

    module.exports = rollbar();
})();
