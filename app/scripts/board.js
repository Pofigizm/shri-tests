/* globals ShriData: false */
var shriBoard;

document.addEventListener('DOMContentLoaded', function(){
  console.time('render');

  var board = document.createElement('table'),
      container = document.querySelector('.board-wrapper'),
      inner = '',
      trArrival = 0,
      trDeparture = 0;

  // head of table
  inner += '<thead><tr class="board-head">' +
    shriBoard.reduce(function(res, el) {
      return res + _html({
        tag: 'th',
        klass: el.klass,
        value: 'name'
      }, el);
    }, '') +
    '</tr></thead>';

  // body of table
  inner += '<tbody>' +
    ShriData.data.reduce(function(res, el, ix) {
      // add specific class to type
      var typeKlass;

      if (el['FlightType'] === 'A') {
        typeKlass = ' board-arrival';
        typeKlass += typeKlass + (trArrival++ % 2 === 0 ? '-even' : '-odd');
      } else {
        typeKlass = ' board-departure';
        typeKlass += typeKlass + (trDeparture++ % 2 === 0 ? '-even' : '-odd');
      }
      // -even and -odd is fallback :nth-child(2n of .class) selector

      return res + '<tr class="board-row' + typeKlass + '" data-index="' + ix + '">' +
        shriBoard.reduce(function(inres, inel) {
          return inres + _html({
            tag: 'td',
            klass: inel.klass,
            value: inel.field
          }, el);
        }, '') +
        '</tr>';
    }, '') +
    '</tbody>';
 
  board.className = 'board';
  board.innerHTML = inner;
  board.addEventListener('click', function(event) {
    var row = _closest(event.target, function(el) {
      return el.className === 'board-row'; 
    });
    if (row) {
      alert(row.getAttribute('data-index'));
    }
  });

  container.appendChild(board);
  console.timeEnd('render');
  console.log(ShriData);
});

shriBoard = [
  {
    name: 'Тип',
    klass: 'board-type',
    field: [
      {
        tag: 'span',
        klass: 'board-status-full',
        value: 'FlightType'
      }
    ]
  }, {
    name: 'Номер',
    klass: 'board-number', 
    field: [
      {
        tag: 'span',
        klass: 'board-number-code',
        value: 'FlightNum'
      }, {
        tag: 'span',
        klass: 'board-number-full',
        value: 'FlightNumFull'
      }
    ]
  }, {
    name: 'Компания',
    klass: 'board-company',
    field: [
      {
        tag: 'span',
        klass: 'board-company-code',
        value: 'Carrier'
      }, {
        tag: 'span',
        klass: 'board-company-full',
        value: 'CarrierFull'
      }, {
        tag: 'img',
        klass: 'board-company-logo',
        src: 'CarrierLogo'
      }
    ]
  }, {
    name: 'Судно',
    klass: 'board-aircraft',
    field: [
      {
        tag: 'span',
        klass: 'board-aircraft-full',
        value: 'Aircraft'
      }
    ]
  }, {
    name: 'Город',
    klass: 'board-city',
    field: [
      {
        tag: 'span',
        klass: 'board-city-code',
        value: 'CityCode'
      }, {
        tag: 'span',
        klass: 'board-city-full',
        value: 'CityFull'
      }
    ]
  }, {
    name: 'Время',
    klass: 'borad-time',
    field: [
      {
        tag: 'spam',
        klass: 'board-time-full',
        value: 'EstTime'
      }
    ]
  }, {
    name: 'Статус',
    klass: 'board-status',
    field: [
      {
        tag: 'span',
        klass: 'board-status-full',
        value: 'Status'
      }
    ]
  }, {
    name: 'Комментарии',
    klass: 'board-comments',
    field: [
      {
        tag: 'span',
        klass: 'board-comments-full',
        value: 'Comment'
      }
    ]
  }
];

function _html(tmpl, data) {
  var tag = tmpl.tag || 'div',
      klass = tmpl.klass,
      src = data[tmpl.src],
      href = data[tmpl.href],
      noValueTag = ['img'],
      value;

  if ( Array.isArray(tmpl.value) ) {
    value = tmpl.value.reduce(function(res, el) {
      return res + _html(el, data);
    }, '');
  } else {
    value = String(data[tmpl.value] || 'text');
  }

  return '<' + tag +
    (klass ? ' class="' + klass + '"': '') + 
    (src   ? ' src="'   + src   + '"': '') + 
    (href  ? ' href="'  + href  + '"': '') + 
    '>' +
    (noValueTag.indexOf(tag) > -1 ? '' : value) +
    '</' + tag + '>';
}

function _closest(el, fx) {
  return el && (fx(el) ? el : _closest(el.parentNode, fx));
}

