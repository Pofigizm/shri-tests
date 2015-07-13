## Yandex shri 2015 tests

### Задача 1

#### Условие

Сверстайте табло аэропорта. На нём должны быть представлены следующие данные:

* тип рейса (вылет/прилёт; например это может быть иконка);
* номер рейса;
* авиакомпания;
* логотип авиакомпании;
* тип воздушного судна;
* аэропорт назначения;
* плановое время вылета или прилёта;
* статус рейса (для вылетающих: регистрация, ожидание посадки, посадка закончена, вылетел; для прилетающих: по расписанию, летит, приземлился; для всех: задерживается до HH:MM, отменён);
* примечание (например, информация о код-шеринге с другими авиакомпаниями).

В качестве источника можно использовать данные онлайн-табло любого аэропорта мира.

Дизайн оформления выберите на своё усмотрение, при этом необходимо реализовать следующее:

* по наведению курсора на определённое место в табло контрастным цветом выделяются соответствующие строка и столбец;
* нечётные строки табло темнее чётных;
* количество отображаемых данных по высоте больше ширины экрана, при прокрутке заголовок таблицы приклеивается к верхней части видимой области окна браузера;
* при изменении ширины экрана браузера в табло автоматически скрываются и/или сокращаются значения наименее важных столбцов (например, при ширине 1000 пикселей вы показываете всю таблицу, при ширине 900 пикселей — убираете название авиакомпании, оставляя только логотип, 800 пикселей — сокращаете название воздушного судна (Boeing 737-800 -> B737) и так далее);
* в дополнение к предыдущему пункту сделайте так, чтобы по клику на соответствующую строчку в выплывающем окне показывались все данные рейса;
* два чекбокса над самим табло: прилёт и вылет, по нажатию показываются только соответствующие рейсы.

Плюсом будет, если вам удастся реализовать табло без JavaScript.

#### Решение


    <div class="airport-table">
      <header></header>
      <div></div>
      <footer></footer>
    </div>


### Задача 2

#### Условие

Существует API, которое умеет отвечать по трём URL: /countries, /cities и /populations. Клиентское приложение подсчитывает численность населения в Африке. Запросы друг от друга не зависят. Чтобы браузер пользователя не простаивал, клиентскому приложению важно уметь делать все три запроса одновременно. Реализацией API является функция getData(url, callback), которая принимает строку с URL запроса и функцию обратного вызова. В случае ошибки в callback первым аргументом будет передана строка ошибки, в случае успеха вторым аргументом будет передан ответ API.

Вам досталась реализация клиентского приложения, которое должно решать описанную выше задачу. Но в коде приложения есть ошибки, из-за которых фактический результат работы отличается от ожидаемого.

Как должно быть: приложение выводит в консоль суммарную популяцию в Африке.
Как на самом деле: приложение не выводит в консоль ничего.

#### Задание

* Найдите ошибку в коде приложения, из-за которой реальный результат работы отличается от ожидаемого. Опишите, как эта ошибка могла возникнуть и как её избежать в будущем.

* Добавьте в приложение новую возможность — диалог с пользователем. Приложение спрашивает название страны или города, а затем показывает численность населения. Для диалога можно использовать window.prompt.

#### Решение

* Проблема кода была в том что цикл for не создает скоп для каждого прохода и в момент выполнения callback переменная request будет всегда ссылаться на requests[3]. Простой способ починить - обернуть тело цикла в самовызывающуюся функцию. Как избежать? - не писать такой странный код.

* Я переписал код на более читаемый и лучше тестируемый. Поиск слова осуществляется сначала в городах, затем в странах а потом в континентах. В случае удачи поиск по более крупным сущностям не производится.

Демо можно посмотреть тут.


    var requests = ['/countries', '/cities', '/populations'];
    var responses = {};
    
    var input = window.prompt('Input something (city, country or continent):', 'Africa');
    
    requests.forEach(function(request){
      getData(request, function(error, result){
        responses[request] = result;
    
        // check all responses
        if ( requests.every(_exist(responses)) ) {
          var population = getPopulations(responses, input).reduce(_add('count'), 0);
          console.log('Total population in', input, ':', population);
        }
      });
    })
    
    
    function getPopulations(data, input){
      var populations,
          countries,
          cities;
    
      // search input in cities
      populations = data['/populations']
        .filter(_compare(input, 'name'));
    
      if (populations.length) {
        return populations;
      }
    
      // search input in countries
      cities = data['/cities']
        .filter(_compare(input, 'country'))
        .map(_get('name'));
    
      populations = data['/populations']
        .filter(_compareSome(cities, 'name'));
    
      if (populations.length) {
        return populations;
      }
    
      // search input in continents
      countries = data['/countries']
        .filter(_compare(input, 'continent'))
        .map(_get('name'));
    
      cities = data['/cities']
        .filter(_compareSome(countries, 'country'))
        .map(_get('name'));
    
      populations = data['/populations']
        .filter(_compareSome(cities, 'name'));
    
      if (populations.length) {
        return populations;
      }
    
      return [];
    }
    
    
    function _exist(object){
      return function(key){
        return object.hasOwnProperty(key);
      };
    }
    
    function _compare(value, key){
      return function(element){
        return value === (key ? element[key] : element);
      };
    }
    
    function _compareSome(array, key){
      return function(element){
        return array.some(_compare(key ? element[key] : element));
      };
    }
    
    function _add(key){
      return function(result, element){
        return result += element[key];
      };
    }
    
    function _get(key){
      return function(element){
        return element[key];
      };
    }

