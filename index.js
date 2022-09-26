var http = require('http');
var express = require('express');
var app = express();

//app.use(upload.array()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));
var cors = require('cors');
app.use(cors({origin:"http://localhost:8100",methods:['POST','GET']}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
});

//let the server listen the at port 8081
var server = app.listen(8081, function (err) {
	if(err){
		console.log(err);
	}
	else{
		var host = server.address().address;
		var port = server.address().port;
		console.log("Server listening at http://%s:%s", host, port);
	}
});

app.get('/', function (req, res) {
	res.send("This is route..!");
});

//feed the chat
app.post('/feedChat', function (req, res) {
	//req.body.opponentID
});

app.get('/getChatsBetween', function (req, res) {
	//req.query.userIDToServer;
});
