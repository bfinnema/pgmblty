const _ = require('lodash');
const express = require('express');
const router = express.Router();
const request = require("request");
const mo = require('./nso_restconf');
const opennetPath = "/open-net-access:open-net-access";
const servicePath = "/accessSwitchAndSP:accessSwitchAndSP";

// GET accessSwitchAndSP's
router.get('/', (req, res) => {
// console.log(`Here we are in the accessSwitchAndSP router, GET all accessSwitchAndSP's.`);
  var options = mo.makeOptions(`${opennetPath}${servicePath}`, 'GET');
  
  sendNSORequest(options, res);
});

// GET One Subscription
router.get('/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router, GET one subscription: ${req.params.id}`);
  var options = mo.makeOptions(`${opennetPath}${servicePath}=${req.params.id}`, 'GET');
  
  sendNSORequest(options, res);
});

// POST check-sync
router.get('/check-sync/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Check-sync for id: ${req.params.id}`);
  var options = mo.makeOptions(`${opennetPath}${servicePath}=${req.params.id}/check-sync`, 'POST');
  
  sendNSORequest(options, res);
});

// POST new accessSwitchAndSP Service
router.post('/', (req, res) => {
  console.log(`Here we are in the accessswitchandsp router. POST service`);
  console.log(`req.body, name: ${req.body.name}`);
  var object_body = {
    "accessSwitchAndSP:accessSwitchAndSP": req.body
  };
  // console.log(`Object body: ${JSON.stringify(object_body)}`);
  var body = JSON.stringify(object_body);
  console.log(`POST new accessSwitchAndSP Service, body: ${body}`);
  
  var options = mo.makeOptions(`${opennetPath}`, 'POST', body);
  // console.log(`Options: ${JSON.stringify(options)}`);

  sendNSORequest(options, res);
});

// POST un-deploy accessSwitchAndSP instance
router.get('/un-deploy/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Un-deploy id: ${req.params.id}`);
  var options = mo.makeOptions(`${opennetPath}${servicePath}=${req.params.id}/un-deploy`, 'POST');
  
  sendNSORequest(options, res);
});

// POST re-deploy accessSwitchAndSP instance
router.get('/re-deploy/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Re-deploy id: ${req.params.id}`);
  var options = mo.makeOptions(`${opennetPath}${servicePath}=${req.params.id}/re-deploy`, 'POST');
  
  sendNSORequest(options, res);
});

// DELETE subscription
router.delete('/:id', (req, res) => {
  // console.log(`Here we are in the accessswitchandsp router. Delete: ${req.params.id}`);
  var options = mo.makeOptions(`${opennetPath}${servicePath}=${req.params.id}`, 'DELETE');
  
  sendNSORequest(options, res);
});

function sendNSORequest(options, res) {

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(`Body: ${body}, response: ${JSON.stringify(response)}`);
    if (response.statusCode < 210) {
      res.send(body);
    } else {
      res.status(response.statusCode).send(body);
    };
  });
};

module.exports = router;
