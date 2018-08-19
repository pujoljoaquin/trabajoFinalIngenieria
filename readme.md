# About the project #

Logikós is a decision support system integrated to the Web. It is composed by different extensions. 

In this repo you can find the implementation of the templates editor: an extension allowing the definition of templates that can be shared among users and used to easily extract information items from any annotated Web site, by using the [Items Extractor](https://bitbucket.org/logikos-web/items-collector) extension.

## System Requirements ##

* Firefox 57 or Chrome 64.0.3282.140 onwards
* NPM 5.6.0 (maybe other versions work)

## Building the extension ##

Clone this repo:
git clone https://gabybosetti@bitbucket.org/logikos-web/templates-editor.git

Download the dependencies:
cd ./templates-editor
npm install

## Installing the extension in Chrome ##

1. Open "chrome://extensions/" in Chrome
2. Click "Load not packaged extension" 
3. Select any file in your add-on's root directory (web-ancillary-search)

## Debugging the extension in Chrome ##

You can debug and see logs from the Webconsole and the Browser's console. It depends on which kind of script you need to log/debug (content/backgroun scripts). 

## Using the tool ##

To define a new template: 

1. Open a document. E.g. an [ResearchGate article]{https://www.researchgate.net/publication/317540149_From_Search_Engines_to_Augmented_Search_Services_An_End-User_Development_Approach} 
2. Press the "Logikós template editor".
3. Press "new template"
4. Choose a name for the template. E.g. ResearchGate article
5. Click next
6. Click on the div containing the summary description of the article (name, doi, authors, etc). It currently has the "content-page-header" css class.
7. Click on the DOM element matching the title of the publication. Then name it "title" at the sidebar.
8. Click on the DOM element matching the number of reads of the publication. Then name it "reads" at the sidebar.
9. Click on the DOM element matching the citations of the publication. Then name it "citations" at the sidebar.
10. Click next
11. Click finish.