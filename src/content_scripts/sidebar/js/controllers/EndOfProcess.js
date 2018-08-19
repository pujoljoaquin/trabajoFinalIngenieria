serviceCreator.controller('EndOfProcess', function($scope, $state, ServiceService) {
  AbstractController.call(this, $scope, $state, ServiceService);

  $scope.loadSubformBehaviour = function() { //ESTE ES EL QUE LLAMA AL DEFINRI ALS PROPIEDADES Y DQR FINISH
    ServiceService.updateServices();
    console.log("Se llama al loadSubformBehaviour para guardar el template");
  };

  $scope.finishServiceDefinition = function() {
    return browser.runtime.sendMessage({call: "closeSidebar"});
    console.log("Se llama al finishServiceDefinition para guardar el template");
  };

  $scope.initialize();
});
