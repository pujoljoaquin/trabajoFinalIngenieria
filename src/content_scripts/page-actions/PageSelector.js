//TODO: somehow, the file is realoded and that makes it impossible to remove listeners :(
console.log("\n\n\n********* LOADING THE 'PAGE SELECTOR' FILE *********\n\n\n");

var scrappers = { // Because we can not use window instead
	"XpathScrapper": function(){
		this.getElements = function(selector){
			return (new XPathInterpreter()).getElementsByXpath(selector, document);
		};
		this.getElement = function(selector){
			if(selector == undefined)
				return;

			var elems = (new XPathInterpreter()).getElementsByXpath(selector, document);
			return (elems && elems.length > 0)? elems[0] : undefined; //(new XPathInterpreter()).getElementByXPath(selector, document);
		};
	},
	"QuerySelectorScrapper": function(){
		this.getElements = function(selector){
			return document.querySelectorAll(selector);
		};
		this.getElement = function(selector){
			if(selector == undefined)
				return;
			return document.querySelector(selector);
		};
	}
}

class PageSelector{

	constructor(){
		this.selectableElemClass = "andes-selectable";
		this.onHoverHighlightClass = "andes-highlighted-on-hover";
		this.selectionClass = "andes-selected";
		this.clearBackgroundClass = "andes-clear-background";
		this.obfuscatedClass = "andes-blurred";
		this.onElementSelectionMessage;
		this.loadListeners();
		this.selectedElem;
	};
	getSetOfXPathsByOccurrences (element, relativeElem, generateRelativeSelector){

		var xpi = new XPathInterpreter(),
			labeledXpaths = {},
			xpaths = xpi.getMultipleXPaths(element, relativeElem || element.ownerDocument);

	    for (var i = xpaths.length - 1; i >= 0; i--) {

	        var elemsBySelector = xpi.getElementsByXpath(xpaths[i], element.ownerDocument).length;
	        if(elemsBySelector > 0){

	            if(labeledXpaths[elemsBySelector])
	            	this.addToExistingLabeledXpath(elemsBySelector, xpaths[i], labeledXpaths)
	            else this.createNewLabeledXpath(elemsBySelector, xpaths[i], labeledXpaths);
	        }
	    }
        console.log(labeledXpaths);
	    return labeledXpaths;
	}
	addToExistingLabeledXpath (ocurrences, xpath, labeledXpaths){

		var xpaths = labeledXpaths[ocurrences];
		//console.log("existing", xpaths, " with ", xpath);
			xpaths.push(xpath);

		labeledXpaths[ocurrences] = xpaths;
	}
	createNewLabeledXpath (ocurrences, xpath, labeledXpaths){

		labeledXpaths[ocurrences] = [xpath];
	}
	loadListeners (){

		var me = this;
		this.scoped;

		this.selectionListener = function(evt){

			var matchingElements = me.withParentElements(me.selectedElem);

			me.removeHighlightingOnHover(me.selectedElem);
			matchingElements.forEach(targetElem => {
				me.removeStyleClass(targetElem, me.selectionClass);
				me.removeStyleClass(targetElem, me.clearBackgroundClass);
			});

			me.generatePreview(me.selectedElem).then(function(preview){

				me.removeStyleClass(me.selectedElem, me.selectableElemClass);

				var selectors = me.getSetOfXPathsByOccurrences(me.selectedElem, me.refElem, me.generateRelativeSelector);

				me.addStyleClass(me.selectedElem, me.selectableElemClass);
				me.addHighlightingOnHover(me.selectedElem);

				browser.runtime.sendMessage({
					"call": evt.params.onElementSelection, /*onElementSelection*/
					"args": {
						"selectors": selectors,
						"previewSource": preview,
						"scoped": evt.params.scoped,
						"exampleValue": (me.selectedElem.textContent)? me.selectedElem.textContent.trim() : "",
						"call": evt.params.onElementSelection
					}
				});
			})
		};
		this.mouseEnterSelection = function(evt) {

			evt.preventDefault(); evt.stopImmediatePropagation();
			//me.selectedElem = evt.target;
			//console.log(me.selectedElem);
			me.addStyleClass(this, me.onHoverHighlightClass);
		};
		this.withParentElements = function(element){

			var nodes = [];
			nodes.push(element);
			while(element.parentNode) {
			    nodes.unshift(element.parentNode);
			    element = element.parentNode;
			}
			return nodes;
		};
		this.mouseLeaveSelection = function(evt) {

			me.removeStyleClass(this, me.onHoverHighlightClass);
			evt.preventDefault(); evt.stopImmediatePropagation();
		};
		this.preventAnyAction = function(evt){

			evt.preventDefault(); evt.stopImmediatePropagation();
			return false; //This is for preventing anchors
		};
		this.preventActionsListener = function(evt){

			evt.preventDefault(); evt.stopImmediatePropagation();
			me.selectedElem = this; //evt.target;

			if(me.selectedElem ) {
				if(me.hasAugmentedAction(me.selectedElem)){
					me.executeAugmentedActions({"target": me.selectedElem, "type": evt.type});
				}
			}

			return false;
		};
	};
	getAllVisibleDomElements (){
		return document.querySelectorAll("body, input, div, a, img, span, label, ul, li, p, pre, cite, em"); //:not(.first)
	};
	getAllVisibleDomElementsButBody (){
		return document.querySelectorAll("div, input, a, img, span, label, ul, li, p, pre, cite, em"); //:not(.first)
	};
	getCurrentSidebarElements (){

		return document.querySelector("#andes-sidebar").querySelectorAll("*");
	};
	highlightMatchingElements (data){

		/*var elems = (new XPathInterpreter()).getElementsByXpath(data.xpath, document);
		for (var i = elems.length - 1; i >= 0; i--) {
			this.addSelectionClass(elems[i]);
		}*/
	};
	selectMatchingElements (data){

		var refElem = (data.scrapper && data.refElemSelector)? (new scrappers[data.scrapper]()).getElement(data.refElemSelector) : document;

		var elems = (new XPathInterpreter()).getElementsByXpath(data.selector, refElem);
		for (var i = elems.length - 1; i >= 0; i--) {
			this.addSelectionClass(elems[i]);
		};
	};
	preventDomElementsBehaviour (){

		var me=this;
		this.preventFormsOnSubmit();
		this.getAllVisibleDomElementsButBody().forEach(function(elem){

			elem.addEventListener("click", me.preventActionsListener, false);
			me.getEventsNamesToPrevent().forEach(function(eventToPrevent){
				elem.addEventListener(eventToPrevent, me.preventAnyAction, false);
			});
		});
	};
	preventFormsOnSubmit (){

		//TODO: it is not working with "addEventListener". This is a problem because maybe we can not resore the original behaviour after this
		document.querySelectorAll("form").forEach(function(form){
			form.onsubmit = function(evt){
	    		return false;
			};
	    });
	}
	restoreDomElementsBehaviour (){

		this.removeAllAugmentedActions();

		var me=this; ///////THIS MAY BE A PROBLEM FOR THE SIDEBAR IF THIS METHOD IS CALLED IN THE MIDDLE OF THE PROCESS
		this.getAllVisibleDomElementsButBody().forEach(function(elem){

			elem.removeEventListener("click", me.preventActionsListener, false);
			me.getEventsNamesToPrevent().forEach(function(eventToPrevent){
				elem.removeEventListener(eventToPrevent, me.preventAnyAction, false);
			});
			me.removeHighlightingOnHover(elem);
		});

		this.removeFullSelectionStyle();
	};
	removeAugmentedActions (elem){

		elem.removeAttribute("andes-actions");
	};
	removeAllAugmentedActions (elem){

		document.querySelectorAll("*[andes-actions]").forEach(e => e.removeAttribute("andes-actions"));
	};
	getEventsNamesToPrevent (){

		return ["click", "mouseup", "mousedown"]; //, "keydown", "keyup", "keypress",
	};
	getTargetElements (selector){

		return document.querySelectorAll(selector);
	};
	enableElementSelection (data){

		this.darkifyAllDomElements();
		this.preventFormsOnSubmit();

		this.lastUsedExtractor = new scrappers[data.scrapperClass]();
		var elements = this.lastUsedExtractor.getElements(data.targetElementSelector);
		this.refElem = this.lastUsedExtractor.getElement(data.refElemSelector);
		this.onElementSelectionMessage = data.onElementSelection;

	    this.addSelectionListener(
	    	elements,
	    	data.onElementSelection,
	    	"click",
	    	data.scoped,
	    	data.removeStyleOnSelection,
	    	data.generateRelativeSelector,
	    	data /*este solo es laposta*/
	    );
	    this.undarkifySidebarElements();
	    this.darkify(document.body);
	};
	disableElementSelection (data){

		this.undarkifyAllDomElements();
		this.removeElemsHighlightingClass(data.selector);
		this.removeHighlightingOnHoverFrom(data.selector);
	    this.removeAllAugmentedActions(); //TODO: do not just remove. add a default action (prevent)
	};
	darkifyAllDomElements (){

		var me = this, elems = this.getAllVisibleDomElements();
		elems.forEach(function(elem) {
			me.darkify(elem);
	    });
	}
	undarkifyAllDomElements (){

		var me = this, elems = this.getAllVisibleDomElements();
		elems.forEach(function(elem) {
			me.undarkify(elem);
	    });
	}
	removeElemsHighlightingClass (selector){

		var me = this, elems = this.lastUsedExtractor.getElements(selector);
		elems.forEach(function(elem) {
			me.removeSelectableElemStyle(elem);
	    });
	}
	hasAugmentedAction (target){

		return (this.getAugmentedActions(target).length > 0);
	}
	executeAugmentedActions (evt){

		var actions = this.getAugmentedActions(evt.target);

		for (var i = actions.length - 1; i >= 0; i--) {
			if(evt.type.toUpperCase() == actions[i].event.toUpperCase()){
				evt.params = actions[i].params;
				this[actions[i].listener](evt); //e.g.
			}
		}
	}
	getAugmentedActions (elem){

		if (elem){
			var actions = elem.getAttribute("andes-actions");
			if (actions && actions.length)
				return actions=JSON.parse(actions);
		}
		return [];
	}
	isActionIncluded (existingAction, actions){

		for (var i = actions.length - 1; i >= 0; i--) {
			if(actions[i].listener == existingAction.listener && actions[i].listener == existingAction.listener){
				return true;
			}
		}
		return false;
	}
	addAugmentedAction (elem, action, params){

		var actions = this.getAugmentedActions(elem);
		if(!this.isActionIncluded(action, actions)) {
			actions.push(action);
			elem.setAttribute("andes-actions", JSON.stringify(actions));
		}
	}
	addSelectionListener (elements, onElementSelection, onEvent, scoped,
		removeStyleOnSelection, generateRelativeSelector, data){

		var me = this;

			this.removeStyleOnSelection = removeStyleOnSelection;
			this.scoped = scoped;
			this.generateRelativeSelector = generateRelativeSelector;

		elements.forEach(function(elem) {
			me.undarkify(elem);
			me.addHighlightingOnHover(elem);
			me.addSelectableElemStyle(elem);
			me.addAugmentedAction(elem, {
				"listener": "selectionListener",
				"event": onEvent,
				"params": data
			});
	    });
	}
	generatePreview (element){

		const prom = new Promise((resolve, reject) => {

	    this.removeSelectableElemStyle(element);
		this.addClearBackground(element);
		var ps = this;

	    domtoimage.toJpeg(element).then(dataUrl => {
		    resolve(dataUrl);

		    ps.removeClearBackground(element);
		    ps.addSelectableElemStyle(element);
		  })
		  .catch(error =>
		    resolve('oops, something went wrong!')
		  );
	    });

	    return prom;
	}
	addHighlightingOnHover (elem){
		elem.addEventListener("mouseover", this.mouseEnterSelection, false);
		elem.addEventListener("mouseleave", this.mouseLeaveSelection, false);
	}
	removeHighlightingOnHover (elem){

		elem.removeEventListener("mouseover", this.mouseEnterSelection, false);
		elem.removeEventListener("mouseleave", this.mouseLeaveSelection, false);
		this.removeStyleClass(elem, this.onHoverHighlightClass);
	}
	addSelectableElemStyle (elem){

		this.addStyleClass(elem, this.selectableElemClass);
	}
	addSelectionClass (elem){

		this.addStyleClass(elem, this.selectionClass);
	}
	removeSelectionClass (elem){

		this.removeStyleClass(elem, this.selectionClass);
	}
	removeFullSelectionStyle (){

		this.removeClassFromMatchingElements(this.obfuscatedClass);
		this.removeClassFromMatchingElements(this.selectableElemClass);
		this.removeClassFromMatchingElements(this.onHoverHighlightClass);
		this.removeClassFromMatchingElements(this.clearBackgroundClass);
		this.removeClassFromMatchingElements(this.selectionClass);

		return Promise.resolve();
	}
	removeHighlightingOnHoverFrom (selector){

		this.selectedElem = undefined;

		var me = this;
		(this.lastUsedExtractor.getElements(selector)).forEach(function(elem){
			me.removeHighlightingOnHover(elem);
		});
	}
	removeEventBlockers (){

		console.log("Removing event blockers");
	}
	removeClassFromMatchingElements (className){

		var hElems = document.querySelectorAll("." + className);
			hElems.forEach(e => e.classList.remove(className));
		return hElems;
	}
	addClassToMatchingElements (elems, className){

		for (var i = 0; i < elems.length; i++) {
			this.addStyleClass(elems[i], className);
		}
		return elems;
	}
	undarkifySidebarElements (){

		var me = this;
		this.getCurrentSidebarElements().forEach(function(elem) {
			me.undarkify(elem);
	    });
	    this.undarkify(document.querySelector("#andes-sidebar"));
	}
	isAVisibleElement (elem){

		return (elem.style.display != "none" && elem.getBoundingClientRect().width != 0)? true : false;
	}
	darkify (elem){

		this.addStyleClass(elem, this.obfuscatedClass);
	};
	addClearBackground (elem){

		this.addStyleClass(elem, this.clearBackgroundClass);
	};
	addStyleClass (elem, className){

		if(elem.classList && !elem.classList.contains(className)){
			elem.classList.add(className);
		}
	};
	removeStyleClass (elem, className){

		if(elem && elem.classList && elem.classList.contains(className)){
			elem.classList.remove(className);
		}
	};
	undarkify (elem){

		this.removeStyleClass(elem, this.obfuscatedClass);
	};
	removeSelectableElemStyle (elem){

		this.removeStyleClass(elem, this.selectableElemClass);
	};
	removeClearBackground (elem){

		this.removeStyleClass(elem, this.clearBackgroundClass);
	};
};

var pageManager = new PageSelector();
browser.runtime.onMessage.addListener(function callPageSideActions(request, sender) {
    console.log("PAGESELECTOR.JS");
	if(pageManager[request.call]){
		console.log(request.call + " from PageSelector");
		pageManager[request.call](request.args);
	}
});
