const _ = require('lodash');
const express = require('express');
const router = express.Router();
const request = require("request");
const mo = require('./nso_restconf');
const servicePath = "/acmeZtpService:acmeZtpService";
var fullPath = `${servicePath}`;

// GET Subscriptions
router.get('/', (req, res) => {
  // console.log(`Here we are in the subscriptions router, GET all subscriptions.`);
  var options = mo.makeOptions(fullPath, 'GET');
  sendNSORequest(options, res);
});

// GET One Subscription
router.get('/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router, GET one subscription: ${req.params.id}`);
  var options = mo.makeOptions(`${fullPath}=${req.params.id}`, 'GET');
  sendNSORequest(options, res);
});

// POST check-sync
router.get('/check-sync/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Check-sync for id: ${req.params.id}`);
  var options = mo.makeOptions(`${fullPath}=${req.params.id}/check-sync`, 'POST');
  sendNSORequest(options, res);
});

// POST subscription
router.post('/', (req, res) => {
  console.log(`Here we are in the business services router. POST service. Stage: ${req.body.stage}`);
  if (req.body.stage == "INITIAL") {
    var picked_body = _.pick(req.body, ['name', 'subscriber_id', 'tunnel_technology', 'moved_subscriber', 'cpe_name', 'sp_id', 'service_id', 'access_area_id', 'access_node_id', 'access_if', 'pe_area_id', 'poi_area_id', 'evpn_vpws', 'vlan_mappings', 'original_access']);
  } else {
    var picked_body = _.pick(req.body, ['name', 'subscriber_id', 'moved_subscriber', 'cpe_name', 'sp_id', 'service_id', 'access_area_id', 'access_node_id', 'access_if', 'pe_area_id', 'poi_area_id', 'pwsubinterface_id', 'vlan_mappings', 'original_access']);
  }
  console.log(`req.body, serialnumber: ${req.body.serialnumber}, pick body, name: ${picked_body.serialnumber}`);
  console.log(`Picked body: ${JSON.stringify(picked_body)}`);
  var object_body = {
    "acmeZtpService:acmeZtpService": picked_body
  };
  // console.log(`Object body: ${JSON.stringify(object_body)}`);
  var sub_body = JSON.stringify(object_body);
  // console.log(`body: ${sub_body}`);
  
  var options = mo.makeOptions("", 'POST', sub_body);
  // console.log(`Options: ${JSON.stringify(options)}`);

  sendNSORequest(options, res);
});

// POST un-deploy subscription
router.get('/un-deploy/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Un-deploy id: ${req.params.id}`);
  var options = mo.makeOptions(`${fullPath}=${req.params.id}/un-deploy`, 'POST');
  sendNSORequest(options, res);
});

// POST re-deploy subscription
router.get('/re-deploy/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Re-deploy id: ${req.params.id}`);
  var options = mo.makeOptions(`${fullPath}=${req.params.id}/re-deploy`, 'POST');
  sendNSORequest(options, res);
});

// DELETE subscription
router.delete('/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Delete: ${req.params.id}`);
  var options = mo.makeOptions(`${fullPath}=${req.params.id}`, 'DELETE');
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
