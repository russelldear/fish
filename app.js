var Session = require('flowdock').Session;
var util = require('util');
var http = require('http');
var url = require('url');

var session;

http.createServer(function(request, response){
	var queryData = url.parse(request.url, true).query;

	if (queryData.key && queryData.searchText) {
		session = new Session(queryData.key);

		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write("<html><body>")
		currentResponse = response;

		getFlows(response, queryData.key, queryData.searchText);
	}
	else {
		response.writeHead(200, {'Content-Type': 'text/plain'});
		response.end('I need key and searchText parameters to work properly.\n');
	}
}).listen(8666);

function getFlows(responseObject, key, searchText){

	session.get(
		'/flows/',
		{ users: 0 },
		function (err, result, response) {
			
			var flows = [];
	
			for (i = 0; i < result.length; i++) { 
				var flowId = result[i].id; 
				flows.push(result[i]);
			}  

			getMessages(responseObject, flows, searchText);
		});
}

function getMessages(responseObject, flows, searchText) {
	for (k = 0; k < flows.length; k++) { 
		if(flows[k] === null){
			console.log('why?');
		}
		else {
		session.get(
			'/flows/xero/' + flows[k].parameterized_name + '/messages/',
			{ search: searchText },
			function (err, result, response) {
				if (result.length > 0){
					for (j = 0; j < result.length; j++) { 
						if(result[j].thread && result[j].thread.id && result[j].event === "message"){
							responseObject.write("<div>Flow: " + flows[k].parameterized_name + " - Date: " + result[j].created_at + " - <a href=\'https://www.flowdock.com/app/xero/" + flows[k].parameterized_name + "/threads/" + result[j].thread.id + "\'>" + result[j].content + "</a></div>");
						}
					}
				}
				flows[k] = null;
			});
	}
	}

	while(responseObject.finished == false){
		checkFinish(flows, responseObject);
	}
}

function checkFinish(flows, responseObject){
	
	for (k = 0; k < flows.length; k++) { 
		if (flows[k] != null){
			console.log('here');
			return;
		}
	}

	responseObject.write("</body></html>")
	responseObject.end();	
}


