(function () {
    'use strict';

    var Discord = require('discord.js');
    var Promise = require('bluebird');
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

        return {
            notify: function (channelId, stream, streamer, game) {
                return login()
                    .then(function () {
                        var channel = client.channels.get(channelId);

                        if (channel) {
                            return channel;
                        }
                        else {
                            throw Error('Invalid channel ID: ' + channelId);
                        }
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
                                    url: stream.thumbnail_url.replace('{width}', 480).replace('{height}', 270),
                                },
                                timestamp: new Date(stream.started_at),
                                footer: {
                                    text: stream.id,
                                }
                            }
                        };
                        logger.debug(message);
                        logger.info(
                            'Created a notification for', streamer.login,
                            'at Channel', channel.name,
                            'in Guild', channel.guild.name
                        );
                        channel.send(message);
                    });
            }
        };
    }

    module.exports = discord();
})();
