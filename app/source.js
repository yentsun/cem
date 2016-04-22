/**
 * Sources parsing
 */
var fs = require('fs'),
    http = require('http'),
    Handlebars = require('handlebars'),
    parseString = require('xml2js').parseString,
    jsdom = require('jsdom'),
    countries = require('./data/countries.json'),
    jquery = fs.readFileSync(__dirname + "/lib/static/jquery.min.js", "utf-8");

// include precompiled HB templates
eval(fs.readFileSync('./templates/compiled.js')+'');

// get detail on source
var detail = function (source_name) {
    for (var iso in countries) {
            if (countries[iso].source.name == source_name) {
                var source_dict = countries[iso].source;
                // TODO optimize this
                source_dict.country = iso;
                source_dict.currency = countries[iso].currency;
                return source_dict
            }
    }
    return null
};


module.exports = {

    countries: countries,

    list: function () {
        var result = [];
        for (var iso in countries) {
            result.push(countries[iso].source)
        }
        return result;
    },

    detail: detail,

    parse: function(source_name, seneca, callback) {

        var source = detail(source_name),
            url = source.url,
            parser = source.parser;


        http.get(url, function (response) {
            var data = '';
            response.on("data", function (chunk) {
                seneca.log.debug('receiving data chunk from ', url);
                data += chunk;
            });
            response.on("end", function () {
                var parser_method = parsers[parser];
                seneca.log.debug('data received from ', url);
                parser_method(source_name, data, seneca, callback)
            });
        }).on("error", function (error) {
            callback(error, null);
        });
    }
};


/**
 * Parser collection
 */
var parsers = {

    // general template parser
    template: function(source_name, input_data, seneca, callback){
        parseString(input_data, function(error, result) {
            if (error) {
                seneca.log.error(error);
                return callback(null, null);
            }
            var template = Handlebars.templates[source_name];
            try {
                var output_data = JSON.parse(template(result));
                callback(null, output_data.currencies);
            } catch (error) {
                callback(error, null);
            }
        })
    },

    bsp_gov_ph: function(source_name, input_data, seneca, callback){
        jsdom.env({
            html: input_data,
            src: [jquery],
            done: function (errors, window) {
                var $ = window.$,
                    obj = $('tbody tr'),
                    output_data = {
                        country: "ph",
                        date: new Date().toISOString(),
                        currencies: []
                    };

                obj.each(function (index){
                    var cur = $(this).find('td').eq(8).text(),
                        rate = $(this).find('td').eq(14).text();

                    if(cur && cur.length == 3 && rate != ""){

                        output_data.currencies.push({
                            iso_name: cur,
                            rate: rate,
                            unit: 1
                        });
                    }
                    if((obj.length - 1) == index){
                        callback(null, output_data.currencies);
                    }
                });
            }
        });
    }
};
