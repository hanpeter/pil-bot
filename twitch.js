(function () {
    'use strict';

    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));
    var rollbar = require('./rollbar.js');
    var logger = require('./logger.js');

    function twitch() {
        var accessToken = null;

        function handleError(resp) {
            return Promise.try(function () {
                logger.debug(resp.body);
                if (resp.statusCode < 300 && resp.statusCode >= 200) {
                    return resp;
                } else {
                    var err = new Error(resp.body.message);
                    rollbar.errorRequest(err, resp.request);
                    logger.error('Received an error from Twitch:', resp.statusCode, resp.statusMessage, resp.body);
                    throw err;
                }
            });
        }

        function authenticate() {
            var clientId = process.env.TWITCH_CLIENT_ID;
            var clientSecret = process.env.TWITCH_CLIENT_SECRET;

            // TODO: Handle accessToken expiration. Make sure the expiration can happen at any time.
            if (accessToken) {
                return Promise.try(function () {
                    return accessToken;
                });
            } else {
                return request({
                        url: 'https://id.twitch.tv/oauth2/token',
                        method: 'POST',
                        json: true,
                        qs: {
                            client_id: clientId,
                            client_secret: clientSecret,
                            grant_type: 'client_credentials',
                        }
                    })
                    .then(handleError)
                    .then(function (resp) {
                        accessToken = resp.body.access_token;
                        logger.info('Got an access token from Twitch:', accessToken);
                    });
            }
        }

        return {
            getUsers: function (user_logins) {
                return authenticate()
                    .then(function () {
                        return request({
                            url: 'https://api.twitch.tv/helix/users',
                            method: 'GET',
                            json: true,
                            headers: {
                                Authorization: 'Bearer ' + accessToken,
                            },
                            qs: {
                                login: user_logins,
                            }
                        })
                    })
                    .then(handleError)
                    .then(function (resp) {
                        logger.info('Received', resp.body.data.length, 'users from Twitch');
                        return resp.body.data;
                    });
            },
            getStreams: function (streamerIds) {
                return authenticate()
                    .then(function () {
                        return request({
                            url: 'https://api.twitch.tv/helix/streams',
                            method: 'GET',
                            json: true,
                            headers: {
                                Authorization: 'Bearer ' + accessToken,
                            },
                            qs: {
                                user_id: streamerIds,
                            }
                        });
                    })
                    .then(handleError)
                    .then(function (resp) {
                        logger.info('Received', resp.body.data.length, 'streams from Twitch');
                        return resp.body.data;
                    });
            },
            getGames: function (gameIds) {
                return authenticate()
                    .then(function () {
                        return request({
                            url: 'https://api.twitch.tv/helix/games',
                            method: 'GET',
                            json: true,
                            headers: {
                                Authorization: 'Bearer ' + accessToken,
                            },
                            qs: {
                                id: gameIds,
                            }
                        })
                    })
                    .then(handleError)
                    .then(function (resp) {
                        logger.info('Received', resp.body.data.length, 'games from Twitch');
                        return resp.body.data;
                    })
            }
        };
    }

    module.exports = twitch();
})();
