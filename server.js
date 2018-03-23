(function () {
    'use strict';

    var promise = require('bluebird');
    var twitch = require('./twitch.js');

    twitch.getStreams();
})();
