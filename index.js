var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var app = express();
var img = mysql.createConnection({
	host: "127.0.0.1",
	user: "user",
	password: "pass",
	database: "db"
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/game(.html)?', function(req, res)
{
	res.sendfile('game.html');
});
app.get('/client.js', function(req, res)
{
	res.sendfile('client.js');
});
app.get('/styles.css', function(req, res)
{
	res.sendfile('styles.css');
});

var images = []; // images from db;
var imgid = []; // image id from db to match in keywords;
var users = [], ul = 0; // users info and length
var token = []; // token to user match
var genToken = function()
{
	var tk = "";
	var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
	for(var i = 0; i < 20; i ++)
	{
		tk += letters[Math.floor(Math.random()*letters.length)];
	}
	return tk;
}
app.post('/checkToken', function(req, res)
{
	if(token[req.body.token] == undefined)
	{
		var ntoken = genToken(); // Assign a new token to the user
		res.send({valid: 0, ntk: ntoken});
		token[ntoken] = ul;
		users[ul ++] = {token: ntoken};
		users[ul-1].image = Math.floor(Math.random()*images.length); // Assign an image
		users[ul-1].allowed = [1]; // Allowed squares to reveal
		users[ul-1].points = 0; // Current result
		console.log("User "+ul+" has token "+ntoken+", image ",users[ul-1].image);
	}
	else res.send({valid: 1});
});
app.post('/getElement', function(req, res)
{
	//console.log(req.body);
	var tk = token[req.body.token];
	if(tk == undefined) return;
	var w = req.body.which // element to be returned
	var dat = images[users[tk].image];
	//console.log(w, users[tk].allowed);
	if(w == -1) res.send(dat.substring(0, 6));
	else if(users[tk].allowed[w] != 1 || dat.length < (w*4+5)*8) res.send({});
	else
	{
		res.send({tl: dat.substring((w*4+1)*8, (w*4+2)*8), 
		  	      tr: dat.substring((w*4+2)*8, (w*4+3)*8), 
		  	  	  bl: dat.substring((w*4+3)*8, (w*4+4)*8), 
		  	  	  br: dat.substring((w*4+4)*8, (w*4+5)*8)}
		);
		users[tk].allowed[4*w+1] = 1;
		users[tk].allowed[4*w+2] = 1;
		users[tk].allowed[4*w+3] = 1;
		users[tk].allowed[4*w+4] = 1;
	}
});
app.post('/tryWord', function(req, res)
{
	//console.log(req.body);
	var tk = token[req.body.token];
	if(tk == undefined) return;
	var w = req.body.word // word to check
	var id = imgid[users[tk].image];
	img.query("SELECT times FROM keywords WHERE imgid="+id+" AND word='"+w+"'", function(err, rows)
	{
		if(err) throw err;
		if(rows.length == 0)
		{
			//HERE HAPPENS SOME POINT AND NEW WORD STUFF
			//
			img.query("INSERT INTO keywords (word, imgid, times) VALUES ('"+w+"',"+id+",1)", function(err, rows) // MAYBE IN THE FUTURE TO HAVE CONTROL NOT INSERT EVERYTHING
			{
				if(err) throw err;
			});
			//
			res.send({times:0, inserted: 1});
		}
		else
		{
			console.log(rows[0].times);
			img.query("UPDATE keywords SET times=times+1 WHERE word='"+w+"' AND imgid="+id, function(err, rows)
			{
				if(err) throw err;
			});
			res.send({times: rows[0].times+1, inserted:1});
		}
	});
});
img.connect(function(err)
{
	if(err) console.log("Error connecting to image and keyword database");
	else
	{
		console.log("Image and keyword database connected");
 
		var query = img.query("SELECT COUNT (*) AS total FROM images", function(err, res)
		{
 			console.log("Counted "+res[0].total+" images");
 			img.query('SELECT CONVERT(dat USING utf8) AS res FROM images', function(err,rows)
			{
  				if(err) throw err;

		  		for(var i = 0; i < rows.length; i ++) images[i] = rows[i].res;
		  		console.log('Image data received and loaded');
		  		//console.log(images[2]);
			});
		});
		img.query("SELECT id FROM images", function(err, res)
		{
			for(var i = 0; i < res.length; i ++) imgid[i] = res[i].id;
				console.log(imgid);
		});
	}
});
app.listen(3000, function ()
{
  console.log('App listening on port 3000!')
});
