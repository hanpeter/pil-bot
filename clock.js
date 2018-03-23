(function () {
    'use strict';

    var CronJob = require('cron').CronJob;
    var worker = require('./worker.js');

    var job = new CronJob({
        cronTime: '* * * * *',  // Run every minute
        onTick: worker.work,
        timeZone: 'Etc/UTC'
    });
    job.start();
})();
