var source = require('./source.js'),
    async = require('async'),
    moment = require('moment'),
    handlers = require('seneca/lib/logging').handlers,
    common = require('seneca/lib/common'),
    schedule = require('node-schedule'),
    seneca = require('seneca'),
    plugin_name = 'ces';

seneca({
    timeout: 35000,
    log:{
        map:[{
            plugin:'ces',
            handler: function(){
                arguments[0] = moment(arguments[0]).format('DD.MM.YYYY HH:mm:ss');
                var arr = handlers.pretty.apply(null, common.arrayify(arguments));
                var time = arr[0],
                    id = arr[1],
                    level = arr[2],
                    type = arr[3],
                    plugin = arr[4],
                    message = arr[5];

                console.log('%s %s %s %s %s', time, level, type, plugin_name, message, arr.slice(6).join(' '))
            }}]
    }})
    .use('ces')
    .ready(function(error) {
        if (error) this.log.error(error);
        var sources = source.list(),
            seneca = this;
        async.each(sources, function(source, done) {
            var cron = source.schedule;
            seneca.act('service:ces,action:fetch,source:'+source.name, function(error, result) {
                if (error) this.log.error('error fetching from '+source.name);
                schedule.scheduleJob(cron, function(){
                    seneca.act('service:ces,action:fetch,source:'+source.name);
                });
                this.log.info('scheduled '+source.name +' @ '+cron);
            });
            done();
        }, function(error) {

        });
    })
    .listen();
