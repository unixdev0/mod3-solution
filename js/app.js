(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.directive('foundItems', FoundItemsDirective)
.constant('ApiBasePath', "https://davids-restaurant.herokuapp.com")
.constant('WildChar', "*");



function FoundItemsDirective() {
  var ddo = {
    templateUrl: 'templates/foundItems.html',
    scope: {
      foundXItems: '<',
      onRemove: '&'
    },
    controller: FoundItemsDirectiveController,
    controllerAs: 'foundItemsCtrl',
    bindToController: true
  };
  return ddo;
}

function FoundItemsDirectiveController() {
  var ctrl = this;

  ctrl.logger = function() {
    console.log('obj ref: ', this.obj);
  }
}

NarrowItDownController.$inject = ['$q', 'MenuSearchService', 'WildChar'];
function NarrowItDownController($q, MenuSearchService, WildChar) {
  var ctrl = this;

  ctrl.found = [];

  ctrl.logMenuItems = function () {
    if (typeof(ctrl.searchTerm) === 'undefined' || ctrl.searchTerm.length == 0) {
      ctrl.errorMessage = 'Nothing Found';
      return;
    }
    else {
      delete ctrl.errorMessage;
    }
    var promise = MenuSearchService.getMatchedMenuItems(ctrl.searchTerm.toLowerCase());
    promise.then(function (response) {
      console.log(response);
      ctrl.found = response;
      if (ctrl.found.length == 0) {
        ctrl.errorMessage = "Nothing Found";
      }
    })
    .catch(function (error) {
      console.log(error);
    })
  };

  ctrl.logLuckyMenuItems = function () {
    var searchLucky = 'for 2';
    if (typeof(ctrl.searchTerm) !== 'undefined') {
      delete ctrl.errorMessage;
    }
    delete ctrl.errorMessage;
    var promise = MenuSearchService.getLuckyMenuItems(searchLucky);
    promise.then(function (response) {
      console.log(response);
      ctrl.found = response;
    })
    .catch(function (error) {
      console.log(error);
    })
  };

  ctrl.menuItems = new Set();
  ctrl.getMenuItems = function () {
    if (type(ctrl.searchTerm) === 'undefined') {
      ctrl.errorMessage = 'Nothing Found';
    }
    delete ctrl.errorMessage;

    var promise = MenuSearchService.getAllMenuItems();
    promise.then(function (response) {
      console.log(response);
      ctrl.menuItems = response;
      if (ctrl.menuItems.length == 0) {
        ctrl.errorMessage = "Nothing Found";
      }
    })
    .catch(function (error) {
      console.log(error);
    })
  };

  ctrl.removeItem = function(index) {
    console.log('Remove item :', index);
    ctrl.found.splice(index, 1);
  }

}


MenuSearchService.$inject = ['$http', 'ApiBasePath', 'WildChar'];
function MenuSearchService($http, ApiBasePath, WildChar) {
  var service = this;

  service.getMenuCategories = function () {
    var response = $http({
      method: "GET",
      url: (ApiBasePath + "/categories.json")
    });

    return response;
  };


  service.getMatchedMenuItems = function (searchTerm) {
    var response = $http({
      method: "GET",
      url: (ApiBasePath + "/menu_items.json"),
      params: {
        description: searchTerm
      }
    }).then(function(result) {
      var items = [];
      if (result.data.menu_items !== 'undefined') {
        var data = result.data.menu_items;
        for (var item = 0; item < data.length; item++) {
          console.log("Item: ", data[item]);
          if (searchTerm === WildChar) {
              items.push(data[item]);
          }
          else {
            if (data[item].description.indexOf(searchTerm) !== -1) {
              items.push(data[item]);
            }
          }
        }
      }
      return items;
    });

    return response;
  };

  service.getLuckyMenuItems = function (searchLucky) {
    var response = $http({
      method: "GET",
      url: (ApiBasePath + "/menu_items.json"),
    }).then(function(result) {
      var items = [];
      if (result.data.menu_items !== 'undefined') {
        var data = result.data.menu_items;
        for (var idx = 0; idx < data.length; idx++) {
          var col = data[idx].description.trim().split(" ");
          if (data[idx].name.indexOf(searchLucky) !== -1) {
            items.push(data[idx]);
          }
        }
      }
      return items;
    });

    return response;
  };

  service.getAllMenuItems = function () {
    var response = $http({
      method: "GET",
      url: (ApiBasePath + "/menu_items.json"),
    }).then(function(result) {
      var items = new Set();
      if (result.data.menu_items !== 'undefined') {
        var data = result.data.menu_items;
        for (var idx = 0; idx < data.length; idx++) {
          var col = data[idx].description.trim().split(" ");
          for (var item in col) {
            items.add(item);
          }
        }
      }
      return items;
    });

    return response;
  };

}

})();
