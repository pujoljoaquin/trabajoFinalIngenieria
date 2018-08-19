var storage = new LocalStorage();
storage.get("config").then(function checkDefaultValues(result) {

  	if(result.config) return;

  	storage.set("config", {
	    "templates-repo-uri": "http://163.10.5.42:3000/api/Templates"
	});
});