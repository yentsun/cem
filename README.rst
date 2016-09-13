Launch service with 'node service.js'


Query examples
==============

Queries work both as JSON-POST and plain GET:

    http://localhost:10101/act?service=ces&action=get_rate&curr1=USD&curr2=RUB

Further examples are given in JSON-POST form.


Get currency detail
-------------------

Query::

    curl -i -X POST -d '{"service": "ces", "action": "detail", "curr": "UAH"}' 'http://localhost:10101/act'

Response::

    {
        "symbol": "UAH",
        "name": "Ukrainian Hryvnia",
        "symbol_native": "₴",
        "decimal_digits": 2,
        "rounding": 0,
        "code": "UAH",
        "name_plural": "Ukrainian hryvnias"
    }


Get currency rate (curr1/curr pair)
-----------------------------------

Query::

    curl -i -X POST \
        -d \
    '{"service": "ces", "action": "get_rate", "curr1": "USD", "curr2": "RUB", "country": "RU"}' \
    'http://localhost:10101/act'

Response::

    {
        "rate": 58.7816,
        "time": 1438014873128,
        "unit": 1
    }

Works in reverse: ... `"curr1": "RUB", "curr2": "USD"` ...::

    {
        "rate": 0.017012126243586428,
        "time": 1438014873128,
        "unit": 1
    }


Convert currencies
------------------

Query::

    curl -i -X POST \
       -d \
    '{"service": "ces", "action": "convert", "output_curr": "USD", "input_curr": "RUB", "amount": 100, "country": "RU"}' \
    'http://localhost:10101/act'

Response::

    {
         "converted_amount": 1.7012126243586427
    }


Fetch rates from remote source
------------------------------

Query::

    curl -i -X POST \
        -d \
    '{"service": "ces", "action": "fetch", "source": "cbr.ru"}' \
     'http://localhost:10101/act'

Response::

    {
        "fetched": 33
    }


Make call to convert currencies from within project code
--------------------------------------------------------

    require('seneca')({log:'ces-client'}).client()
        .act({
                service: 'ces',
                action: 'convert',
                input_curr: input_currency,
                output_curr: output_currency,
                amount: amount,
                country: country
            },
            function (error, result) {
                cb(error, result.converted_amount);
            });

jhk
