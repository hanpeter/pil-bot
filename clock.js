(function () {
    'use strict';

    var CronJob = require('cron').CronJob;
    var worker = require('./worker.js');

    var job = new CronJob({
        cronTime: '* * * * *',  // Run every minute
        // TODO: Update this to queue the job rather than running it itself
        onTick: worker.work,
        timeZone: 'Etc/UTC'
    });
    job.start();
})();
