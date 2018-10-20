var browserUI = new BrowserUiManager();

browser.browserAction.onClicked.addListener(function updateIcon() {
  	browserUI.toggleSidebar();
});

browser.runtime.onMessage.addListener(function(message, sender, sendResponse){

    console.log("message: ", message, " (at main.js)");
    if (message.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        var method = message.method ? message.method.toUpperCase() : 'GET';

        xhttp.open(method, message.url, true);
        if (method == 'POST') {
            console.log(message.data);
            xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            //xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhttp.send(JSON.stringify(message.data));
        //request.send(JSON.stringify({denny: 1, mark: 1, johnny: 0}));
        return true; // prevents the callback from being called too early on return
    }
    else {
        if(browserUI[message.call]) {
            return browserUI[message.call](message.args); //in case you need to return a promise
        }
    }

});




