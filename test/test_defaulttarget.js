"use strict";

var Redbird = require('../');
var Promise = require('bluebird');
var http = require('http');
var expect = require('chai').expect;

var DEFAULT_HOST_PORT = 53719;
var DEFAULT_PROXY_PORT = 53831;

var opts = {
  port: DEFAULT_PROXY_PORT,
	bunyan: false,
	defaultTarget: 'http://127.0.0.1:'+DEFAULT_HOST_PORT
}

describe("Requesting a host which is not registered", function(){
	
	it("should use a default target if defined", function(done){
		var redbird = Redbird(opts);

		expect(redbird.routing).to.be.an("object");

		
		testDefaultTarget().then(function(req){
			expect(req.headers['host']).to.be.eql('127.0.0.1.xip.io:'+DEFAULT_PROXY_PORT)
		})
	
		http.get('http://127.0.0.1.xip.io:'+DEFAULT_PROXY_PORT, function(res) {
		expect(res.statusCode).to.be.eql(200);
		var response = "";
			var responseSent = false;
			res.setEncoding('utf8');
			res.on('data', function(chunk){
				response += chunk;
			});
			res.on('end', function(){
				responseSent = true;
				expect(response).to.be.eql("default server");
			});

			setTimeout( function () {
				expect(responseSent).to.equal(true);
				done();
			}, 10);
	
		redbird.close();
		});
		
	});

	it("should respond with a 404 if there is no default target", function(done){
		var options = {
			port: DEFAULT_PROXY_PORT,
			bunyan: false
		}

		var redbird = Redbird(options);

		expect(redbird.routing).to.be.an("object");

		http.get('http://127.0.0.1.xip.io:'+DEFAULT_PROXY_PORT, function(res) {
			expect(res.statusCode).to.be.eql(404);
			redbird.close();
			done();
		});
	})
});

function testDefaultTarget(){
	return new Promise(function(resolve, reject){
		var server = http.createServer(function(req, res){
			
      res.write("default server");
      res.end();
			resolve(req);
      server.close();
		});
		server.listen(DEFAULT_HOST_PORT);
	})
}