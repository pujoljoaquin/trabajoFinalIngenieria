class TemplatesCreator {

  constructor(){
    this.targetElement = undefined;
    this.sidebarManager = new SidebarManager(
      "/content_scripts/sidebar/index.html",
      [],
      [this] /* listeners that should implement onSidebarStatusChange */
    );
    this.backPageSelector = new BackgroundPageSelector();
  }

  showProductComments(message, xpath) {
    console.log("Templates Creator");
    //console.log(document.getElementsByClassName("informatica-compra-al-mejor-precio-en-fravega-com"));
    //document.getElementsByClassName("informatica-compra-al-mejor-precio-en-fravega-com").append("<h1>HOLA!!!!</h1>");
    //$(".informatica-compra-al-mejor-precio-en-fravega-com").append("<h1>HOLA!!!!</h1>");
    this.sidebarManager.showProductComments(message, xpath);
  }
  onSidebarStatusChange(tab) {

    this.backPageSelector.toggleDomElementsBehaviour(tab);
  }
  toggleSidebar() {

  	this.sidebarManager.toggleSidebar();
  }
  closeSidebar() {

    this.sidebarManager.close();
  }
  removeFullSelectionStyle(tab) {

    this.backPageSelector.removeFullSelectionStyle(tab);
  }
  onElementSelection(data) {

    this.sidebarManager.onElementSelection(data);
  }
  onTriggerSelection(data) {

    this.sidebarManager.onTriggerSelection(data);
  };
  onResultsContainerSelection(data) {

    this.sidebarManager.onResultsContainerSelection(data);
  };
  onFrameReadyForLoadingUrl() {

    this.sidebarManager.onFrameReadyForLoadingUrl();
  }
  onSidebarClosed(tab) {

    this.sidebarManager.onSidebarClosed();
  }
  setContextualizedElement(extractedData) {

      this.targetElement = extractedData;
  };
  highlightMatchingElements(tab, data) {

    browser.tabs.sendMessage(tab.id, {call: "highlightMatchingElements", args: data});
  }
  selectMatchingElements(tab, data) {

    browser.tabs.sendMessage(tab.id, {"call": "selectMatchingElements", "args": data });
  };
  disableHarvesting(tab) {

    this.disableDomSelection(tab);
  }
  adaptPlaceholder(tab, data) {

    this.sidebarManager.adaptPlaceholder(tab, data);
  };
  extractInput(inputSel, doc){

    var input = doc.evaluate( inputSel, doc, null, 9, null).singleNodeValue;
  };
  disableDomSelection(tab) {

    browser.tabs.sendMessage(tab.id, {call: "disableHighlight"});
    browser.tabs.sendMessage(tab.id, {call: "disableContextElementSelection"});
  }
  enableElementSelection(tab, data) {

  	this.backPageSelector.enableElementSelection(tab, data);
  }
  disableElementSelection(tab, selector) {

    this.backPageSelector.disableElementSelection(tab, selector);
  }
  loadDataForConceptDefinition() {

    browser.runtime.sendMessage({
        call: "loadXpaths",
        args: this.targetElement.selectors
    });

    browser.runtime.sendMessage({
        call: "loadPreview",
        args: this.targetElement.preview
    });
  }
}
