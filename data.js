var http = require('http'),
    fs = require('fs'),
    option, file, str, data, fields,
    httpFn, endFn, fsFn, exportCb;

var airCraft = [
  'Airbus A340', 
  'Airbus A340',
  'Airbus A340',
  'Boeing 777',
  'Airbus A380',
  'Boeing 777',
  'Boeing 747',
  'Boeing 747',
  'Airbus A380',
  'Airbus A380'
];

var statusList = ['Landed', 'Cancelled', 'Retimed', 'Confirmed'];

option = {
  host: 'www.flysfo.com',
  path: '/flightprocessing/fullFlightData.txt'
};

file = 'app/scripts/data.json';

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
    elem['CarrierLogo'] = '/images/logo.png';
    elem['Aircraft'] = airCraft[Math.floor(Math.random() * 10)];
    elem['Status'] = statusList[Math.floor(Math.random() * 4)];
    elem['Comment'] = 'comment #' + Math.floor(Math.random() * 999);
  });
  fields = Object.keys(fields).sort(function(a, b) {
    return fields[b] - fields[a];
  });
  console.timeEnd('parse');
  console.time('write');
  fs.writeFile(file, 'ShriData = ' + JSON.stringify({
    head: fields,
    data: data.slice(0, 100)
  }, null, 2) + ';', fsFn);
};

fsFn = function(err) {
  if (!err) {
    console.timeEnd('write');
    exportCb();
  }
};

export function getShriData(callback) {
  exportCb = callback;
  console.time('http');
  http.get(option, httpFn).end();
}

