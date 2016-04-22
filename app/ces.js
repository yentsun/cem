/**
 * Currency Exchange Monitor
 */
"use strict";

var async = require('async'),
    _ = require('lodash'),
    source = require('./source.js'),
    validator = require('validator'),
    countries = require('./data/countries.json'),
    ISOMaps = require('./data/iso_maps.json'),
    ISOCurrMap = ISOMaps.currencies,
    ISOCountryMap = ISOMaps.countries;

module.exports = function ces(options) {
    var seneca = this;

    // DETAIL
    seneca.add('service:ces,action:detail', function(msg, respond) {
        var curr_id = msg.curr,
            currencies = require('./data/currencies.json');
        if (validator.isNumeric(curr_id)) {
            curr_id = ISOCurrMap[curr_id]
        }
        respond(null, currencies[curr_id])
    });


    // GET RATE
    seneca.add('service:ces,action:get_rate', function(msg, respond) {
        var rate_record = seneca.make('rate'),
            country_id = msg.country, // ISO name
            curr1_id = msg.curr1,
            curr2_id = msg.curr2,
            country = countries[country_id],
            origin_curr = country.currency,
            search = {curr2: origin_curr, country: country_id};

        if (curr1_id == curr2_id) {
            return respond(null, {rate: 1})
        } else {

            // direct
            if (curr2_id == origin_curr) {
                search.curr1 = curr1_id;
                rate_record.list$(search, function(error, list) {
                    if (list.length) {
                        respond(null, {rate: list[0].rate})
                    } else {
                        seneca.log.debug('no rate for ', curr2_id);
                        respond(null, null)
                    }
                });
            }

            // reverse
            else if (curr1_id == origin_curr) {
                search.curr1 = curr2_id;
                rate_record.list$(search, function(error, list) {
                    if (list.length) {
                        var rate = 1/list[0].rate;
                        respond(null, {rate: rate})
                    } else {
                        seneca.log.debug('no rate for ', curr1_id);
                        respond(null, null)
                    }
                })
            }

            // cross
            else {
                search.curr1 = curr1_id;
                rate_record.list$(search, function(error, list) {
                    if (list.length) {
                        var rate1 = list[0].rate;
                        search.curr1 = curr2_id;
                        rate_record.list$(search, function(error, list) {
                            if (list.length) {
                                var rate2 = list[0].rate;
                                respond(null, {rate: rate1 / rate2})
                            } else {
                                seneca.log.debug('no rate for', curr2_id);
                                respond(null, null)
                            }
                        });
                    } else {
                        seneca.log.debug('no rate for', curr1_id);
                        respond(null, null)
                    }
                });
            }
        }
    });


    // CONVERT
    seneca.add('service:ces,action:convert', function(msg, respond) {
        var output_curr = msg.output_curr,
            input_curr = msg.input_curr,
            country = msg.country,
            amount = parseFloat(msg.amount);

        if (validator.isNumeric(country)) country = ISOCountryMap[country];
        if (validator.isNumeric(input_curr)) input_curr = ISOCurrMap[input_curr];
        if (validator.isNumeric(output_curr)) output_curr = ISOCurrMap[output_curr];

        if (!(country in countries)) {
            seneca.log.debug('source country unknown: ', country);
            return respond(null, null)
        }

        seneca.act('service:ces,action:get_rate', {curr1: input_curr, curr2: output_curr, country: country},
            function(error, result) {
                if (error) return respond(error);
                if (!result) return respond(null, null);
                var rate = result.rate,
                    converted =  amount * rate;
                if (!options.test) {
                    seneca.log.info('converted ' + amount + ' ' + input_curr + ' to ' + converted + ' ' + output_curr);
                }
                respond(null, {converted_amount: converted})
            })
    });


    // STORE RATE
    seneca.add('service:ces,action:store_rate', function(msg, respond) {
        var curr1 = msg.curr1,
            curr2 = msg.curr2,
            rate = parseFloat(msg.rate.toString().replace(',', '.')),
            unit = msg.unit ? parseInt(msg.unit) : 1,
            source_name = msg.source,
            country = source.detail(source_name).country;

        // validate data
        seneca.act('service:ces,action:detail,curr:'+curr1, function(error, result) {
            if (!result) {
                respond(seneca.fail(null, 'Bad currency: '+curr1))
            }
        });
        seneca.act('service:ces,action:detail,curr:'+curr2, function(error, result) {
            if (!result) {
                respond(seneca.fail(null, 'Bad currency: '+curr2))
            }
        });
        seneca.act('service:ces,action:detail,curr:'+curr2, function(error, result) {
            if (!result) {
                respond(seneca.fail(null, 'Bad currency: '+curr2))
            }
        });
        if (rate) {
            var rate_record = seneca.make('rate');
            rate_record.list$({curr1: curr1, curr2: curr2, source: source_name}, function(error, list) {
                if (list.length > 0) {
                    // update
                    rate_record.load$(list[0].id, function(error, record) {
                        record.rate = rate;
                        record.unit = unit;
                        record.time = Date.now();
                        record.save$(function(error, rate_record) {
                            respond(error, rate_record)
                        });
                    });
                } else {
                    // new
                    rate_record.curr1 = curr1;
                    rate_record.curr2 = curr2;
                    rate_record.rate = rate;
                    rate_record.unit = unit;
                    rate_record.source = source_name;
                    rate_record.country = country;
                    rate_record.time = Date.now();
                    rate_record.save$(function(error, rate_record) {
                        respond(error, rate_record)
                    });
                }
            });
        } else {
            respond(seneca.fail(null, 'No exchange rate specified!'))
        }

    });


    // LIST
    seneca.add('service:ces,action:list', function(msg, respond) {
        var rate = seneca.make('rate');
        rate.list$(function(error, result) {
            respond(error, result)
        })
    });


    // FETCH
    seneca.add('service:ces,action:fetch', function(msg, respond) {
        var source_name = msg.source,
            source_currency = source.detail(source_name).currency,
            new_rec_count = 0;

        var logger = seneca.log;
        seneca.log.debug('parsing source: ', source_name);
        source.parse(source_name, seneca, function(error, curr_list) {
            logger.debug('finished parsing source: ', source_name);
            if (error || !curr_list) {
                logger.error('fetching ' + source_name + ' FAILED');
                return respond(null, {fetched: 0})
            } else {
                if (curr_list && curr_list.length) logger.debug('fetched items: ', curr_list.length);
                logger.debug('storing items: ', source_name);
                async.each(curr_list, function (curr, done) {
                    // store rate with `action:store_rate`
                    seneca.act('service:ces,action:store_rate',
                        {
                            curr1: curr.iso_name,
                            curr2: source_currency,
                            rate: curr.rate,
                            unit: curr.unit,
                            source: source_name
                        },
                        function (error, result) {
                            if (result.id) {
                                new_rec_count++;
                            }
                            done()
                        });
                }, function (error) {
                    if (error) logger.error(error);
                    logger.debug('stored ' + new_rec_count + ' records from ' + source_name);
                    respond(null, {fetched: new_rec_count})
                })
            }
        });
    });


    // INIT
    if (!options.test) {
        seneca.add('init:ces', function(msg, respond) {
            console.log('');
            console.log('*****************************');
            console.log('* Currency Exchange Service *');
            console.log('*****************************');
            console.log('');
            respond(null, null)
        })
    }
};
