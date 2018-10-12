const serviceCreator = angular.module("ServiceCreator", ['ui.router']);

serviceCreator.config(function($stateProvider, $urlRouterProvider, $compileProvider) {
  $urlRouterProvider.when("", "/ExistingServiceCheck");

  $stateProvider
    .state("ExistingServiceCheck", {
      url: "/ExistingServiceCheck",
      templateUrl: "existing-templates-ckecking.html"
    })
    .state("ServiceName", {
      url: "/ServiceName",
      templateUrl: "template-name.html"
    })
    .state("ResultsSelection", {
      url: "/ResultsSelection",
      templateUrl: "results-selection.html"
    })
    .state("ResultsProperties", {
      url: "/ResultsProperties",
      templateUrl: "results-properties.html"
    })
    .state("EndOfProcess", {
      url: "/EndOfProcess",
      templateUrl: "end-of-process.html"
    })
    .state("SelectProductProperties", {
      url: "/SelectProductProperties",
      templateUrl: "select-produt-properties.html"
    });

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension|moz-extension):|data:image\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension|moz-extension):/);
});

browser.runtime.onMessage.addListener(function callServiceNameActions(request, sender) {
  console.log("INDEX.JS");
  if (!request.args) {
    return;
  }

  const controller = angular.element(document.querySelector(request.args.scoped)).scope();

  if (controller != undefined && controller[request.call]) {
    if (sender.url == undefined) { //tHIS IS TRICKY BUT THE BROWSER IS SENDING THE MESSAGE TWICE, THE SAME CALL BUT WITH NO URL
      console.log("\n\n\n" + request.call + " from index.js (sidebar)", sender);
      controller[request.call](request.args);
    }
  }
});

/**
 * Possible parameters for request:
 *  action: "xhttp" for a cross-origin HTTP request
 *  method: Default "GET"
 *  url   : required, but not validated
 *  data  : data to send in a POST request
 *
 * The callback function is called upon completion of the request */
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() {
            callback(xhttp.responseText);
        };
        xhttp.onerror = function() {
            // Do whatever you want on error. Don't forget to invoke the
            // callback to clean up the communication port.
            callback();
        };
        xhttp.open(method, request.url, true);
        if (method == 'POST') {
            xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhttp.send(request.data);
        return true; // prevents the callback from being called too early on return
    }
});

