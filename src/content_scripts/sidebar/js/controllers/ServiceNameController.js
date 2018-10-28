serviceCreator.controller('ServiceNameController', function($scope, $state, ServiceService) {
  AbstractController.call(this, $scope, $state, ServiceService);

  $scope.service = {
    name: "",
    url: undefined,
    itemType: "",
    tag: ""
  };

  $scope.initialName;

  $scope.loadDataModel = function() {
    ServiceService.getService().then(function(service) {
      if (service) {
        $scope.service.name = service.name;
        $scope.initialName = service.name;
        $scope.service.itemType = service.itemType;
        $scope.enableTagsAutocompletion(service.itemType);
        document.querySelector("#template_tag").value = service.itemType;
      }
    });

    browser.runtime.sendMessage({call: "getCurrentUrl"}).then(url => {

      var link = document.createElement("a");
      link.href = url;
      //$scope.service.url = link.origin + "/*";
      $scope.service.url = url;
    });

    browser.runtime.sendMessage({call: "getCurrentFavicon"}).then(favIcon => {

      $scope.service.favIcon = favIcon;
    });
  };

  $scope.saveFullDataWithCurrentKey = function() {
    console.log("LLAMADA A saveFullDataWithCurrentKey");
    ServiceService.setObjectModel($scope.service.tag);  //Se setea nombre del modelo abstracto
    ServiceService.setCurrentServiceKey($scope.service.name);
    ServiceService.setName($scope.service.name).then(function() {
      ServiceService.updateServices();
      browser.runtime.sendMessage({call: "populateApisMenu"});
    });
    ServiceService.setItemType($scope.service.itemType);
    ServiceService.setUrl($scope.service.url);
    ServiceService.setFavIcon($scope.service.favIcon);
  };

  $scope.saveDataModel = function() {

    if ($scope.service.name == undefined || $scope.service.name.trim() == '')
      return;

    if ($scope.initialName != undefined && $scope.initialName != $scope.service.name) {
      //update name
      ServiceService.updateServiceKey($scope.initialName, $scope.service.name).then(function() {
        $scope.saveFullDataWithCurrentKey();
      });
    } else
      $scope.saveFullDataWithCurrentKey();
    }
  ;
  $scope.saveUrl = function() {
    ServiceService.setUrl($scope.service.url);
  };

  $scope.getValidationRules = function() {
    return {
      "rules": {
        "search_service_name": {
          "minlength": 2,
          "required": true
        }
      },
      "messages": {
        search_service_name: browser.i18n.getMessage("this_field_is_required")
      }
    };
  }
  $scope.loadSubformBehaviour = function() {

    $scope.callPlaceholderNameAdaptation();
    $scope.focusElement("#search_service_name");
  };

  $scope.callPlaceholderNameAdaptation = function() {
    //The only way I ound to communicate the iframe content to the outside
    browser.runtime.sendMessage({
      call: "adaptPlaceholder",
      args: {
        scoped: "#search_service_name",
        callback: 'adaptPlaceholderExample'
      }
    });
  };

  $scope.adaptPlaceholderExample = function(data) {
    document.querySelector("#search_service_name").setAttribute("placeholder", document.querySelector("#search_service_name").getAttribute("placeholder") + " " + data.domainName);
  };

  $scope.removeErrorMessages = function() {
    $scope.hideErrorMessage("nameAlreadyExistsError");
  };

  $scope.loadNextStep = function(nextState) {
    if ($scope.areRequirementsMet()) {
      ServiceService.uniqueNameService($scope.service.name).then(function(nameAlreadyExists) {

        if (!nameAlreadyExists) {

          $scope.saveDataModel();
          $scope.undoActionsOnDom();
          ServiceService.setBuildingStrategy("ExistingServiceEdition"); //Since the service is created, and the user may go forwards and back to this form ans he needs the new strategy to check for the uniqueName
          $state.go(nextState);
        } else {
          $scope.showErrorMessage("nameAlreadyExistsError", "#search_service_name", "service_name_already_exists");
          $scope.focusElement("#search_service_name");
        };
      });
    };
  };

  $scope.enableTagsAutocompletion = function(itemType){

    var ctrl = $('#template_tag');
    var me = this;
    this.enableTags({
        ctrl: ctrl,
        callback: function() {
            browser.runtime.sendMessage({call: 'getTemplateTags', args: {value: ctrl[0].value}}).then(function(tags){

              me.loadTemplateTags(tags);
            });
        }
    });
  };

  $scope.enableTags = function(data){

    data.ctrl.autocomplete({
        source: [],
        minLength: 1,
        select: function(event, ui) {
            event.preventDefault();
            $(this).val(ui.item.label);
            this.setAttribute("dbp", ui.item.value);
            $scope.service.itemType = ui.item.value;
        },
        change: function(event, ui) {
            var me = $(this);
            if (ui.item === null) {
                //me.val(''); //This forced the tag to match an ontology entity
                this.setAttribute("dbp", "");
                $scope.service.itemType = "";
                this.value = "";
            }
            me.autocomplete('close');
        }
    });

    var searchTimeout;
    data.ctrl[0].onkeypress = function(evt){
        if(this==document.activeElement){
            if (evt.charCode != 0){
                if (searchTimeout != undefined) clearTimeout(searchTimeout);
                searchTimeout = setTimeout(data.callback, 250);
            }
        }
    };
  }

  $scope.loadTemplateTags = function(tags){

    if( document.querySelector("#template_tag").style.display != 'none' ){
        var iTags = $(document.querySelector('#template_tag'));
            iTags.autocomplete("option", "source", tags);
            iTags.autocomplete( "search", iTags[0].value);
    } else console.log('Not loading tags');
  }

  $scope.initialize();
});
