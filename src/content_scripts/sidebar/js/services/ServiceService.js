//TODO: implement a state for being sure getMatchingServices is retrieving something when everything is fully loaded

function BuildingStrategy() {
  this.uniqueNameService = function(name, client, deferred) {};
}

function NewServiceEdition() {
  BuildingStrategy.call(this);

  this.uniqueNameService = function(name, client, deferred) {
    deferred.resolve(client.hasServiceNamed(name));
  }
}

function ExistingServiceEdition() {
  BuildingStrategy.call(this);

  this.uniqueNameService = function(name, client, deferred) {
    if (client.services[client.currentServiceKey].name == name) {
      deferred.resolve(false);
    } else {
      deferred.resolve(client.hasServiceNamed(name));
    }
  }
}

serviceCreator.service("ServiceService", [
  "$q",
  "$timeout",
  "$http",
  function($q, $timeout, $http) {
    var $service = this;

    this.objectModel = "";
    this.currentProduct = "";
    this.services;
    this.currentServiceKey;
    this.buildingStrategy;
    this.currentXPath = "";
    this.storage = new LocalStorage();

    this.initialize = function() {
      this.storage.get("services").then((storedServices) => {
        if (storedServices.services && Object.keys(storedServices.services).length > 0) {
          $service.services = storedServices.services;
        } else {
          $service.services = {}; //check if this is necessary. I thunk this is the def value, but just in case
        }
      });

      //joaquin y paula
      this.storage.get("products").then((storedServices) => {
        if (storedServices.products && Object.keys(storedServices.products).length > 0) {
          $service.products = storedServices.products;
        } else {
          $service.products = {}; //check if this is necessary. I thunk this is the def value, but just in case
        }
      });
    };

    this.hasServiceNamed = function(name) {
      var serviceExists = false;
      Object.keys($service.services).some(function(key, index) {
        if ($service.services[key].name == name) {
          serviceExists = true;
          return;
        }
      });
      return serviceExists;
    };

    this.setObjectModel = function(nameObjectModel) {
        console.log("Se setea nombre del modelo");
        console.log("Actualmente vacio");
        console.log(this.objectModel);
        this.objectModel = nameObjectModel;
        console.log("Ahora ya no..");
        console.log(this.objectModel);
    };

    this.getObjectModel = function() {
        return this.objectModel;
    };


    this.getUrlDomain = function(url) {
      if (url) {
        var a = document.createElement('a');
        a.setAttribute('href', url);
        return a.hostname;
      }

      return "*";
    }
    this.getMatchingServices = function(url) {

      browser.runtime.sendMessage({
         call: "getFromRemoteRepo",
         args: {"key": "https://www.youtube.com/watch?v=fjyfZ6Ylezw&list=RDMMfjyfZ6Ylezw&start_radio=1"}
      })
      .then(function(res){
        console.log("REMOTE:", res);
      });

      var me = this,
        deferred = $q.defer();
      $timeout(function() {

        console.log("LOCAL", $service.services);
        deferred.resolve($service.services);

      }, 500);
      return deferred.promise;
    };


    this.newServiceWithName = function(name) {
      return {
        name: name,
        urlPattern: "*",
        favIcon: "",
        groups: ["public"],
        id: undefined,
        owner: "no_reply@lifia.info.unlp.edu.ar",
        propertySelectors: {},
        results: {
          selector: undefined,
          preview: undefined,
          properties: {}/* {name relativeSelector} */
        }
      };
    };

    this.asDeferred = function(action) {
      var deferred = $q.defer();
      $timeout(function() {
        if (action == undefined) {
          deferred.resolve();
        } else {
          const returnElem = action();
          deferred.resolve(returnElem);
        }
      }, 500);
      return deferred.promise;
    };

    this.logService = function() {
      this.asDeferred(function() {
        console.log($service.services[$service.currentServiceKey]);
        return;
      });
    };

    this.getService = function() { //Should be getCurrentService
      return this.asDeferred(function() {
        return $service.services[$service.currentServiceKey];
      });
    };

    this.removeService = function(key) {
      return this.asDeferred(function() {
        if ($service.services.hasOwnProperty(key)) {
          delete $service.services[key];
          $service.updateServices();
        }
        return;
      });
    };

    this.uniqueNameService = function(name) {
      const deferred = $q.defer();
      this.buildingStrategy.uniqueNameService(name, $service, deferred);

      return deferred.promise;
    };

    this.setName = function(name) {
      const self = this;

      return this.asDeferred(function() {
        if ($service.services[$service.currentServiceKey] == undefined) {
          $service.services[$service.currentServiceKey] = self.newServiceWithName(name);
        }

        $service.services[$service.currentServiceKey].name = name;
        return;
      });
    };

    this.updateServices = function() {
      this.storage.set("services", $service.services);
    };

    this.setInput = function(input) {
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].input = input;
        $service.updateServices();
        return;
      });
    };

    this.setUrl = function(url) {
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].urlPattern = url;
        return;
      });
    };

    this.setFavIcon = function(favIcon) {
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].favIcon = favIcon;
        return;
      });
    };

    this.setItemType = function(itemType) {
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].itemType = itemType;
        return;
      });
    };

    this.setTrigger = function(trigger) {
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].trigger = trigger;
        $service.updateServices();
        return;
      });
    };

    this.setCurrentServiceKey = function(key) {
      return this.asDeferred(function() {
        $service.currentServiceKey = key;
        return;
      });
    };

    this.setResultsName = function(name) {
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].results.name = name;
        return;
      });
    };

    this.setResultsSelector = function(selector) {
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].results.selector = selector;
        return;
      });
    };

    this.setResultsPreview = function(preview) {
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].results.preview = preview;
        return;
      });
    };

    this.setMoreResultsStrategy = function(className) {
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].moreResults.className = className;
        return;
      });
    };

    this.setMoreResultsExtraProps = function(props) {

      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].moreResults.props = props;
        return;
      });
    };

    this.updateServiceKey = function(oldKey, newKey) {
      return this.asDeferred(function() {
        $service.services[newKey] = $service.services[oldKey];
        delete $service.services[oldKey];
        $service.currentServiceKey = newKey;
        return;
      });
    };

    this.setBuildingStrategy = function(strategy) { // ExistingServiceEdition || NewServiceEdition
      return this.asDeferred(function() {
        $service.buildingStrategy = new window[strategy]();
        return;
      });
    };

    this.getBuildingStrategy = function(strategy) { // TODO: remove
      return this.asDeferred(function() {
        return $service.buildingStrategy;
      });
    };

    this.setProperties = function(properties) { // ExistingServiceEdition || NewServiceEdition
      //todo: add one by one, do not save an external collection
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].properties = properties;
        return;
      });
    };

    this.setSorters = function(sorters) {
      //todo: add one by one, do not save an external collection
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].sorters = sorters;
        return;
      });
    };

    this.setFilters = function(filters) {
      //todo: add one by one, do not save an external collection
      return this.asDeferred(function() {
        $service.services[$service.currentServiceKey].filters = filters;
        return;
      });
    };

    //joaquin y paula

    this.getMatchingProducts = function(url) {

      browser.runtime.sendMessage({
         call: "getFromRemoteRepo",
         args: {"key": "https://www.youtube.com/watch?v=fjyfZ6Ylezw&list=RDMMfjyfZ6Ylezw&start_radio=1"}
      })
      .then(function(res){
        console.log("REMOTE:", res);
      });

      var me = this,
        deferred = $q.defer();
      $timeout(function() {

        console.log("LOCAL", $service.products);
        deferred.resolve($service.products);

      }, 500);
      return deferred.promise;
    };

    this.sendModel = function(properties) { // ExistingServiceEdition || NewServiceEdition
        console.log(properties);
        console.log("Productos hasta ahora:");
        console.log($service.products);
        $service.products[properties.class] = properties;
        this.storage.set("products",$service.products);
        var deferred = $q.defer();
        browser.runtime.sendMessage({
            method: 'POST',
            action: 'xhttp',
            url: 'http://localhost:3000/createEntity',
            headers: {'ContentType': 'application/json'},
            data: properties
        });
        this.setCurrentProduct(properties.class);
        return this.asDeferred(function() {
            //$service.services[$service.currentServiceKey].properties = properties;
            return;
        });
    };

    this.setCurrentXPath = function(xpath) {
        this.currentXPath = xpath;
    }

    this.getCurrentXPath = function() {
        return this.currentXPath;
    }

    this.getProductMessage = function(message, xpath) {
        var auxMessage = {message: message, showXPath: xpath}
        browser.runtime.sendMessage({
            msg: auxMessage,
            action: 'ShowProductComments'
        });
    }

    this.saveObject = function(objInstanciado) {
        //var deferred = $q.defer();
        //console.log(objInstanciado);
        //console.log($service.products);
        //$service.products[properties.class].createdObjects.push(objInstanciado);
        //this.storage.set("products",$service.products);
      //  return this.asDeferred(function() {
            //$service.services[$service.currentServiceKey].properties = properties;
        //    return;
    //    });
    };

    this.removeProduct = function(key) {
      return this.asDeferred(function() {
        if ($service.products.hasOwnProperty(key)) {
          delete $service.products[key];
          $service.updateProducts();
        }
        return;
      });
    };

    this.updateProducts = function() {
      this.storage.set("products", $service.products);
    };

    this.setCurrentProduct = function(className) {
        this.currentProduct = className;
    };

    this.getCurrentProduct = function() {
        console.log($service.products[this.currentProduct]);
        return ($service.products[this.currentProduct]);
    };

    this.getCurrentObjectsForProduct = function() {
        console.log($service.products[this.currentProduct]);
        console.log($service.products[this.currentProduct].createdObjects);
        return ($service.products[this.currentProduct].createdObjects);
    };

    this.sendCurrentObjectsForProduct = function() { // ExistingServiceEdition || NewServiceEdition
        var deferred = $q.defer();
        var className = $service.products[this.currentProduct].class;
        var method = 'insertOneIn' + className;
        var ejResponse = {'status': 'ok', 'comment': 'Prueba'};
        console.log(method);
        console.log($service.products[this.currentProduct].createdObjects[0]);
        browser.runtime.sendMessage({
            method: 'POST',
            action: 'xhttp',
            url: 'http://localhost:3000/render/' + method,
            headers: {'ContentType': 'application/json'},
            data: $service.products[this.currentProduct].createdObjects[0]
        }).then(response => {
            console.log(response);
            ejResponse = response;
        });
        return this.asDeferred(function() {
            return ejResponse;
        });
        //angular.forEach($service.products[this.currentProduct].createdObjects, function(value, key) {
        //    console.log(className);
        //    console.log(value);
        //    browser.runtime.sendMessage({
        //        method: 'POST',
        //        action: 'xhttp',
        //        url: 'http://localhost:3000/' + method,
        //        headers: {'ContentType': 'application/json'},
        //        data: value
        //    }).then((response => {
        //        console.log(response);
        //    });
        //});
        //return this.asDeferred(function() {
            //return;
        //});
    };

    this.initialize();
  }
]);
