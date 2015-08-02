/* globals ShriData: false */
var shriBoard;

document.addEventListener('DOMContentLoaded', function(){
  console.time('render');

  var container = document.querySelector('.board-wrapper'),
      board = _node('table', 'board'),
      content = [],
      trArrival = 0,
      trDeparture = 0;

  board.appendChild(_node('thead', null, null, _html({
    tag: 'tr',
    klass: 'board-head',
    inner: shriBoard.reduce(_getRow('th', null, 'name'), '')
  })));

  content = _splitArr(ShriData.data, 100).map(function(tbody, index) {
    return _node('tbody', null, String(index), tbody.reduce(function(res, el, ix) {
      return res + _html({
        tag: 'tr',
        klass: _getTypeClass(el),
        index: ix,
        inner: shriBoard.reduce(_getRow('td', el), '')
      });
    }, ''));
  });

  [0, 1].forEach(_addContent);
  container.appendChild(board);

  board.addEventListener('scroll', function() {
    var center = document.body.clientHeight / 2,
        current = Number(content.filter(function(elem) {
          var rect = elem.getBoundingClientRect();
          return rect.top <= center && rect.bottom >= center;
        })[0].dataset.index);

    _addContent(current + 1);
    _removeContent(current - 2);

    _addContent(current - 1);
    _removeContent(current + 2);
  });

  board.addEventListener('click', function(event) {
    var row = _closest(event.target, function(el) {
      return el.className === 'board-row'; 
    });
    if (row) {
      alert(row.getAttribute('data-index'));
    }
  });

  console.timeEnd('render');
  console.log(ShriData);

  function _getTypeClass(data) {
    var typeKlass = 'board-row';

    if (data['FlightType'] === 'A') {
      typeKlass += ' board-arrival';
      typeKlass += ' board-arrival' + (trArrival++ % 2 === 0 ? '-even' : '-odd');
    } else {
      typeKlass += ' board-departure';
      typeKlass += ' board-departure' + (trDeparture++ % 2 === 0 ? '-even' : '-odd');
    }
    // -even and -odd is fallback :nth-child(2n of .class) selector
    return typeKlass;
  }

  function _getRow(tag, data, value) {
    return function(res, el) {
      return res + _html({
        tag: tag,
        klass: el.klass,
        value: value || el.field
      }, data || el);
    };
  }

  function _addContent(index) {
    if (_inBoard(index) || !content[index]) {
      return;
    }
    if (_inBoard(index + 1)) {
      board.insertBefore(content[index], content[index + 1]);
      board.scrollTop += content[index].getBoundingClientRect().height;
    } else {
      board.appendChild(content[index]);
    }
  }

  function _removeContent(index) {
    if (!_inBoard(index) || !content[index]) {
      return;
    }
    if (_inBoard(index + 1)) {
      board.scrollTop -= content[index].getBoundingClientRect().height;
    }
    board.removeChild(content[index]);
  }

  function _inBoard(index) {
    return [].indexOf.call(board.children, content[index]) !== -1;
  }

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

function _node(tag, klass, index, inner) {
  var node = document.createElement(tag || 'div');

  if (klass) {
    node.className = klass;
  }
  if (index) {
    node.setAttribute('data-index', index);
  }
  node.innerHTML = inner || '';
  return node;
}

function _html(tmpl, data) {
  var tag = tmpl.tag || 'div',
      klass = tmpl.klass,
      inner = tmpl.inner,
      index = tmpl.index,
      noValueTag = ['img'],
      src, href, value;

  data = data || {};
  src = data[tmpl.src];
  href = data[tmpl.href];

  if ( Array.isArray(tmpl.value) ) {
    value = tmpl.value.reduce(function(res, el) {
      return res + _html(el, data);
    }, '');
  } else {
    value = inner || String(data[tmpl.value] || 'text');
  }

  return '<' + tag +
    (klass ? ' class="'      + klass + '"': '') +
    (src   ? ' src="'        + src   + '"': '') +
    (href  ? ' href="'       + href  + '"': '') +
    (index ? ' data-index="' + index + '"' : '') +
    '>' +
    (noValueTag.indexOf(tag) > -1 ? '' : value) +
    '</' + tag + '>';
}

function _closest(el, fx) {
  return el && (fx(el) ? el : _closest(el.parentNode, fx));
}

function _splitArr(arr, size) {
  if (arr.length <= size) {
    return [arr];
  }
  return [arr.slice(0, size)]
    .concat(_splitArr(arr.slice(size), size));
}
