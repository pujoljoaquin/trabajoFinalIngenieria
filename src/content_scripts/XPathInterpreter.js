class XPathInterpreter {

    constructor(){
        this.currentElement;
        this.xPaths;
        this.engine = [new IdTreeXPathEngine(), new ControlTypeBasedEngine(),
        new FullXPathEngine(), new ClassXPathEngine() ];
    }
    // setear un unico engine de busqueda de xpath
    setEngine (engine) {
        this.engine = engine;
        //this.engines = new array(engine);
    };

    // agregar un engine de busqueda de xpath a los existentes
    addEngine (engine) {
        this.engines.add(engine);
    };

    // borrar un engine de busqueda de xpaths
    removeEngine (engine) {
        if (this.engines.inlude(engine)){
            this.engines.remove(this.engines.indexOf(engine));
        }
    };

    // borrar todos los engine de busqueda de xpaths
    removeEngines () {
        this.engines = new array();
    };


    // obtener un array de xPaths correspondiente a los engines seteados
    getMultipleXPaths (element, parent, removeBase) {
        var xPathArray = [];
        if(element == undefined)
            return;
        if(parent == undefined)
            parent = element.ownerDocument;

        //var console = element.ownerDocument.defaultView.console; //.log("********************************", element, parent);
        for (var i = 0; i < this.engine.length; i++) {
            try{
                var path = this.engine[i].getPath(element, parent);
                if (path !== undefined && path !== null && path.length && path.length > 0){

                    for (var j = 0; j < path.length; j++) {

                        if(removeBase){ //TODO: make a special message for retrieving without IDs & relatives

                            if(path[j] != null && path[j].indexOf('.//')>-1){
                                path[j] = path[j].slice(3,path[j].length);
                            }
                        }
                        else{
                            xPathArray.push(path[j].slice(0,path[j].lastIndexOf("[")));
                        }

                        xPathArray.push(path[j]);
                    }
                }
            }catch(err){
                console.log(err);
            }
        };
        return xPathArray;
    };

    // obtiene un xpath unico
    getPath (element, parent) {
        return this.engine.getPath(element, parent);
        // return xPathArray;
    };

    getElementByXPath (xpath, node){
        //WARNING: I THINK THIS IS NOT PROPERLY WORKING. USE -> getSingleElementByXpath
        var doc = node.ownerDocument;
        return  doc.evaluate( xpath, doc, null,
            9, null).singleNodeValue; // 9 = FIRST_ORDERED_NODE_TYPE*/
    }
    getSingleElementByXpath (xpath, node) {

        //console.log("evaluating", xpath, " on ", node);
        var doc = (node && node.ownerDocument)? node.ownerDocument : node;
        var results = doc.evaluate(xpath, node, null, XPathResult.ANY_TYPE, null);
        return results.iterateNext();
    };
    getElementsByXpath (xpath, node) {
        var nodes = [];
        var doc = (node && node.ownerDocument)? node.ownerDocument : node;
        var results = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
        var res = results.iterateNext();

        while (res) {
          nodes.push(res);
          res = results.iterateNext();
        }
        return nodes;
    };
}


/*
 * Clase strategy
 */
class XPathSelectorEngine {
    getElement (aNode, aExpr) {

        var xpe = new aNode.defaultView.XPathEvaluator();
        var nsResolver = xpe.createNSResolver(aNode.ownerDocument === null ?
            aNode.documentElement : aNode.ownerDocument.documentElement);
        var result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null);
        var found = [];
        var res;
        while (res = result.iterateNext())
            found.push(res);
        return found;
    };
};


/*
 * Estrategia por ID directo
 * Si no lo encuentra devuelve null
 */
class BasicIdEngine extends XPathSelectorEngine {

    getPath (element, parent){
        if (element && element.id){
            return ['.//'+ element.nodeName.toLowerCase() +'[@id="' + element.id + '"]'];
        }else{
            return;
        }
    };
};

/*
 * Obtiene un Xpath según su RelativePath.
 * Busca para arriba desde el padre un ID y a partir de ahi un path relativo.
 */
class IdTreeXPathEngine extends XPathSelectorEngine {

    getPath (element, parent){

        if(element == undefined)
            return null;
        var oldElem = element;
        var oldTag = oldElem.nodeName.toLowerCase();
        //element = element.parentNode;
        var paths = [];
        var parentNode = parent || element.ownerDocument;
        //paths.splice(0, 0, oldTag);
        // Use nodeName (instead of localName) so namespace prefix is included (if any).
        var siblingId = false;
        for (; element && element.nodeType == 1 && element.innerHTML != parentNode.innerHTML; element = element.parentNode) {
            var index = 1;
            if (element.id){
                siblingId = true;
            }
            else {
            for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
                // Ignore document type declaration.
                if (sibling.nodeType == 10){ //element.ownerDocument.defaultView.Node.DOCUMENT_TYPE_NODE
                    continue;
                }

                if (sibling.nodeName == element.nodeName){
                    index++;
                }
            }
            }

            var tagName = element.nodeName.toLowerCase();
            var pathIndex;
            if (!siblingId){
                pathIndex = (index ? "[" + (index) + "]" : "");
                paths.splice(0, 0, tagName + pathIndex);
            }else{
                var result = this.getElementIdXPath(element) + (paths.length ? "/" + paths.join("/") : "");
                var oldElem2 = (new BasicIdEngine()).getPath(oldElem);
                if (oldElem2 && oldElem2.length && oldElem2.length > 0 && result == oldElem2[0]){
                    return null;
                }
                else return [result, result.substring(0, result.length-3)];
            }
        }
        var result =  paths.length ? ".//" + paths.join("/") : null;
        var oldElem2 = (new BasicIdEngine()).getPath(oldElem);
        if (oldElem2 && oldElem2.length && oldElem2.length > 0 && result == oldElem2[0]){
            return;
        }
        else return [result];
    };
    getElementIdXPath(element){
        if (element && element.id){
            return './/'+ element.nodeName.toLowerCase() +'[@id="' + element.id + '"]';
        }else{
            return null; //Siempre que no encontremos el Xpath devolvamos null.
        }
    };
};


class ControlTypeBasedEngine extends XPathSelectorEngine {

    getPath (element, parent){

        if (!element) return;

        var xpaths = [];
        var tagName = element.nodeName.toLowerCase();
        var accumPathEnding = tagName;
        var traversingElem = element;

        while (traversingElem = traversingElem.parentElement){
            if(traversingElem.className){
                accumPathEnding = "*[contains(@class, 'briefCitRow')]/" + accumPathEnding;
                break;
            }
            else{
                accumPathEnding = traversingElem.nodeName.toLowerCase() + "/" + accumPathEnding;
            }
        }

        xpaths.push(".//" + accumPathEnding);

        return (xpaths.length && xpaths.length > 0)? xpaths:undefined;
    }
}

/*
 * Función que obtiene un Xpath en relación a todos los elementos con la misma clase.
 */
class ClassXPathEngine extends XPathSelectorEngine {

    getPath (element, parent){

        if (!element) return;
        var elemClass = element.className;
        if (!elemClass) return;
        var tagName = element.nodeName.toLowerCase();

        // ESTO ES LO QUE DETERMINA COMO SERA EL XPATH -> VER VARIANTES
        //var elemPath = "//"+tagName+"[@class='"+elemClass+"']";
        var xpaths = [], elemClasses = elemClass.split("/[ ]+/");

        for (var i = 0; i < elemClasses.length; i++) {

            var elemPath = ".//"+tagName+"[contains(@class, '"+ elemClasses[i] +"')]";
            var res = this.getElement(element.ownerDocument, elemPath);
            for (var e in res){
                if (res[e]==element){
                    xpaths.push(elemPath);
                    break;
                }
            }
        }
        return (xpaths.length && xpaths.length > 0)? xpaths:undefined;
    };
};


/*
 * Estrategia xpath absoluto o full.
 * Funciona como el de firebug
 */
class FullXPathEngine extends XPathSelectorEngine {

    getPath(element, parent) {

        if(element == undefined)
            return null;
        var paths = [];
        var parentNode = parent || element.ownerDocument;
        // Arma el path hasta llegar al parent node, que puede ser el parametro o "document"
        for (; element && element.nodeType == 1 && element.innerHTML != parentNode.innerHTML; element = element.parentNode) {
            var index = 1;
            // aumenta el indice para comparar con los hermanos superiores del elemento actual (del mismo tipo)
            for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
                if (sibling.nodeType == 10) //element.ownerDocument.defaultView.Node.DOCUMENT_TYPE_NODE
                    continue;
                if (sibling.nodeName == element.nodeName)
                    index++;
            }

            var tagName = element.nodeName.toLowerCase();
            var pathIndex = "[" + (index) + "]";
            paths.splice(0, 0, tagName + pathIndex);
        }
        if(paths.length)
            return [".//" + paths.join("/")];
        else return;
    };
};

class CssPathEngine extends XPathSelectorEngine {

    getPath (element, parent) {
        var paths = [];

        for (; element && element.nodeType == 1; element = element.parentNode)
        {
            var selector = this.getElementCSSSelector(element);
            paths.splice(0, 0, selector);
        }

        if(paths.length)
            return paths.join(" ");
        else return;
    };
    getElementCSSSelector (element){
        if (!element || !element.localName)
            return null;

        var label = element.localName.toLowerCase();
        if (element.id)
        label += "#" + element.id;

        if (element.classList && element.classList.length > 0)
        label += "." + element.classList.item(0);

        return label;
    };
    getElement (aNode, aExpr) {
        if (aNode){
            return aNode.querySelector(aExpr);
        }else{
            return document.querySelector(aExpr);
        }
    };
};

window.XPathInterpreter = XPathInterpreter;
//console.log(window.XPathInterpreter); //"do not remove this line"
