
function getData(url, callback) {
    var RESPONSES = {
        '/countries': [
          {name: 'Cameroon', continent: 'Africa'},
          {name:'Fiji Islands', continent: 'Oceania'},
          {name: 'Guatemala', continent: 'North America'},
          {name: 'Japan', continent: 'Asia'},
          {name: 'Yugoslavia', continent: 'Europe'},
          {name: 'Tanzania', continent: 'Africa'}
        ],
        '/cities': [
          {name: 'Bamenda', country: 'Cameroon'},
          {name: 'Suva', country: 'Fiji Islands'},
          {name: 'Quetzaltenango', country: 'Guatemala'},
          {name: 'Osaka', country: 'Japan'},
          {name: 'Subotica', country: 'Yugoslavia'},
          {name: 'Zanzibar', country: 'Tanzania'}
        ],
        '/populations': [
          {count: 138000, name: 'Bamenda'},
          {count: 77366, name: 'Suva'},
          {count: 90801, name: 'Quetzaltenango'},
          {count: 2595674, name: 'Osaka'},
          {count: 100386, name: 'Subotica'},
          {count: 157634, name: 'Zanzibar'}
        ]
    };

    setTimeout(function () {
        var result = RESPONSES[ url ];
        if (!result) {
            return callback('Unknown url');
        }

        callback(null, result);
    }, Math.round(Math.random() * 1000));
}

var requests = ['/countries', '/cities', '/populations'],
  responses = {},
  input = window.prompt('Input something (city, country or continent):', 'Africa');

requests.forEach(function (request) {
    getData(request, function (error, result) {
        responses[request] = result;

        // check all responses
        if (requests.every(_exist(responses))) {
            var population = getPopulations(responses, input).reduce(_add('count'), 0);
            alert('Total population in ' + input + ' : ' + population);
        }
    });
});

function getPopulations(data, input) {
    var populations,
        countries,
        cities;

    // search input in cities
    populations = data[ '/populations' ]
      .filter(_compare(input, 'name'));

    if (populations.length) {
        return populations;
    }

    // search input in countries
    cities = data[ '/cities' ]
      .filter(_compare(input, 'country'))
      .map(_get('name'));

    populations = data[ '/populations' ]
      .filter(_compareSome(cities, 'name'));

    if (populations.length) {
        return populations;
    }

    // search input in continents
    countries = data[ '/countries' ]
      .filter(_compare(input, 'continent'))
      .map(_get('name'));

    cities = data[ '/cities' ]
      .filter(_compareSome(countries, 'country'))
      .map(_get('name'));

    populations = data[ '/populations' ]
      .filter(_compareSome(cities, 'name'));

    if (populations.length) {
        return populations;
    }

    return [];
}

function _exist(object) {
    return function (key) {
        return object.hasOwnProperty(key);
    };
}

function _compare(value, key) {
    return function (element) {
        return value === (key ? element[ key ] : element);
    };
}

function _compareSome(array, key) {
    return function (element) {
        return array.some(_compare(key ? element[ key ] : element));
    };
}

function _add(key) {
    return function (result, element) {
        return result += element[ key ];
    };
}

function _get(key) {
    return function (element) {
        return element[ key ];
    };
}
