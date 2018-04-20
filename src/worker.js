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
                var streamGames = {};

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
                            logger.info('Created mapping from user ID to user');
                            logger.debug(streamers);
                        });
                    })
                    .then(function () {
                        return twitch.getStreams(Object.keys(streamers));
                    })
                    .then(function (streams) {
                        if (streams.length < 1) {
                            logger.info('No live streams.');
                            return;
                        }

                        var gameIds = _.map(streams, function (stream) { return stream.game_id; });

                        return twitch.getGames(gameIds)
                            .then(function (games) {
                                return Promise.try(function () {
                                    _.forEach(games, function (game) {
                                        streamGames[game.id] = game;
                                    });
                                    logger.info('Created mapping from game ID to game');
                                    logger.debug(streamGames);
                                });
                            })
                            .then(function () {
                                var promises = [];
                                _.forEach(streams, function (stream) {
                                    var streamer = streamers[stream.user_id] || {};
                                    var channelId = streamerChannel[streamer.login] || -1;
                                    var game = streamGames[stream.game_id] || {};
                                    promises.push(discord.notify(channelId, stream, streamer, game));
                                });

                                return Promise.all(promises);
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
