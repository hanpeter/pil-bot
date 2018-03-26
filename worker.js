(function () {
    'use strict';

    var Promise = require('bluebird');
    var _ = require('lodash');
    var twitch = require('./twitch.js');
    var rollbar = require('./rollbar.js');
    var logger = require('./logger.js');
    var discord = require('./discord.js');

    function worker() {
        var streamerChannel = process.env.STREAMERS ? JSON.parse(process.env.STREAMERS) : false;

        return {
            work: function () {
                var streamers = {};

                if (!streamerChannel) {
                    logger.warn('No streamers are configured. Exiting.');
                    return;
                }
                return twitch.getUsers(Object.keys(streamerChannel))
                    .then(function (users) {
                        return Promise.try(function () {
                            _.forEach(users, function (user) {
                                streamers[user.id] = user;
                            });
                            logger.info('Got mapping from user ID to user:', streamers);
                        });
                    })
                    .then(function () {
                        return twitch.getStreams(Object.keys(streamers));
                    })
                    .then(function (streams) {
                        _.forEach(streams, function (stream) {
                            var streamer = streamers[stream.user_id];
                            var channelId = streamerChannel[streamer.login];
                            discord.notify(channelId, stream, streamers[stream.user_id])
                        });
                    })
                    .catch(function (error) {
                        // GOTCHA: This means errors from API calls are potentially logged twice.
                        //         However, I do want to catch any exceptions thrown elsewhere without copying & pasting
                        //         error logging code everywhere. So, this is the most elegant I can come up with
                        //         at this time. Looking at the Rollbar's source code and based on a small
                        //         empirical test, looks like they have a logic to prevent duplicate logging.
                        rollbar.error(error);
                        logger.error(error);
                        throw error;
                    });
            }
        };
    }

    module.exports = worker();
})();
