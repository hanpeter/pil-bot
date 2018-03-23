(function () {
    'use strict';

    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));

    function twitch() {
        var accessToken = null;
        var streamerDict = JSON.parse(process.env.STREAMERS) || {};

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
                        scope: '',
                    }
                }).then(function (resp) {
                    console.log(resp.body);
                    accessToken = resp.body.access_token;
                });
            }
        }

        return {
            getStreams: function (streamerIds) {
                return authenticate()
                    .then(function () {
                        return request({
                            url: 'https://api.twitch.tv/helix/streams',
                            method: 'GET',
                            headers: {
                                Authorization: 'Bearer ' + accessToken
                            },
                            qs: {
                                user_login: Object.keys(streamerDict)
                            }
                        });
                    })
                    .then(function (resp) {
                        console.log(resp.body);
                        return resp.body;
                    });
            }
        };
    }

    module.exports = twitch();
})();
