class SidebarManager{

	constructor(defaultFile, defaultDependencies, listeners){
		this.defaultFile = defaultFile;
		this.defaultDependencies = defaultDependencies;
		this.listeners = [];
		this.addListeners(listeners);
	}

    showProductComments(message, showXpath) {
        var arg = {msg: message, xpath: showXpath};
        console.log(arg);
        this.getCurrentTab(function(tab){
            browser.tabs.sendMessage(tab.id, {
                call: "showProductComments",
                args: arg
            });
        });
    }

	addListeners (listeners) {

		for (var i = listeners.length - 1; i >= 0; i--) {
			this.addListener(listeners[i]);
		}
	}
	addListener (listener) {

		this.listeners.push(listener);
	}
	notifyListeners () {

		var me = this;
		this.getCurrentTab(function(tab){
			for (var i = me.listeners.length - 1; i >= 0; i--) {
				me.listeners[i].onSidebarStatusChange(tab);
			}
		});
	}
	onFrameReadyForLoadingUrl () {

		//salta a onSidebarStatusChange
		this.loadChromeUrl(this.defaultFile, this.defaultDependencies);
		this.notifyListeners();
	}
	onSidebarClosed () {

		this.notifyListeners();
	}
	loadChromeUrl (chromeUrl, filePaths) { //PUBLIC

		this.getCurrentTab(function(tab){
			browser.tabs.sendMessage(tab.id, {
				call: "loadUrl",
				args: {
					"url": browser.extension.getURL(chromeUrl),
					"filePaths": filePaths
				}
			});
		});
	};
	onElementSelection (data) {

		this.getCurrentTab(function(tab){
			browser.tabs.sendMessage(tab.id, {
				call: "onElementSelection",
				args: data
			});
		});
	}
	onTriggerSelection (data) {

	  	this.getCurrentTab(function(tab){
			browser.tabs.sendMessage(tab.id, {
				call: "onTriggerSelection",
				args: data
			});
		});
	};
	onResultsContainerSelection (data) {

	  	this.getCurrentTab(function(tab){
			browser.tabs.sendMessage(tab.id, {
				call: "onResultsContainerSelection",
				args: data
			});
		});
	};
	toggleSidebar (callback) { //PUBLIC

		var me = this;
		this.getCurrentTab(function(tab){
			browser.tabs.sendMessage(tab.id, {call: "toggle"});
			if(callback) callback(tab);
		});
	};
	adaptPlaceholder (tab, data) {

		data.domainName = tab.url.split(".")[1];

		browser.tabs.sendMessage(tab.id, {
			call: data.callback,
			args: data
		});
	};
	open () {

		var me = this;
		this.getCurrentTab(function(tab){
			browser.tabs.sendMessage(tab.id, {call: "open"});
		});
	};
	getCurrentTab (callback) {

		try{
			browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
				callback(tabs[0]);
			});
		}catch(err){ console.log(err); }
	};
	close () {
		var me = this;
		this.getCurrentTab(function(tab){
			browser.tabs.sendMessage(tab.id, {call: "close"});
		});
	};
};
