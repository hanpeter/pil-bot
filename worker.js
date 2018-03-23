(function () {
    'use strict';

    var Promise = require('bluebird');
    var _ = require('lodash');
    var twitch = require('./twitch.js');

    function worker() {
        var streamerDict = JSON.parse(process.env.STREAMERS) || {};

        return {
            work: function () {
                var streamerIds = {};

                twitch.getUsers(Object.keys(streamerDict))
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
                    });
            }
        };
    }

    module.exports = worker();
})();
