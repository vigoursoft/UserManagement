
var express = require('express'),
  nodeMailer = require('nodemailer');
var app = express();

var randNumber=0;

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('HelloExpress.db');

// grab static files from the static dirs
app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(express.static('styles'));

var dict=processFile('config.txt');


//incoming link click from the user's email address
app.get('/register', function(request, response){
 
    let sql="SELECT id From ID WHERE id="+request.query.id+";";
    console.log(sql);

    db.get(sql, (err, row) => {
        if (err) {
        response.send("That did not work.");     
        return console.error(err.message);
        }
        else
         response.redirect('/enroll.html');
        console.log(row);
      });

   });
   
  /* retrieve the email addy from index html form, create  
  and store a temp id/PIN; send email invitation link */
  app.post('/send-mail', function (request, response) {
    
    let transporter = nodeMailer.createTransport({
        host: ''+dict.host+'',
        port: parseInt(dict.port),
        secure: false,
        auth: {
            user: ''+dict.user+'',
            pass: ''+dict.pass+''
        },
        tls:{
            ciphers:'SSLv3'
        }
    });

    randNumber=Math.floor((Math.random()*100000) + 10000); console.log(randNumber);
   let mailOptions = {
        from: dict.from, // sender address
        to: request.body.recipient, // list of receivers
        subject: dict.subject, // Subject line
       // text: request.body.body, // plain text body
        html: '<a href="http://localhost:3000/register?recipient=' +request.body.recipient
            +'&id='+randNumber+'"<b>Please click this link to continue registration</b></a><p>'+
            "Your PIN number is "+ randNumber // html body
    };
    
   
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            
            return console.log(error + 'Message to'+ request.body.recipient);
        }
        console.log('Message sent');
      
        let sql = "INSERT INTO id (id) "+
        "VALUES ('"+randNumber+"' )";
    
        console.log(sql);
        dbops(sql,[], "Random number inserted ");

        }); //transporter
       response.send('Check your email');      
    });
   
   // insert a new linguist and delete the temporary id/pin
   app.post('/enroll', function(request, response) {
    let columns="id, firstname, lastname, email, telephone, paypal, langsrc, langtgt,"+ 
    " streetaddress, zipcode, city ";
    
    let params=[]; params.push(null);  
    for (const [key, value] of Object.entries(request.body)) {
        console.log(`${key} ${value}`); 
        // this would be the place to so some sanity checks on
        // input, i.e. no scripts, no <>, or other monkey business
        params.push(value);// column value
      }
    let pin=params.pop();

    // right now, the order of fields in the enroll form mut match the form
   let sql = "INSERT INTO linguists ("+columns+" ) "+
   "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )";

    console.log(sql);
    msg= dbops(sql, params, "Enrolled inserted ");
    
    
    sql="Delete from id where id=?";
    msg= dbops(sql, [pin], "random number deleted ");

    response.send(msg);
});

// common db INSERT and DELETE 
function dbops(sql, params, msg){
   
    db.run(sql, params, function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(msg+ `${this.changes}`);
      });

  return "okay";
}


function processFile(inputFile) {
    var dict={};
    var first, second, idx;

    var fs = require('fs'),
        readline = require('readline'),
        instream = fs.createReadStream(inputFile),
        outstream = new (require('stream'))(),
        rl = readline.createInterface(instream, outstream);
     
    rl.on('line', function (line) {
        idx=line.indexOf(":");
        first=line.substring(0, idx);
        idx=line.indexOf(":")+1;
        second=line.substring(idx);
        dict[first]=second;
        console.log("first is "+first +" second is "+second);
        
    });
    
    rl.on('close', function (line) {      
        console.log('done reading file.'+dict.host);
       
    });

    return dict;
   
}

// start it
app.listen(3000, function(){
    console.log('Server is listening on port 3000');
});