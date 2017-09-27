const angular = require('angular');
const storage = require('angular-local-storage');
const storageKey = 'list';

angular.module('todo', ['LocalStorageModule'])
.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('todoAPP');
}])
.controller('todoList', todoList);
function todoList(todoStorage) {
    var vm = this;
    vm.list = [];
    vm.showCompleted = true;
    vm.newTodo = '';
    vm.add = addToDo;
    vm.storeTodo = storeTodo;
    vm.remove = remove;
    todoStorage.get().then(resolveTodo);

    function addToDo() {
        todoStorage.put(vm.newTodo).then(resolveTodo);
    }
    function resolveTodo(data) {
        vm.list = data;
        vm.newTodo = '';
    }
    function storeTodo() {
        todoStorage.store(vm.list);
    }
    function remove(index) {
        todoStorage.remove(index);
    }
}
todoList.$inject = ['todoStorage'];

angular.module('todo').factory('todoLocalStorage', todoLocalStorage);
function todoLocalStorage(localStorageService, $q) {
    var vm = this;
    var todo = {
        list: [],
        put: put,
        get: get,
        get: get,
        remove: remove,
        store: store,
    };

    function put(element) {
        var def = $q.defer();
        todo.list.push({name: element, complete: false});
        _storeToStorage(todo.list);
        def.resolve(todo.list);
        return def.promise;
    }
    function get() {
        var def = $q.defer();
        todo.list = _getFromStorage();
        def.resolve(todo.list);
        return def.promise;
    }
    function store(list) {
        var def = $q.defer();
        todo.list = list;
        _storeToStorage(todo.list);
        def.resolve(todo.list);
        return def.promise;
    }
    function remove(index) {
        var def = $q.defer();
        todo.list.splice(index, 1);
        _storeToStorage(todo.list);
        def.resolve(todo.list);
        return def.promise;
    }

    function _storeToStorage(data) {
        localStorageService.set(storageKey, JSON.stringify(data));
    }
    function _getFromStorage() {
        return angular.copy(JSON.parse(localStorageService.get(storageKey) || '[]'));
    }
    return todo;
}
todoLocalStorage.$inject = ['localStorageService', '$q'];


angular.module('todo').factory('todoStorage', todoStorage);
function todoStorage($injector) {
    //we have only localStorageService, injected him
    return $injector.get('todoLocalStorage');
}
todoStorage.$inject = ['$injector'];

/**
* Completed task filter
*/
angular.module('todo').filter('filterComplete', filterComplete);
function filterComplete() {
    function filter(elements, show) {
        var filtered = [];
        for(let i = 0; i < elements.length;  i++) {
            if(elements[i].complete !== true || show === true) {
                filtered.push(elements[i]);
            }
        }
        return filtered;
    }
    return filter;
}
