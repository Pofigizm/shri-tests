var http = require('http'),
    fs = require('fs'),
    option, file, str, data, fields,
    httpFn, endFn, fsFn;

option = {
  host: 'www.flysfo.com',
  path: '/flightprocessing/fullFlightData.txt'
};

file = 'app/scripts/data.jsonp';

httpFn = function(response) {
  str = '';
  console.timeEnd('http');
  console.time('data');
  response.on('data', function (chunk) {
    str += chunk;
  });
  response.on('end', endFn);
};

endFn = function() {
  console.timeEnd('data');
  console.time('parse');
  data = JSON.parse(str).aaData;
  fields = {};
  data.forEach(function(elem){
    Object.keys(elem).reduce(function(res, el){
      res[el] = res[el] ? res[el] + 1 : 1;
      return res;
    }, fields);
  });
  fields = Object.keys(fields).sort(function(a, b) {
    return fields[b] - fields[a];
  });
  console.timeEnd('parse');
  console.time('write');
  fs.writeFile(file, 'ShriData = ' + JSON.stringify({
    head: fields,
    data: data
  }, null, 2) + ';', fsFn);
};

fsFn = function(err) {
  if (!err) {
    console.timeEnd('write');
  }
};

console.time('http');
http.get(option, httpFn).end();

