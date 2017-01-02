(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.directive('foundItems', FoundItemsDirective)
.constant('ApiBasePath', "http://davids-restaurant.herokuapp.com")
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

NarrowItDownController.$inject = ['MenuSearchService', 'WildChar'];
function NarrowItDownController(MenuSearchService, WildChar) {
  var ctrl = this;

  ctrl.found = [];

  ctrl.logMenuItems = function () {
    if (typeof(ctrl.searchTerm) === 'undefined') {
      ctrl.searchTerm = WildChar;
    }
    var promise = MenuSearchService.getMatchedMenuItems(ctrl.searchTerm.toLowerCase());
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
      ctrl.errorMessage = 'Please enter the search terms';
    }
    delete ctrl.errorMessage;

    var promise = MenuSearchService.getAllMenuItems();
    promise.then(function (response) {
      console.log(response);
      ctrl.menuItems = response;
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
