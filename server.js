var http = require('http');
var fs = require('fs');
var chat = require('./chat');

http.createServer(function(req,res){
	switch(req.url){
		
		case '/':
			sendFile('index.html', res);
			break;
		case '/subscribe':
			chat.subscribe(req,res);
			break;
		case '/publish':
			var body = '';
			req
				.on('readable', function(){
					var readed = req.read();
					if(readed)
						body += readed;
					
					if(body.length >= 1e4){
						res.statusCode = 413;
						res.end('big message');
					}
				})
				.on('end', function(){
					try{
						body = JSON.parse(body);
					}catch (e){
						res.statusCode = 400;
						res.end('bad request');
					}
					
					chat.publish(body.message);
					res.end('ok')
				});
			break;
		
		default:
			res.statusCode = 404;
			res.end = 'not found';
		
	}
	
}).listen(3000);


function sendFile(fileName, res){
	var fileSystem = fs.createReadStream(fileName);
	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
	fileSystem
		.on('error', function(){
			res.statusCode = 500;
			res.end('server error');
		})
		.pipe(res);
}