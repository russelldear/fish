var Session = require('flowdock').Session;
var util = require('util');
var http = require('http');
var url = require('url');
var sprintf = require('sprintf-js').sprintf;
var html = require('./html.js')

var flows = [];

http.createServer(function(request, response){
	var queryData = url.parse(request.url, true).query;

	if (queryData.key && queryData.searchText) {
		var session = new Session(queryData.key);

        response.writeHead(200, { 'Content-Type': 'text/html' });
		response.write(html.start());

		searchFlows(session, response, queryData.key, queryData.searchText);
	}
	else {
	  	response.writeHead(200, {'Content-Type': 'text/plain'});
		response.end('I need key and searchText parameters to work properly.\n');
	}
}).listen(8666);

function searchFlows(session, responseObject, key, searchText){
	session.get(
		'/flows/',
		{ users: 0 },
		function (err, result, response) {
			for (i = 0; i < result.length; i++) { 
				var flowId = result[i].id; 
				flows.push(flowId);
				searchFlow(session, responseObject, flowId, result[i].parameterized_name, searchText);
			}  
		});
}

function searchFlow(session, responseObject, flowId, flowName, searchText) {
	session.get(
		'/flows/xero/' + flowName + '/messages/',
		{ search: searchText },
		function (err, result, response) {
			if (result.length > 0){
				for (j = 0; j < result.length; j++) {
                    if (result[j].thread && result[j].thread.id && result[j].event === "message") {
                        responseObject.write(sprintf(html.row(), flowName, result[j].created_at, result[j].thread.id, result[j].content));
					}
				}
			}
			var deleteMe = flows.indexOf(flowId);
			if (deleteMe > -1) {
			    flows.splice(deleteMe, 1);
			}
			checkFinish(responseObject);
		});
}

function checkFinish(response){

	if (flows.length > 0){
		return;
	}
	
	response.write(html.end())
	response.end();
}


