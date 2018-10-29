var browserUI = new BrowserUiManager();

browser.browserAction.onClicked.addListener(function updateIcon() {
    console.log("prueba");
    console.log(document.getElementsByClassName(".informatica-compra-al-mejor-precio-en-fravega-com"));
   //document.getElementsByClassName(".informatica-compra-al-mejor-precio-en-fravega-com").append( "<p>Test</p>" );
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
        if (message.action == "ShowProductComments") {
            console.log(message);
            browserUI.showProductComments(message.msg.message, message.msg.showXPath);
        }
        else{
            if(browserUI[message.call]) {
                return browserUI[message.call](message.args); //in case you need to return a promise
            }
        }
    }

});

browser.webRequest.onHeadersReceived.addListener( //allowing multiple origins in iframes to load
    function(info) {
        var headers = info.responseHeaders;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1); // Remove header
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [ '*://*/*' ], // Pattern to match all http(s) pages
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);




