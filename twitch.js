(function () {
    'use strict';

    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));

    function twitch() {
        var accessToken = null;

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
                }).then(function (resp) {
                    console.log(resp.body);
                    accessToken = resp.body.access_token;
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
                    .then(function (resp) {
                        console.log(resp.body.data);
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
                    .then(function (resp) {
                        console.log(resp.body.data);
                        return resp.body.data;
                    });
            }
        };
    }

    module.exports = twitch();
})();
