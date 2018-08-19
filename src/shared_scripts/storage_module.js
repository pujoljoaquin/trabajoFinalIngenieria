class Storage{
	get(key){}; //Must return a promise
	set(key, value){}; //Must return a promise
}

class LocalStorage extends Storage{
	
	get(key){
		return browser.storage.local.get(key); 
	};
	set(key, value){

		var reg = {};
			reg[key] = value;

		return browser.storage.local.set(reg); //{key: value});
	};
}

class RemoteStorage extends Storage{
	
	get(key){
		
		return new Promise((resolve, reject) => {

	        browser.storage.local.get("config").then(function(result) {

			    var templatesUri = result.config["templates-repo-uri"];
			    var endpoint = `${templatesUri}/matching?url=${key}`;
			    
			    var req = new XMLHttpRequest();
				req.open('GET', endpoint, false); 
				req.send(null);
				
				var results = (req.responseText)? JSON.parse(req.responseText).response: [];
				resolve(results);
			});
	    });
	};
	set(key, value){

		return new Promise((resolve, reject) => {

	      browser.storage.local.get("config").then(function(result) {

	        var endpoint = result.config["templates-repo-uri"];
	        const payload = Object.assign({}, { //TODO: this is the same step as in the local strategy 
	          owner: 'no_reply@lifia.info.unlp.edu.ar',
	          type: value,
	          url: key,
	          groups: ['public'],
	        }, params);

	        const req = new XMLHttpRequest();
	        req.open('PATCH', endpoint, false);
	        req.setRequestHeader("Content-type", "application/json");
	        const postItemRequest = JSON.stringify(payload);
	        req.send(postItemRequest);

	        resolve(req);
	      });
	    });
	};
}