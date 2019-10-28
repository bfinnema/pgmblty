const _ = require('lodash');
const express = require('express');
const router = express.Router();
const request = require("request");

// GET Subscriptions
router.get('/', (req, res) => {
//   console.log(`Here we are in the subscriptions router, GET all subscriptions.`);
  var options = makeOptions('', 'collection', 'GET');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  });
});

// GET One Subscription
router.get('/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router, GET one subscription: ${req.params.id}`);
  var options = makeOptions('/'+req.params.id, 'data', 'GET');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  });
});

// POST check-sync
router.get('/check-sync/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Check-sync for id: ${req.params.id}`);
  var options = makeOptions(':accessSwitchAndSP/'+req.params.id+'/_operations/check-sync', 'data', 'POST');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(`Body: ${body}`);
    res.send(body);
  });
});

// POST subscription
router.post('/', (req, res) => {
  // console.log(`Here we are in the accessswitchandsp router. POST service`);
  // console.log(`req.body, name: ${req.body.name}`);
  var object_body = {
    "accessSwitchAndSP:accessSwitchAndSP": req.body
  };
  // console.log(`Object body: ${JSON.stringify(object_body)}`);
  var body = JSON.stringify(object_body);
  // console.log(`body: ${body}`);
  
  // console.log(`***************`);
  // console.log(`User: ${process.env.NSO_USER}, Password: ${process.env.NSO_PWD}`);
  var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);

  var options = {
    method: 'POST',
    url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/running/open-net-access',
    headers: {
      Authorization: 'Basic '+auth,
      Accept: 'application/vnd.yang.data+json',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/vnd.yang.data+json'
    },
    body: body
  };

  // console.log(`Options: ${JSON.stringify(options)}`);

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(`Body: ${body}, response: ${JSON.stringify(response)}`);
    if (response.statusCode < 210) {
      res.send(body);
    } else {
      res.status(response.statusCode).send(body);
    };
    // res.send(body);
  });

});

// POST un-deploy subscription
router.get('/un-deploy/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Un-deploy id: ${req.params.id}`);
  var options = makeOptions(':accessSwitchAndSP/'+req.params.id+'/_operations/un-deploy', 'data', 'POST');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(`Body: ${body}`);
    if (response.statusCode < 210) {
      res.send(body);
    } else {
      res.status(response.statusCode).send(body);
    };
    // res.send(body);
  });
});

// POST re-deploy subscription
router.get('/re-deploy/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Re-deploy id: ${req.params.id}`);
  var options = makeOptions(':accessSwitchAndSP/'+req.params.id+'/_operations/re-deploy', 'data', 'POST');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(`Body: ${body}`);
    if (response.statusCode < 210) {
      res.send(body);
    } else {
      res.status(response.statusCode).send(body);
    };
    // res.send(body);
  });
});

// DELETE subscription
router.delete('/:id', (req, res) => {
  // console.log(`Here we are in the accessswitchandsp router. Delete: ${req.params.id}`);
  var options = makeOptions(':accessSwitchAndSP/'+req.params.id, 'data', 'DELETE');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(`Body: ${body}, response: ${JSON.stringify(response)}`);
    if (response.statusCode < 210) {
      res.send(body);
    } else {
      res.status(response.statusCode).send(body);
    };
    // res.send(body);
  });
});

function makeOptions(pathEnd, collOrData, method) {
  // console.log(`In the function: User: ${process.env.NSO_USER}, Password: ${process.env.NSO_PWD}`);
  var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);

  var options = { method: method,
    url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/running/open-net-access/accessSwitchAndSP'+pathEnd,
    qs: { deep: '' },
    headers: {
      Authorization: 'Basic '+auth,
      Accept: 'application/vnd.yang.'+collOrData+'+json',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/vnd.yang.data+json'
    }
  };
  // console.log(`Options url: ${options.url}`);

  return options;
};

module.exports = router;
