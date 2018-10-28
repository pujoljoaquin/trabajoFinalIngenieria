serviceCreator.controller('ResultsPropertiesController', function($scope, $http, $q, $state, ServiceService) {

  AbstractController.call(this, $scope, $state, ServiceService);
  $scope.service = {
    results: {
      selector: '//div[1]',
      properties: {}
    }
  };
  $scope.loadDataModel = function() {
    ServiceService.getService().then(function(service) {

      $scope.service = service;
      console.log("loadDataModel!!!");
      console.log(service.results);
      var selector = $scope.getElementsSelector(service.results.selector.value);
      $scope.loadPropertiesIntoSidebar($scope.service.results.properties);

      $scope.enableDomElementSelection(selector, "onElementSelection", ".well", "XpathScrapper", service.results.selector.value, false, true).then(function() {
        $scope.highlightPropertiesInDom($scope.service.results.properties, $scope.service.results.selector.value);
      });
    });
  };

  $scope.loadPrevStep = function(aState) {
    if (this.areRequirementsMet()) {
      $scope.saveDataModel();
      $scope.undoActionsOnDom();
      $state.go(aState);
    }
  };

  $scope.undoActionsOnDom = function(aState) {

    var elemsSelector = $scope.getElementsSelector($scope.service.results.selector.value);
    $scope.disableDomElementSelection(elemsSelector);
    $scope.removeFullSelectionStyle();
  };

  $scope.arePropertiesDefined = function() {
    var inputs = document.querySelectorAll("input");
    this.removeFormElementById("no_props_error");

    if (inputs == undefined || inputs.length <= 0) {
      this.showErrorMessageByElems("no_props_error", document.querySelector(".list-group"), "props_are_required");
      return false;
    };

    return true;
  };

  $scope.arePropertiesValuesDefined = function() {

    var inputs = document.querySelectorAll("input"),
      inputsAreFilled = true;

    for (var i = inputs.length - 1; i >= 0; i--) {
      if (inputs[i].value.length <= 2) {
        inputsAreFilled = false;

        this.removeFormElementById(inputs[i].id + "_error");
        this.showErrorMessageByElems(inputs[i].id + "_error", inputs[i], "this_field_is_required");
      } else {
        // I don't know why I can not access the elem from the abstract class behaviour. So...
        this.removeFormElementById(inputs[i].id + "_error");
      }
    }

    return inputsAreFilled;
  };

  $scope.areRequirementsMet = function() {
    return (this.arePropertiesDefined() && this.arePropertiesValuesDefined());
  };

  $scope.highlightPropertiesInDom = function(properties, containerSelector) {
    console.log("Higlight properties!!!!");
    console.log(properties);
    console.log(properties[key]);
    Object.keys(properties).forEach(function(key) {
      //console.log("highlighting: ", key, properties[key].relativeSelector);
      $scope.highlightPropertyInDom(properties[key].relativeSelector, containerSelector);
    });
  };

  $scope.getElementsSelector = function(selector) {

    return selector + "//span | " + selector + "//a"; //changed for the experiment. Prev value: *
    //( selector.length-3, selector.length == "[1]")? selector + "//*": selector + "[1]//*";
  };

  $scope.onElementSelection = function(data) { //selector exampleValue (will have also a name)
    console.log("onElementSelection!!!!!!");
    console.log("data");
    console.log(data);
    console.log("data.selectors");
    console.log(data.selectors);
    console.log("data.selectors(Object.keys(data.selectors)[0])");
    console.log(data.selectors[Object.keys(data.selectors)[0]]);
    var prop = {
      "name": "",
      "exampleValue": data.exampleValue.length > 35
        ? data.exampleValue.substring(0, 35) + "..."
        : data.exampleValue,
      "relativeSelector": data.selectors[Object.keys(data.selectors)[0]][0]
    };

    var propControl = this.addPropertyToSidebar(prop);
    propControl.querySelector("input").focus();

    //this.highlightPropertyInDom(prop.relativeSelector, $scope.service.results.selector.value);
    this.removeFormElementById("no_props_error");
  };

  $scope.saveDataModel = function() {
    console.log("SELECCIONE TODAS LAS PROPERTIES Y DI SAVE, LLAMO A saveDataModel");
    console.log("Begin Joaquin");
    console.log("Pre $scope.service.results.properties");
    console.log($scope.service.results.properties);
    $scope.service.results.properties = $scope.getUserEditedProperties();
    console.log("Post seteo");
    console.log($scope.service.results.properties);
    $scope.sendDataModel($scope.service.results.properties);
    ServiceService.setProperties($scope.service.results.properties).then(function() {
      ServiceService.updateServices();
    });
  };

  $scope.sendDataModel = function(model) {
    console.log("Codigo joaquin, nueva funcion");
    console.log(model);
    var nameAbstractModel = ServiceService.getObjectModel();
    var productXPath = ServiceService.getCurrentXPath();
    var currentUrl;
    browser.runtime.sendMessage({call: "getCurrentUrl"}).then(url => {
        currentUrl = url;
        var obj = {
            class: nameAbstractModel,
            fields: [],
            createdObjects: [],
            xpath: productXPath,
            url: currentUrl
        };
        var objInstanciado = {};
        var atr = {
            "name": '',
            "type": "string",
            "unique": "false",
            "nullable": "false"
        }
        angular.forEach(model, function(value, key) {
            console.log(key);
            console.log(value);
            atr = {
                "name": value.name,
                "type": "string",
                "unique": "false",
                "nullable": "false"
            };
            obj.fields.push(atr);
            objInstanciado[value.name] = value.exampleValue;
            //angular.forEach(value, function(atrValue, atr) {
            //    console.log(atr + ': ' + atrValue);
            //});
        });
        obj.createdObjects.push(objInstanciado);
        console.log(obj);
        ServiceService.sendModel(obj).then(function() {
            console.log("SE ENVIO AL SERVICIO EL MODELO ABSTRACTO OBTENIDO");
        });
        //ServiceService.saveObject(objInstanciado).then(function() {
        //    console.log("Objeto instanciado guardado");
        //});
    });

    };

  $scope.getUserEditedProperties = function() {
    var props = {},
      propsElems = document.querySelectorAll(".list-group-item");
    console.log("getUserEditedProperties");
    console.log(propsElems);
    for (var i = propsElems.length - 1; i >= 0; i--) {

      var prop = propsElems[i].querySelector("button").prop;
      prop.name = propsElems[i].querySelector("input").value;

      props[prop.name] = prop;
    };

    return props;
  };

  $scope.loadPropertiesIntoSidebar = function(properties) {
    Object.keys(properties).forEach(function(key) {
      $scope.addPropertyToSidebar(properties[key]);
    });
    console.log("LLAME AL loadPropertiesIntoSidebar")
    console.log(properties);
  };

  $scope.highlightPropertyInDom = function(relativeSelector, refElemSelector) {

    browser.runtime.sendMessage({
      "call": "selectMatchingElements",
      "args": {
        "selector": relativeSelector,
        "scrapper": "XpathScrapper",
        "refElemSelector": refElemSelector
      }
    });
  };

  $scope.addPropertyToSidebar = function(prop) {
    var property = document.createElement("div");
    property.className = "list-group-item";

    var closebutton = document.createElement("button");
    closebutton.className = "list-item-close-button";
    closebutton.innerHTML = "<span class='glyphicon glyphicon-remove'></span>";
    closebutton.prop = prop;
    closebutton.onclick = function() {
      //$scope.removeProperty(this.prop);
      this.parentElement.remove();
    };
    property.appendChild(closebutton);

    var propNameGroup = document.createElement("div");
    propNameGroup.className = "form-group";
    property.appendChild(propNameGroup);

    var propNameLabel = document.createElement("label");
    propNameLabel.innerHTML = browser.i18n.getMessage("property_name");
    propNameGroup.appendChild(propNameLabel);

    var propNameInput = document.createElement("input");
    propNameInput.setAttribute("type", "text");
    propNameInput.className = "form-control resultProperty";
    propNameInput.id = Date.now(); //for the validation
    propNameInput.value = prop.name;
    propNameGroup.appendChild(propNameInput);
    /*$(propNameInput).rules('add', {
              "minlength": 2,
              "required": true
          });*/

    var propValue = document.createElement("i");
    //propValue.className = "list-group-item-text small";
    propValue.innerHTML = browser.i18n.getMessage("example_value") + ": " + prop.exampleValue; //$scope.listProperties();
    property.appendChild(propValue);
    console.log("ADDING PROPERTY");
    console.log(prop);
    console.log($scope.service)

    document.querySelector("#properties").appendChild(property);
    return property;
  };

  $scope.initialize();
});
