class BackgroundPageSelector{

	constructor(){
		this.pageBehaviourStatus = {};
	}
	getPageBehaviourStatusByTab(tab) {
		if (this.pageBehaviourStatus[tab.id] == undefined)
			this.pageBehaviourStatus[tab.id] = new RegularBehaviourEnabled(this); 
		
		return this.pageBehaviourStatus[tab.id];
	};
	preventDomElementsBehaviour(tab) {
		browser.tabs.sendMessage(tab.id, {
	    	"call": "preventDomElementsBehaviour"
	    });
	};
	restoreDomElementsBehaviour(tab) {
		browser.tabs.sendMessage(tab.id, {
	    	"call": "restoreDomElementsBehaviour"
	    });
	};
	toggleDomElementsBehaviour(tab) {

		this.getPageBehaviourStatusByTab(tab).toggleDomElementsBehaviour(tab);
	};
	enableElementSelection(tab, data) {

		return new Promise((resolve, reject) => {

	    	browser.tabs.sendMessage(tab.id, {
		    	"call": "enableElementSelection",
		    	"args":data
		    });
	      	resolve(); 
	  	});
	};
	disableElementSelection(tab, selector) {
		browser.tabs.sendMessage(tab.id, {
	    	"call": "disableElementSelection",
	    	"args": {
	    		"selector": selector
	    	}
	    });
	};
	removeFullSelectionStyle(tab) {

		return new Promise((resolve, reject) => {
	    	browser.tabs.sendMessage(tab.id, { "call": "removeFullSelectionStyle" }).then(function(){
				resolve(); 
			});	
	  	});	
	}
}


class PageBehaviourStatus{

	constructor(context){
		this.context = context;
	}
}
class RegularBehaviourEnabled extends PageBehaviourStatus {

	toggleDomElementsBehaviour(tab){
		this.context.preventDomElementsBehaviour(tab);
		this.context.pageBehaviourStatus[tab.id] = new RegularBehaviourDisabled(this.context);
	};
}
class RegularBehaviourDisabled extends PageBehaviourStatus {

	toggleDomElementsBehaviour(tab){
		this.context.restoreDomElementsBehaviour(tab);
		this.context.pageBehaviourStatus[tab.id] = new RegularBehaviourEnabled(this.context);
	};
}