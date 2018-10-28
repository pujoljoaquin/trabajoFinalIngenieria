class BrowserUiManager {

  constructor() {
    this.initialize();
  }

  initialize() {

    this.browserActionsClicks = {};
    this.templatesCreator = new TemplatesCreator();
  };

  showProductComments(message, xpath) {
    console.log("BrowserUiManager");
    this.templatesCreator.showProductComments(message, xpath);
  }

  getFromRemoteRepo(data) {
    return (new RemoteStorage()).get(data.key);
  }

  onElementSelection(data) {

    this.templatesCreator.onElementSelection(data);
  };

  onResultsContainerSelection(data) {

    this.templatesCreator.onResultsContainerSelection(data);
  };

  selectMatchingElements(data) {

    var me = this;
    this.executeOnCurrentTab(function(tab){
      me.templatesCreator.selectMatchingElements(tab, data);
    });
  };

  removeFullSelectionStyle(data) {

    var me = this;
    this.executeOnCurrentTab(function(tab){
      me.templatesCreator.removeFullSelectionStyle(tab);
    });
  }

  onFrameReadyForLoadingUrl() {

    this.templatesCreator.onFrameReadyForLoadingUrl();
  }

  onSidebarClosed(data) {

    var me = this;
    this.executeOnCurrentTab(function(tab){
      me.templatesCreator.onSidebarClosed(tab);
    });
  }

  toggleSidebar() {

    this.templatesCreator.toggleSidebar();
  };

  closeSidebar() {

    this.templatesCreator.closeSidebar();
  };

  getCurrentUrl(data) {

    var me = this;
    return new Promise((resolve, reject) => {
      me.executeOnCurrentTab(function(tab){

        resolve(tab.url);
      });
    });
  };

  getCurrentFavicon (){

    var me = this;
    return new Promise((resolve, reject) => {
      me.executeOnCurrentTab(function(tab){
        resolve(tab.favIconUrl);
      });
    });
  }

  getTemplateTags(data) {

    var me = this;
    return new Promise((resolve, reject) => {

      if(data.value == null || data.value==undefined || data.value.length == 0)
        resolve("nothing here!");

      data.value = data.value.toLowerCase();
      var endpoint = this.buildTemplateTagsQuery(data.value);

      var req = new XMLHttpRequest();
      req.open('GET', endpoint, false);
      req.send(null);

      var retTags = (req.responseText)? JSON.parse(req.responseText).results.bindings : [];
      var tags = [];

      for (var i = 0; i < retTags.length; i++) {
        tags.push({
          'label': retTags[i].label.value,
          'value': retTags[i].resource.value
        });
      };

      resolve(tags);
    });
  }
  buildTemplateTagsQuery(value) {
    return 'http://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=' +
            encodeURIComponent('SELECT * \
            WHERE { \
               ?resource a owl:Class. \
               ?resource rdfs:label ?label.  \
               FILTER ( contains(?label, "' + value + '") && contains(str(?resource), "http://dbpedia.org/ontology")). \
            } LIMIT 5') +
            '&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on';
  }

  externalResourcesIframeIsLoaded(){
    //TODO: move this behaviour to the searchTool class

    this.listenForExternalRetrieval = true;
    browser.tabs.sendMessage(this.currentQuerySpec.tabId, {
      call: "extractFromUrl",
      args: this.currentQuerySpec
    });
  };

  getBrowserActionClicksInTab(tabId) {
    return this.browserActionsClicks[tabId]? this.browserActionsClicks[tabId] : 0;
  };

  increaseBrowserActionClicksInTab(tabId) {

    this.browserActionsClicks[tabId] = this.getBrowserActionClicksInTab(tabId) + 1;
  };

  loadDocumentIntoResultsFrame(data) {

    this.searchTool.loadDocumentIntoResultsFrame(data);
  };


  enableElementSelection(data) {

    var me = this;
    this.executeOnCurrentTab(function(tab){
      me.templatesCreator.enableElementSelection(tab, data);
    });
  };

  disableElementSelection(data) {

    var me = this;
    this.executeOnCurrentTab(function(tab){
      me.templatesCreator.disableElementSelection(tab, data.selector);
    });
  };

  highlightInDom(data) {

    var me = this;
    this.executeOnCurrentTab(function(tab){

      me.templatesCreator.highlightMatchingElements(tab, data);
    });
  }

  loadDataForConceptDefinition() {

    this.templatesCreator.loadDataForConceptDefinition();
  };

  setContextualizedElement(extractedData) {

      this.templatesCreator.setContextualizedElement(extractedData);
  };

  executeOnCurrentTab(callback) {

    try{
        browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {

            callback(tabs[0]);
        });
    }catch(err){
      console.log(err);
    }
  }

  //Mover todo lo que sigue a la SearchTool
  newDocumentWasLoaded(data) {

    return this.searchTool.newDocumentWasLoaded(data);
  };

  startListeningForUrls(){

    return this.searchTool.startListeningForUrls();
  }

  setSearchListeningStatus(data){

    return this.searchTool.setSearchListeningStatus(data.status);
  }
}
