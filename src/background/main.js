var browserUI = new BrowserUiManager();

browser.browserAction.onClicked.addListener(function updateIcon() {
  	browserUI.toggleSidebar();
});

browser.runtime.onMessage.addListener(function(message, sender, sendResponse){

    console.log("message: ", message, " (at main.js)");
    if(browserUI[message.call]) {
    	return browserUI[message.call](message.args); //in case you need to return a promise
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
            console.log(request.data);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            //xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhttp.send(request.data);
        return true; // prevents the callback from being called too early on return
    }
});


