serviceCreator.controller('ExistingServiceController', function($scope, $state, ServiceService) {
  AbstractController.call(this, $scope, $state, ServiceService);

  $scope.loadSubformBehaviour = function() {

    browser.runtime.sendMessage({call: "getCurrentUrl"}).then(url => {
      $scope.onUrlNotification(url);
    });
  };

  $scope.saveDataModel = function() {
    ServiceService.setBuildingStrategy("NewServiceEdition");
  };

  $scope.onUrlNotification = function(url) {
    ServiceService.getMatchingServices(url).then(function(services) {

      if (Object.keys(services).length > 0) {
        $scope.loadExistingServicesInstructions();
        $scope.loadExistingServices(services);
      } else {
        $scope.loadNoServicesFoundInstructions();
      }

      $scope.localize();
      ServiceService.setCurrentServiceKey(undefined);
    });

    ServiceService.getMatchingProducts(url).then(function(products) {

      if (Object.keys(products).length > 0) {
       console.log("hay productos");
       console.log(products);
       // $scope.loadExistingServicesInstructions();
        $scope.loadExistingProducts(products);
      } else {
        console.log("no hay productos");
       // $scope.loadNoServicesFoundInstructions();
      }

      $scope.localize();
      //ServiceService.setCurrentServiceKey(undefined);
    });
  };

  $scope.loadExistingServicesInstructions = function() {
    document.querySelector("#welcome_instructions").setAttribute("i18n-data", "matching_annotations_instructions");
  };

  $scope.loadNoServicesFoundInstructions = function() {
    document.querySelector("#welcome_instructions").setAttribute("i18n-data", "no_matching_annotations_instructions");
  };

  $scope.areRequirementsMet = function() {
    return true;
  };

  $scope.loadServiceUI = function(service) {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item justify-content-between list-group-item-action";
    listItem.innerHTML = service.name.length > 20
      ? service.name.substring(0, 20) + '...'
      : service.name;

    listItem.setAttribute("serviceId", service.name);
    listItem.onclick = function() {
      ServiceService.setCurrentServiceKey(service.name).then(function() {
        ServiceService.setBuildingStrategy("ExistingServiceEdition").then(function() {
          $state.go('ServiceName'); //do not call loadNext
        });
      });
    };

    const removeButton = document.createElement("button");
    removeButton.className = "btn btn-default btn-list";
    removeButton.innerHTML = "<i class='glyphicon glyphicon-remove'></i>";
    removeButton.onclick = function(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();

      const control = this;
      ServiceService.removeService(control.parentElement.getAttribute("serviceId")).then(function() {
        control.parentElement.remove();
      });
    };

    const editButton = document.createElement("button");
    editButton.className = "btn btn-default btn-list";
    editButton.innerHTML = "<i class='glyphicon glyphicon-edit'></i>";

    listItem.appendChild(removeButton);
    listItem.appendChild(editButton);

    document.querySelector("#existing_services").appendChild(listItem);
  };

  $scope.loadExistingServices = function(services) {
    Object.keys(services).forEach(function(key) {
      $scope.loadServiceUI(services[key]);
    });
  }

  $scope.loadExistingProducts = function(products) {
    Object.keys(products).forEach(function(key) {
      //console.log(products[key]);
      $scope.loadProductUI(products[key]);
    });
  }

  $scope.loadProductUI = function(product) {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item justify-content-between list-group-item-action";
    listItem.innerHTML = product.name.length > 20
      ? product.name.substring(0, 20) + '...'
      : product.name;

    listItem.setAttribute("productId", product.name);
    //listItem.onclick = function() {
    //  ServiceService.setCurrentServiceKey(service.name).then(function() {
    //    ServiceService.setBuildingStrategy("ExistingServiceEdition").then(function() {
    //      $state.go('ServiceName'); //do not call loadNext
    //    });
    //  });
    //};

    const removeButton = document.createElement("button");
    removeButton.className = "btn btn-default btn-list";
    removeButton.innerHTML = "<i class='glyphicon glyphicon-remove'></i>";
    removeButton.onclick = function(evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();

      const control = this;
      ServiceService.removeProduct(control.parentElement.getAttribute("productId")).then(function() {
        control.parentElement.remove();
      });
    };

    const addButton = document.createElement("button");
    addButton.className = "btn btn-default btn-list";
    addButton.innerHTML = "<i class='glyphicon glyphicon-plus'></i>";
    addButton.onclick = function(evt) {
      //evt.preventDefault();
      //evt.stopImmediatePropagation();
      $scope.loadNextStep('SelectProductProperties');
      //const control = this;
      //const iframe = document.createElement("iframe");
      //iframe.src = "http://216.250.114.200";
      //ServiceService.removeProduct(control.parentElement.getAttribute("productId")).then(function() {
      //  control.parentElement.remove();
      //});
    };
    const iframe = document.createElement('iframe');
    // Must be declared at web_accessible_resources in manifest.json
//    iframe.src = "https://www.google.com";

    // Some styles for a fancy sidebar
    //iframe.style.cssText = 'position:fixed;top:0;left:0;display:block;' + 'width:300px;height:100%;z-index:1000;';
    //document.body.appendChild(iframe);

    listItem.appendChild(removeButton);
    listItem.appendChild(addButton);
  //  listItem.appendChild(iframe);

 //   listItem.appendChild(iframe);

    document.querySelector("#existing_products").appendChild(listItem);
  };

  $scope.initialize();
});
