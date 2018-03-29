(function () {
    'use strict';

    var Discord = require('discord.js');
    var Promise = require('bluebird');
    var _ = require('lodash');
    var logger = require('./logger.js');

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
            return channel.fetchMessages({ before: beforeMessage, limit: 3 })
                .then(function (messages) {
                    var existing = null;
                    var isGonePast = false;

                    messages.forEach(function (message) {
                        if (existing) {
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
                            existing = true;  // Setting `existing` to `true` to trigger short circuit
                            return false;
                        }
                    });

                    if (isGonePast) {
                        logger.info('Unable to find an existing message for Stream:', uniqueId);
                        return null;
                    }
                    else if (existing) {
                        logger.info('Able to find an existing message for Stream:', uniqueId);
                        return existing;
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
            notify: function (channelId, stream, streamer, game) {
                return login()
                    .then(function () {
                        return Promise.try(function () {
                            var channel = client.channels.get(channelId);

                            if (channel) {
                                return channel;
                            }
                            else {
                                throw Error('Invalid channel ID: ' + channelId);
                            }
                        });
                    })
                    .then(function (channel) {
                        var message = {
                            embed: {
                                color: 0xFF0000,
                                title: stream.title,
                                url: 'https://twitch.tv/' + streamer.login,
                                author: {
                                    name: streamer.display_name,
                                    icon_url: streamer.profile_image_url,
                                },
                                fields: [{
                                    name: 'Game',
                                    value: game.name,
                                    inline: true,
                                }, {
                                    name: 'Viewers',
                                    value: stream.viewer_count,
                                    inline: true,
                                }],
                                image: {
                                    url: (stream.thumbnail_url.replace('{width}', 480).replace('{height}', 270))
                                        + '?timestamp=' + (new Date().getTime()),
                                },
                                timestamp: new Date(stream.started_at),
                                footer: {
                                    text: stream.id,
                                }
                            }
                        };
                        logger.debug(message);

                        return getMessage(channel, message, client.user, stream.id, new Date(stream.started_at))
                            .then(function (existingMessage) {
                                var result = null;
                                if (existingMessage) {
                                    result = existingMessage.edit(message);
                                    logger.info(
                                        'Updated the existing notification for',
                                        streamer.display_name, '(' + streamer.login + ')',
                                        'at Channel', channel.name,
                                        'in Guild', channel.guild.name
                                    )
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
