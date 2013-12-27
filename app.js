var sockjs  = require('sockjs'),
	express = require("express"),
	app = express(),
	server = require('http').createServer(app),
	fileStatusSocket = sockjs.createServer({}),
	chokidar = require('chokidar'),
	fs = require('fs');

var watcher = chokidar.watch('gallery', {ignored: /[\/\\]\./, persistent: true});



fileStatusSocket.on('connection', function(conn) {
	
	['add', 'addDir', 'change', 'unlink', 'unlinkDir'].forEach(function(eventType){
		watcher.on(eventType, function(path){
			conn.write(JSON.stringify({ type : eventType, path : "/" + path}));
		});
	});

	fs.readdir('gallery', function(err, files){
			if (!err){
				var initialFiles = files.filter(function(filename){
					return !(filename.match(/^\./));
				});
				initialFiles.forEach(function(filename){
					conn.write(JSON.stringify({ type : 'add', path : "/gallery/" + filename}));
				});
			}
	});
    
    conn.on('data', function(message) {});
    conn.on('close', function() {});
});


fileStatusSocket.installHandlers(server, {prefix:'/filestatus'});

app.use(express.static(__dirname+'/client'));


app.get('/gallery/*', function(req, res) {
    res.sendfile(__dirname + '/gallery/' + req.params[0]);
});

server.listen(8000);