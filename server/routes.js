const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fs = require('fs');
const util = require('util')
const {v4 : uuidv4} = require('uuid')
const { logLevel, loadModel, transcriptFromFile, freeModel } = require('./voskjs');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'users',
});

let model;
async function main () {
model = loadModel('./models/vosk-model-small-en-in-0.4');
}

main();

const app = express();

app.use(express.text({limit:'50mb',extended:true}))
app.use(express.json({limit:'50mb',extended:true}))
app.use(express.urlencoded({limit:'50mb',extended:true}))


app.post('/sendaudio', async (req,res) => {
  var request = req.body;
  fs.writeFileSync('file.wav', Buffer.from(request.sound.replace('data:audio/wav; codecs=opus;base64,', ''), 'base64'));
  const result = await transcriptFromFile('file.wav', model); 
  // console.log(util.inspect(result, {showHidden: false, depth: null}))
  // freeModel(model);
  res.send(result);
});
//Test db connection
app.get('/temp',(req, res) => {
    connection.query("SELECT * FROM userinfo", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result)
        // console.log("result of select ",result);
    })
})

app.post('/getBudget', function (req,res) {
  var request = req.body;
  connection.getConnection(function (err, connection) {
    connection.query(
      'SELECT * FROM user_budget WHERE userid = ?',
      [request.username],
      function (error, results, fields) {
        if (error) throw error;
        // console.log(results[0])
        res.send(results[0]);
      },
    );
  });
});

app.post('/signup', function (req, res, next) {
  var request = req.body;
  // console.log("request.username in routes",request.username)
  connection.getConnection(function (err, connection) {
    connection.query(
      'INSERT INTO userinfo (userid, password,fullname,phonenumber) VALUES ( ?, ?, ?, ?)',
      [
        request.username,
        request.password,
        request.fullName,
        request.phoneNumber,
      ],
      function (error, results, fields) {
        if (error) throw error;
        // res.status(409).send({'error':'error'});
        // console.log("resulyts in routs",results[0]);
        // res.send(results);
      },
    );

    // connection.query(
    //   'INSERT INTO user_budget (userid, budget, balance,expenses) VALUES ( ?, ?, ?, ? )',
    //   [
    //     request.username,
    //     request.budget,
    //     request.balance,
    //     request.expenses
    //   ],
    //   function (error, results, fields) {
    //     if (error) res.status(409).send({'error':'error'});
    //     res.send(results);
    //   },
    // );

  });
});

app.post('/login', function (req,res) {
  var request = req.body;
  connection.getConnection(function (err, connection) {
    connection.query(
      'SELECT * FROM userinfo WHERE userid = ? and password = ?',
      [request.username, request.password],
      function (error, results, fields) {
        if (error) throw error;
        res.send(results[0] || {'':''});

      },
    );
  });
});

app.post('/updateBudget', function (req, res) {
  console.log("in updatebudget");
  var request = req.body;
  connection.getConnection(function (err, connection) {
    connection.query(
      'UPDATE user_budget SET budget = ?,balance = ?, expenses =? WHERE userid = ?',
      [
        request.budget,
        request.balance,
        request.expenses,
        request.username
      ],

      function (error, results, fields) {
        // console.log("request.budget",request.budget)
        if (error) throw error;
        res.send(results);
      },
    );
  });
});



app.post('/addEntry', function (req, res) {
  var request = req.body;
  connection.getConnection(function (err, connection) {
    connection.query(
      'INSERT INTO user_expense (userid, title,amount,expensetype,date) VALUES ( ?, ?, ?, ?, ?)',
      [
        request.username,
        request.title,
        request.amount,
        request.expensetype,
        request.date
      ],
      function (error, results, fields) {
        if (error) throw error;
        res.send(results);
      },
    );
  });
});

app.delete('/deleteEntry', function (req, res) {
  var request = req.body;
  connection.getConnection(function (err, connection) {
    connection.query(
      // delete from postimages where postID=10 limit 1 offset 1
      'DELETE FROM user_expense WHERE userid = ? ORDER BY limit 1 offset= ?',
      [request.username],
      [request.index],
      function (error, results, fields) {
        if (error) throw error;
        res.send(results);
      },
    );
  });
});


app.post('/getEntries', function (req,res) {
  var request = req.body;
  connection.getConnection(function (err, connection) {
    connection.query(
      'SELECT * FROM user_expense WHERE userid = ?',
      [request.username],
      function (error, results, fields) {
        if (error) throw error;
        // console.log("request",request.username)
        // console.log(results,"in results")
        res.send(results);
        
      },
    );
  });
});

app.post('/getAmount', function (req,res) {
  var request = req.body;
  connection.getConnection(function (err, connection) {
    connection.query(
      'SELECT amount FROM user_expense WHERE userid = ? ORDER BY LIMIT 1 OFFSET=?',
      [request.username],
      [request.index],
      function (error, results, fields) {
        if (error) throw error;
        res.send(results);
      },
    );
  });
});

// Starting our server.
app.listen(5015, () => {
  console.log('Go to http://localhost:5015 so you can see the data.');
});
