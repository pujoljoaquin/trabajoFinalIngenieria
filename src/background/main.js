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


