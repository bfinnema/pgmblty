const _ = require('lodash');
const express = require('express');
const router = express.Router();
const request = require("request");
const mo = require('./nso_restconf');
const servicePath = "/open-net-access:open-net-access/inventory";

// GET complete inventory
router.get('/', (req, res) => {
  console.log(`Here we are in the inventory router.`);
  var options = mo.makeOptions(servicePath, 'GET');
  sendNSORequest(options, res);
});

// GET Service Providers
router.get('/sps', (req, res) => {
  console.log(`Here we are in the inventory router, sps.`);
  var options = mo.makeOptions(`${servicePath}/sps/sp`, 'GET');
  sendNSORequest(options, res);
});

// GET Access Areas
router.get('/accessareas', (req, res) => {
  // console.log(`Here we are in the inventory router, access areas.`);
  var options = mo.makeOptions(`${servicePath}/access_areas/access_area`, 'GET');
  sendNSORequest(options, res);
});

// GET PE Areas
router.get('/peareas', (req, res) => {
  // console.log(`Here we are in the inventory router, PE areas.`);
  var options = mo.makeOptions(`${servicePath}/pe_areas/pe_area`, 'GET');
  sendNSORequest(options, res);
});

// GET POI Areas
router.get('/poiareas', (req, res) => {
  // console.log(`Here we are in the inventory router, POI areas.`);
  var options = mo.makeOptions(`${servicePath}/poi_areas/poi_area`, 'GET');
  sendNSORequest(options, res);
});

// POST POI Area
router.post('/poiareas', (req, res) => {
  // console.log(`Here we are in the inventory-poiarea router. POST POI Area`);
  // console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  // console.log(`poi_area_id: ${req.body.poi_areas.poi_area[0].poi_area_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var body = JSON.stringify(object_body);
  
  var options = mo.makeOptions(servicePath, 'PATCH', body);
  sendNSORequest(options, res);
});

// DELETE POI Area
router.delete('/poiareas/:id', (req, res) => {
  // console.log(`Here we are in the Inventory POI Area router. Delete: ${req.params.id}`);
  var pathEnd = `${servicePath}/poi_areas/poi_area=${req.params.id}`;
  var options = mo.makeOptions(pathEnd, 'DELETE');
  sendNSORequest(options, res);
});

// POST PE Area
router.post('/peareas', (req, res) => {
  console.log(`Here we are in the inventory-pearea router. POST PE Area`);
  console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  console.log(`pe_area_id: ${req.body.pe_areas.pe_area[0].pe_area_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var body = JSON.stringify(object_body);
  
  var options = mo.makeOptions(servicePath, 'PATCH', body);
  // console.log(`Options: ${JSON.stringify(options)}`);
  sendNSORequest(options, res);
});

// DELETE PE Area
router.delete('/peareas/:id', (req, res) => {
  // console.log(`Here we are in the Inventory PE Area router. Delete: ${req.params.id}`);
  var pathEnd = `${servicePath}/pe_areas/pe_area=${req.params.id}`;
  var options = mo.makeOptions(pathEnd, 'DELETE');
  sendNSORequest(options, res);
});

// POST Service Provider
router.post('/sps', (req, res) => {
  console.log(`Here we are in the service provider router. POST SP`);
  console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  console.log(`sp_id: ${req.body.sps.sp[0].sp_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var body = JSON.stringify(object_body);
  
  var options = mo.makeOptions(servicePath, 'PATCH', body);
  sendNSORequest(options, res);
});

// DELETE Service Provider
router.delete('/sps/:id', (req, res) => {
  console.log(`Here we are in the Inventory PE Area router. Delete: ${req.params.id}`);
  var pathEnd = `${servicePath}/sps/sp=${req.params.id}`;
  var options = mo.makeOptions(pathEnd, 'DELETE');
  sendNSORequest(options, res);
});

// POST Add Service to SP
router.post('/sps/addservice', (req, res) => {
  // console.log(`Here we are in the service provider router. POST SP Service`);
  // console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  // console.log(`sp_id: ${req.body.sps.sp[0].sp_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var body = JSON.stringify(object_body);
  
  var options = mo.makeOptions(servicePath, 'PATCH', body);
  sendNSORequest(options, res);
});

// DELETE Service
router.delete('/sps/deleteservice/:sp_id/:service_id', (req, res) => {
  // console.log(`Here we are in the Inventory PE Area router. Delete: ${req.params.sp_id}, ${req.params.service_id}`);
  var pathEnd = `${servicePath}/sps/sp=${req.params.sp_id}/services/service=${req.params.service_id}`;
  var options = mo.makeOptions(pathEnd, 'DELETE');
  sendNSORequest(options, res);
});

// *************************************************

// POST Access Area
router.post('/accessareas', (req, res) => {
  // console.log(`Here we are in the access area router. POST access area`);
  // console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  // console.log(`access_area_id: ${req.body.access_areas.access_area[0].access_area_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var body = JSON.stringify(object_body);
  
  var options = mo.makeOptions(servicePath, 'PATCH', body);
  sendNSORequest(options, res);
});

// DELETE Access Area
router.delete('/accessareas/:id', (req, res) => {
  // console.log(`Here we are in the Inventory PE Area router. Delete: ${req.params.id}`);
  var pathEnd = `${servicePath}/access_areas/access_area=${req.params.id}`;
  var options = mo.makeOptions(pathEnd, 'DELETE');
  sendNSORequest(options, res);
});

// POST Add Node to Access Area
router.post('/accessareas/addnode', (req, res) => {
  // console.log(`Here we are in the Access Area router. POST Access Area Node`);
  // console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  // console.log(`access_area_id: ${req.body.access_areas.access_area[0].access_area_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var body = JSON.stringify(object_body);
  
  var options = mo.makeOptions(servicePath, 'PATCH', body);
  sendNSORequest(options, res);
});

// DELETE Node in Access Area
router.delete('/accessareas/deletenode/:access_area_id/:access_node_id', (req, res) => {
  // console.log(`Here we are in the Inventory Access Area router. Delete node: ${req.params.access_node_id}, Area: ${req.params.access_area_id}`);
  var pathEnd = `${servicePath}/access_areas/access_area=${req.params.access_area_id}/nodes/node=${req.params.access_node_id}`;
  var options = mo.makeOptions(pathEnd, 'DELETE');
  sendNSORequest(options, res);
});

// ***************************************

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
