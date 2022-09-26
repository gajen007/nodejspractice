var http = require('http');
var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer({ dest: 'userUploads/' });
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
var mysql = require('mysql');
var con = mysql.createConnection({host:"localhost",user:"phpmyadmin",password:"gajen",database:"codersChat"});
var md5 = require('md5');
var querystring = require("querystring")
var fs = require('fs');

app.post('/updateUserProfile', upload.single('fileToUpload'), function (req, res) {
	let table="users";
	if(req.body.userName==null||req.body.userEmail==null||req.body.userPassword==null||req.body.userName==""||req.body.userEmail==""||req.body.userPassword==""){
		return {message:"Insufficient Data! Probably missed something...",result:false};
	}
	else{
		var oldpath = req.file.path;
		var extension = req.file.originalname.substring(req.file.originalname.indexOf(".")+1,req.file.originalname.length);
		var newpath = req.file.destination+""+req.body.userID+"."+extension;
		fs.readFile(oldpath, function (err2, data) {
			if (err2) throw err2;
			fs.writeFile(newpath, data, function (err3) {
				if (err3) throw err3;
				else{
					con.query("UPDATE ?? SET email=?, username=?, password=?, avatarURL=? WHERE id=?",[table,req.body.userEmail,req.body.userName,md5(req.body.userPassword),newpath,req.body.userID],function (err1, result) {
						if (err1) { throw err1; }
						if (result.affectedRows==1) {
							res.json({"message":"Data updated successfully","result":true});
						}
						else{
							res.json({"message":"Something wrong","result":false});
						}
					});
				}
			});
			fs.unlink(oldpath, function (err4) {
				if (err4) throw err4;
			});
		});
	}
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

//feed the chat
app.post('/feedChat', function (req, res) {
	let table="chats";
	if(req.body.myUserID==null||req.body.opponentID==null||req.body.chatMessage==null||req.body.myUserID==""||req.body.opponentID==""||req.body.chatMessage==""){
		return {message:"Insufficient Data! Probably missed something...",result:false};
	}
	else{
		con.query("INSERT INTO ?? (senderID,receiverID,chatMessage) VALUES(?,?,?)",[table,req.body.myUserID,req.body.opponentID,querystring.escape(req.body.chatMessage)],function (err1, result) {
			if (err1) { throw err1; }
			if (result.affectedRows==1) {
				res.send({"message":"","result":true});
			}
			else{
				res.send({"message":"Something wrong..!","result":false});
			}
		});
	}
});

app.post('/uploadresourceforchat', function (req, res) {
	/*
userID
opponentID
caption
fileToUpload
	*/
	if(req.body.contactNameToServer==null||req.body.contactEmailToServer==null||req.body.userID==null||req.body.contactNameToServer==""||req.body.contactEmailToServer==""||req.body.userID==""){
		return {message:"Insufficient Data! Probably missed something...",result:false};
	}
	else{
		
	}
});

app.get('/getChatsBetween', function (req, res) {
	var userIDToServer=req.query.userIDToServer;
	var opponentIDToServer=req.query.opponentIDToServer;
	var table="chats";
	con.query("SELECT * FROM ?? WHERE (senderID=? AND receiverID=?) OR (senderID=? AND receiverID=?)",[table,userIDToServer,opponentIDToServer,opponentIDToServer,userIDToServer],function (err1, rows, columns) {
		if (err1) { throw err1; }
		res.send(rows);
	});
});

app.get('/getUserData', function (req, res) {
	var arrivedUsedID=req.query.myUserID;
	var table="users";
	con.query("SELECT id, username, email, avatarURL FROM ?? WHERE id=?",[table,arrivedUsedID],function (err1, rows, columns) {
		if (err1) { throw err1; }
		res.send(rows[0]);
	});
});

app.get('/getAllContactsAddedByThisUser', function (req, res) {
	var arrivedUsedID=req.query.userID;
	var table1="contacts";
	var table2="users";
	con.query("SELECT c.id as relationid, c.useridOfContact, c.contactName, u.avatarURL FROM ?? c JOIN ?? u ON u.id=c.useridOfContact WHERE c.addedByUsedID=?",[table1,table2,arrivedUsedID],function (err1, rows, columns) {
		if (err1) { throw err1; }
		res.send(rows);
	});
});

app.post('/newContact', function (req, res) {
	if(req.body.contactNameToServer==null||req.body.contactEmailToServer==null||req.body.userID==null||req.body.contactNameToServer==""||req.body.contactEmailToServer==""||req.body.userID==""){
		return {message:"Insufficient Data! Probably missed something...",result:false};
	}
	else{
		var tableName="users";
		var tableName2="contacts";
		let dummy=md5("dummy");
		con.query("SELECT * FROM ?? WHERE email=?",[tableName,req.body.contactEmailToServer],function (err1, rows1, columns1) {
			if (err1) { throw err1;  }
			if (rows1.length==0) { //Absolutely New User
				con.query("INSERT INTO ?? (username,email,password) VALUES (?,?,?)", [tableName,req.body.contactNameToServer,req.body.contactEmailToServer,dummy], function (err2, result1) {
					if (err2) { throw err2;  }
					if (result1.affectedRows==1) {
						con.query("SELECT * FROM ?? WHERE email=?",[tableName,req.body.contactEmailToServer],function (err3, rows2, columns2) {
							if (err3) { throw err3;  }
							con.query("SELECT * FROM ?? WHERE addedByUsedID=?",[tableName2,rows2[0].id],function (err4, rows3, columns3) {
								if (err4) { throw err4;  }
								if (rows3.length==0) {
									con.query("INSERT INTO ?? (useridOfContact,contactName,addedByUsedID) VALUES (?,?,?)", [tableName2,rows2[0].id,req.body.contactNameToServer,req.body.userID], function (err5, result2) {
										if (err5) { throw err5;  }
										if (result2.affectedRows==1) {
											res.send({"message":"Contact Added","result":true});
										} else{ res.send({message:"Database Error! Please try again...",result:false}); }
									});
								} else{ res.send({message:"This Contact is already existed",result:false}); }
							});
						});
					}
					else{
						res.send({message:"Database Error! Please try again...",result:false});
					}
				});

			}
			else{ //User has already been added by another user
				con.query("SELECT * FROM ?? WHERE email=?",[tableName,req.body.contactEmailToServer],function (err6, rows4, columns4) {
					if (err6) { throw err3;  }
					con.query("SELECT * FROM ?? WHERE addedByUsedID=? AND useridOfContact=?",[tableName2,req.body.userID,rows4[0].id],function (err7, rows5, columns5) {
						if (err7) { throw err7;  }
						if (rows5.length==0) {
							con.query("INSERT INTO ?? (useridOfContact,contactName,email,addedByUsedID) VALUES (?,?,?)", [tableName2,rows4[0].id,req.body.contactNameToServer,req.body.contactEmailToServer,req.body.userID], function (err8, result3) {
								if (err8) { throw err8;  }
								if (result3.affectedRows==1) {
									res.send({"message":"Contact Added","result":true});
								} else{ res.send({message:"Database Error! Please try again...",result:false}); }
							});
						} else{ res.send({message:"This Contact is already existed",result:false}); }
					});
				});
			}
		});
	}
});

app.get('/listChatsForUser', function (req, res) {
	var arrivedUsedID=req.query.userID;
	var table1="chats";
	var table2="users";
	con.query("SELECT c.id, c.senderID, s.username as senderName, s.avatarURL as senderAvatarURL, c.receiverID, r.username as receiverName, r.avatarURL as receiverAvatarURL, c.chatMessage,  c.sentTime  FROM ?? c JOIN ?? s ON s.id=c.senderID JOIN ?? r ON r.id=c.receiverID WHERE (c.senderID=? OR c.receiverID=?) ORDER BY c.sentTime DESC",[table1,table2,table2,arrivedUsedID,arrivedUsedID],function (err1, rows, columns) {
		if (err1) { throw err1; }
		res.send(rows);
	});
});

app.post('/signup', function (req, res) {
	if(req.body.unToServer==null||req.body.pwToServer==null||req.body.emailToServer==null||req.body.unToServer==""||req.body.pwToServer==""||req.body.emailToServer==""){
		return {message:"Insufficient Data! Probably missed something...",result:false};
	}
	else{
		var tableName="users";
		con.query("SELECT * FROM ?? WHERE email=?",[tableName,req.body.emailToServer],function (err, rows, columns) {
			if (err) { throw err; }
			if (rows.length==0) {
				con.query("INSERT INTO ?? (username,email,password) VALUES (?,?,?)", [tableName,req.body.unToServer,req.body.emailToServer,md5(req.body.pwToServer)], function (err2, result) {
					if (err2) { throw err;  }
					if (result.affectedRows==1) { res.send({message:"Signed up successfully!",result:true}); }
					else{ throw err2; res.send({message:"Database Error! Please try again...",result:false}); }
				});
			}
			else{
				res.send({"message":"It seems somebody has invited you already; Please login with this email and use the password as 'dummy'; Then change the password!","result":false});
			}
		});
	}
});

app.post('/login', function (req, res) {
	if(req.body.unToServer==null||req.body.pwToServer==null||req.body.unToServer==""||req.body.pwToServer==""){
		return {message:"Insufficient Data! Probably missed something...",result:false};
	}
	else{
		var tableName="users";
		con.query("SELECT * FROM ?? WHERE email=? AND password",[tableName,req.body.unToServer,md5(req.body.pwToServer)],function (err, rows, columns) {
			if (rows.length==1) {
				console.log("User has logged in via "+req.body.unToServer);
				res.send({"message":"Logged in!","result":true, "userID":rows[0].id});
			}
			else{
				res.send({"message":"Invalid email and or password!","result":false});
			}
		});
	}
});