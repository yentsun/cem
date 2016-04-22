'use strict';

var assert = require('chai').assert,
    seneca = require('seneca')()
        .use('ces', {test: true}),
    ces = seneca.pin({service: 'ces', action: '*'});



describe('action:detail', function() {
    it('gets detail on currency "THB"', function(done) {
        ces.detail({curr: 'THB'}, function(err, detail) {
            if (err) return done(err);
            assert.equal(detail.symbol, '฿');
            assert.equal(detail.name, 'Thai Baht');
            done();
        });
    });
    it('gets detail on currency by ISO id 198 (THB) ', function(done) {
        ces.detail({curr: 198}, function(err, detail) {
            if (err) return done(err);
            assert.equal(detail.symbol, '฿');
            assert.equal(detail.name, 'Thai Baht');
            done();
        });
    })
});

describe('action:store_rate', function() {
    it('stores rate for THB/RUB pair', function(done) {
        ces.store_rate({curr1: 'RUB', curr2: 'THB', rate: 0.6, source: 'cbr.ru'},
            function(err, new_record) {
                if (err) return done(err);
                assert.isString(new_record.id);
                assert.equal(new_record.rate, 0.6);
                assert.equal(new_record.source, 'cbr.ru');
                assert.equal(new_record.country, 'RU');
                done();
            })
    });
    it('accepts rate as a string with ","', function(done) {
        ces.store_rate({curr1: 'RUB', curr2: 'THB', rate: "0,6", source: 'cbr.ru'},
            function(err, new_record) {
                if (err) return done(err);
                assert.equal(new_record.rate, 0.6);
                done();
            });
    });
    var rec_id = null;
    before(function() {
        ces.store_rate({curr1: 'RUB', curr2: 'THB', rate: 0.5, source: 'cbr.ru'},
            function(err, new_record) {
                rec_id = new_record.id
            });
    });
    it('updates rate record for same pair and source', function(done) {
        ces.store_rate({curr1: 'RUB', curr2: 'THB', rate: "0,6", source:'cbr.ru'},
            function(err, record) {
                if (err) return done(err);
                assert.equal(record.id, rec_id);
                done();
            });
    });
    it('returns error when unknown currency is being stored', function(done) {
        ces.store_rate({curr1: 'FAKE', curr2: 'THB', rate:"0,6", source: 'cbr.ru'},
            function(err, new_record) {
                if (err) {
                    assert.equal(err.message, 'seneca: Bad currency: FAKE');
                    done()
                }
            });
    });
});

describe('action:convert', function() {
    before(function() {
        ces.store_rate({curr1: 'THB', curr2: 'RUB', rate: 2, source: 'cbr.ru'});
        ces.store_rate({curr1: 'EUR', curr2: 'RUB', rate: 76.34, source: 'cbr.ru'});
        ces.store_rate({curr1: 'RUB', curr2: 'THB', rate: 0.25, source: 'bot.or.th'});
    });
    it('converts THB to RUB', function(done) {
        ces.convert({input_curr: 'THB', output_curr: 'RUB', amount: 100, country: 'RU'},
            function(err, result) {
                if (err) return done(err);
                assert.equal(result.converted_amount, 200);
                done();
            });
    });
    it('converts RUB to THB', function(done) {
        ces.convert({input_curr: 'RUB', output_curr: 'THB', amount: 100, country: 'RU'},
            function(err, result) {
                if (err) return done(err);
                assert.equal(result.converted_amount, 50);
                done();
            });
    });
    it('converts 194 (RUB) to 198 (THB) for country 177 (RU) by iso ids', function(done) {
        ces.convert({input_curr: 194, output_curr: 198, amount: 100, country: 177},
            function(err, result) {
                if (err) return done(err);
                assert.equal(result.converted_amount, 50);
                done();
            });
    });
    it('returns different convert amounts for countries RU and TH', function(done) {
        ces.convert({input_curr: 'RUB', output_curr: 'THB', amount: 100, country: 'RU'},
            function(err, result) {
                if (err) return done(err);
                assert.equal(result.converted_amount, 50);
                ces.convert({input_curr: 'RUB', output_curr: 'THB', amount: 100, country: 'TH'},
                    function(err, result) {
                        if (err) return done(err);
                        assert.equal(result.converted_amount, 25);
                        done();
                    });
            });
    });
    it('returns null when unknown currency specified', function(done) {
        ces.convert({input_curr: 'FAKE', output_curr: 'RUB', amount: 100}, function(err, result) {
            assert.isNull(result);
            done();
        });
    });
    it('converts with cross rate', function(done) {
        ces.convert({input_curr: 'EUR', output_curr: 'THB', amount: 100, country: 'RU'}, function(err, result) {
            if (err) return done(err);
            assert.equal(result.converted_amount, 3817);
            done();
        });
    });
    it('converts with cross rate in reverse', function(done) {
        ces.convert({input_curr: 'THB', output_curr: 'EUR', amount: 100, country: 'RU'}, function(err, result) {
            if (err) return done(err);
            assert.equal(result.converted_amount, 2.6198585276395074);
            done();
        });
    });
});
