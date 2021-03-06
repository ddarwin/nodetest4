var express = require('express');
var newrelic = require('newrelic');
var router = express.Router();
var request = require('request');
var config = require('config');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.redirect('/list');
});

/* GET user search */
router.get('/search', function(req, res, next) {
  res.render('search', { title: 'Search for User' });
})

/* GET Userlist page. */
router.get('/list', function(req, res) {

  // Call the API
  var uri = config.get('apiConfig.user') + 'users/';
  request.get(uri, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      res.render('userlist', {'users': JSON.parse(body)});
    } else {
      console.log('API Error!');
      if (error) {
        throw(error);
      } else {
        throw(new Error(body));
      }
    }
  });
});

/* GET New User page. */
router.get('/new', function(req, res) {
  res.render('newuser', { title: 'Add New User' });
});

/* GET Specific User page. */
router.get('/:id', function(req, res) {
  var id = req.params.id;
  console.log('WEB - get user profile: ' + id);

  // Call the API
  var uri = config.get('apiConfig.user') + 'user/' + id;
  request.get(uri, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      res.render('userprofile', {'userlist': JSON.parse(body)});
    } else {
      console.log('API Error!');
      if (error) {
        throw(error);
      } else {
        throw(new Error(body));
      }
    }
  });
});

/* POST to Add User Service */
router.post('/add', function(req, res) {

    // Set our internal DB variable
    var db = req.db;
    var collection = db.get('usercollection');

    // Submit to the DB
    var userInfo = {
        'fname': req.body.fname,
        'lname': req.body.lname,
        'username': req.body.username,
        'email': req.body.email,
        'addstreet': req.body.addstreet,
        'addcity': req.body.addcity,
        'addstate': req.body.addstate,
        'addzip': req.body.addzip
    }

    // POST Options
    var uri = config.get('apiConfig.user') + 'user/';
    var options = {
      'method': 'POST',
      'uri': uri,
      'json': true,
      'body': userInfo
    }

    // Call the API
    request(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var id = response.body._id;
        console.log('We are about to redirect to ' + id);
        res.redirect(id);
      } else {
        console.log('API Error!');
        if (error) {
          throw(error);
        } else {
          throw(new Error(body));
        }
      }
    });
});

/* Delete User page. */
router.get('/del/:id', function(req, res) {

  var id = req.params.id;
  var uname = req.query.username;
  
  console.log('WEB - deleting user profile: ' + uname);
  
  // Call the API
  var uri = config.get('apiConfig.user') + 'del/'+id;
  request.get(uri, function(error, response, body) {
    if (!error && response.statusCode === 200) {
        res.render('userdeleted', {'user': {'username': uname}});
    } else {
      console.log('API Error!');
      if (error) {
        throw(error);
      } else {
        throw(new Error(body));
      }
    }
  });
});

/* POST to search form */
router.post('/runsearch', function(req, res) {
    // Set our internal DB variable
    var db = req.db;
    var query = req.body.searchterm;

    var search = { "$or": [
        { "fname": query },
        { "lname": query },
        { "username": query },
        { "email": query },
        { "addstreet": query },
        { "addcity": query },
        { "addstate": query },
        { "addzip": query },
        ] };

    // console.log(search);

    var collection = db.get('usercollection');
    collection.find(search, {}, function(e, docs) {
        // console.log(docs);
        res.render('userlist',
          {'users': docs });
    });
});

module.exports = router;
