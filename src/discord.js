(function () {
    'use strict';

    var Discord = require('discord.js');
    var Promise = require('bluebird');
    var _ = require('lodash');
    var logger = require('./logger.js');

    var FETCH_MESSAGE_LIMIT = 3;

    function discord() {
        var client = new Discord.Client();
        var discordToken = process.env.DISCORD_BOT_TOKEN;

        function login() {
            if (client.readyTimestamp) {
                return Promise.resolve();
            }
            else {
                return client.login(discordToken)
                    .then(function () {
                        logger.log('Logged in as', client.user.tag);
                    });
            }
        }

        function getMessage(channel, content, user, uniqueId, timestamp, beforeMessage) {
            return channel.fetchMessages({ before: beforeMessage, limit: FETCH_MESSAGE_LIMIT })
                .then(function (messages) {
                    var existing = null;
                    var isGonePast = false;

                    messages.forEach(function (message) {
                        if (existing || isGonePast) {
                            // I was hoping to short circuit this loop using `return false` below.
                            // However, this forEach loop does not seem to support it. So, building
                            // my own short circuit logic.
                            return;
                        }

                        var embed = _.first(message.embeds);
                        if (!embed) {
                            return;
                        }

                        if (message.author.id == user.id
                            && message.createdTimestamp >= timestamp.getTime()
                            && new Date(embed.timestamp).getTime() == timestamp.getTime()
                            && embed.footer && embed.footer.text == uniqueId) {
                            existing = message;
                            return false;
                        }
                        else if (message.createdTimestamp < timestamp.getTime()) {
                            isGonePast = true;
                            return false;
                        }
                    });

                    if (existing) {
                        logger.info('Able to find an existing message for Stream:', uniqueId);
                        return existing;
                    }
                    else if (isGonePast || (messages.size < FETCH_MESSAGE_LIMIT)) {
                        logger.info('Unable to find an existing message for Stream:', uniqueId);
                        return null;
                    }
                    else {
                        var keys = Array.from(messages.keys());
                        logger.info(
                            'Unable to find an existing message for Stream', '(' + uniqueId + ')',
                            'within the messages', JSON.stringify(keys),
                            'Searching for it in the next batch'
                        );
                        var lastMessage = _.head(_.sortBy(keys));
                        return getMessage(channel, content, user, uniqueId, timestamp, lastMessage);
                    }
                });
        }

        return {
            notify: function (config, stream, streamer, game) {
                return login()
                    .then(function () {
                        return Promise.try(function () {
                            var channel = client.channels.get(config.channelId);

                            if (channel) {
                                return channel;
                            }
                            else {
                                throw Error('Invalid channel ID: ' + config.channelId);
                            }
                        });
                    })
                    .then(function (channel) {
                        var streamId = stream.id || -1;
                        var streamStartDateTime = stream.started_at ? new Date(stream.started_at) : new Date(0);
                        var streamImage = stream.thumbnail_url
                            ? stream.thumbnail_url.replace('{width}', 480).replace('{height}', 270) : null;

                        if (streamImage && config.shouldUpdateImage !== false) {
                            // If the image exists and this streamer is configured to update the image,
                            // add a query string to bust the cache.
                            // XXX: shouldUpdateImage defaults to true
                            streamImage += '?timestamp=' + (new Date().getTime());
                        }

                        var message = {
                            embed: {
                                color: 0xFF0000,
                                title: stream.title,
                                url: streamer.login ? 'https://twitch.tv/' + streamer.login : null,
                                author: {
                                    name: streamer.display_name,
                                    icon_url: streamer.profile_image_url,
                                },
                                fields: [{
                                    name: 'Game',
                                    value: game.name || 'N/A',
                                    inline: true,
                                }, {
                                    name: 'Viewers',
                                    value: stream.viewer_count || -1,
                                    inline: true,
                                }],
                                image: {
                                    url: streamImage,
                                },
                                timestamp: streamStartDateTime,
                                footer: {
                                    text: streamId,
                                }
                            }
                        };
                        logger.debug(message);

                        return getMessage(channel, message, client.user, streamId, streamStartDateTime)
                            .then(function (existingMessage) {
                                var result = null;
                                if (existingMessage) {
                                    if (config.shouldUpdateMessage !== false) {
                                        // Continue to update the message with the latest info to provide
                                        // the latest information to the Discord users.
                                        result = existingMessage.edit(message);
                                        logger.info(
                                            'Updated the existing notification for',
                                            streamer.display_name, '(' + streamer.login + ')',
                                            'at Channel', channel.name,
                                            'in Guild', channel.guild.name,
                                        )
                                    }
                                    else {
                                        // If the message exists and the streamer is configured not to update
                                        // the message, log it and move on.
                                        // XXX: shouldUpdateMessage defaults to true
                                        logger.info(
                                            streamer.display_name, '(' + streamer.login + ')',
                                            'is set to not update the message. Leaving the existing message',
                                            'at Channel', channel.name,
                                            'in Guild', channel.guild.name,
                                        )
                                    }
                                }
                                else {
                                    result = channel.send(message);
                                    logger.info(
                                        'Created a notification for',
                                        streamer.display_name, '(' + streamer.login + ')',
                                        'at Channel', channel.name,
                                        'in Guild', channel.guild.name
                                    );
                                }

                                return result;
                            });
                    });
            }
        };
    }

    module.exports = discord();
})();
