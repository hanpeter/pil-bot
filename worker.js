(function () {
    'use strict';

    var Promise = require('bluebird');
    var _ = require('lodash');
    var twitch = require('./twitch.js');
    var rollbar = require('./rollbar.js');

    function worker() {
        var streamerDict = process.env.STREAMERS ? JSON.parse(process.env.STREAMERS) : false;

        return {
            work: function () {
                var streamerIds = {};

                if (!streamerDict) {
                    console.log('No streamers are configured. Exiting.');
                    return;
                }
                return twitch.getUsers(Object.keys(streamerDict))
                    .then(function (users) {
                        return Promise.try(function () {
                            _.forEach(users, function (user) {
                                streamerIds[user.id] = user.login;
                            });
                        });
                    })
                    .then(function () {
                        return twitch.getStreams(Object.keys(streamerIds));
                    })
                    .then(function (streams) {
                        _.forEach(streams, function (stream) {
                            console.log([streamerIds[stream.user_id], 'is currently streaming:', stream.title].join(' '));
                        });
                    })
                    .catch(function (error) {
                        // GOTCHA: This means errors from API calls are potentially logged twice.
                        //         However, I do want to catch any exceptions thrown elsewhere without copying & pasting
                        //         error logging code everywhere. So, this is the most elegant I can come up with
                        //         at this time. Looking at the Rollbar's source code and based on a small
                        //         empirical test, looks like they have a logic to prevent duplicate logging.
                        rollbar.error(error);
                        throw error;
                    });
            }
        };
    }

    module.exports = worker();
})();
