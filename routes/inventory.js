const _ = require('lodash');
const express = require('express');
const router = express.Router();
const request = require("request");

// GET complete inventory
router.get('/', (req, res) => {
  // console.log(`Here we are in the inventory router.`);
  var options = makeOptions('','data', 'GET', 'running');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// GET Service Providers
router.get('/sps', (req, res) => {
  // console.log(`Here we are in the inventory router, sps.`);
  var options = makeOptions('/sps/sp','collection', 'GET', 'running');
  sendNSORequest(options, res);
  
  /* request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  }) */
});

// GET Access Areas
router.get('/accessareas', (req, res) => {
  // console.log(`Here we are in the inventory router, access areas.`);
  var options = makeOptions('/access_areas/access_area','collection', 'GET', 'running');
  sendNSORequest(options, res);
});

// GET PE Areas
router.get('/peareas', (req, res) => {
  // console.log(`Here we are in the inventory router, PE areas.`);
  var options = makeOptions('/pe_areas/pe_area','collection', 'GET', 'running');
  sendNSORequest(options, res);
});

// GET POI Areas
router.get('/poiareas', (req, res) => {
  console.log(`Here we are in the inventory router, POI areas.`);
  var options = makeOptions('/poi_areas/poi_area','collection', 'GET', 'running');
  sendNSORequest(options, res);
});

// POST POI Area
router.post('/poiareas', (req, res) => {
  console.log(`Here we are in the inventory-poiarea router. POST POI Area`);
  console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  console.log(`poi_area_id: ${req.body.poi_areas.poi_area[0].poi_area_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var body = JSON.stringify(object_body);
  
  var options = makeOptions('', 'data', 'PATCH', 'config', body);
  sendNSORequest(options, res);

});

// DELETE POI Area
router.delete('/poiareas/:id', (req, res) => {
  // console.log(`Here we are in the Inventory POI Area router. Delete: ${req.params.id}`);
  var pathEnd = '/poi_areas/poi_area/'+req.params.id;
  var options = makeOptions(pathEnd, 'data', 'DELETE', 'running');
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
  
  var options = makeOptions('', 'data', 'PATCH', 'config', body);
  // console.log(`Options: ${JSON.stringify(options)}`);
  sendNSORequest(options, res);

});

// DELETE PE Area
router.delete('/peareas/:id', (req, res) => {
  // console.log(`Here we are in the Inventory PE Area router. Delete: ${req.params.id}`);
  var pathEnd = '/pe_areas/pe_area/'+req.params.id;
  var options = makeOptions(pathEnd, 'data', 'DELETE', 'running');
  sendNSORequest(options, res);

});

// POST Service Provider
router.post('/sps', (req, res) => {
  // console.log(`Here we are in the service provider router. POST SP`);
  // console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  // console.log(`sp_id: ${req.body.sps.sp[0].sp_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var body = JSON.stringify(object_body);
  
  var options = makeOptions('', 'data', 'PATCH', 'config', body);
  sendNSORequest(options, res);

});

// DELETE Service Provider
router.delete('/sps/:id', (req, res) => {
  // console.log(`Here we are in the Inventory PE Area router. Delete: ${req.params.id}`);
  var pathEnd = '/sps/sp/'+req.params.id;
  var options = makeOptions(pathEnd, 'data', 'DELETE', 'running');
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
  
  // var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);

  var options = makeOptions('', 'data', 'PATCH', 'config', body);
  sendNSORequest(options, res);

});

// DELETE Service
router.delete('/sps/deleteservice/:sp_id/:service_id', (req, res) => {
  // console.log(`Here we are in the Inventory PE Area router. Delete: ${req.params.sp_id}, ${req.params.service_id}`);
  var pathEnd = '/sps/sp/'+req.params.sp_id+'/services/service/'+req.params.service_id;
  var options = makeOptions(pathEnd, 'data', 'DELETE', 'running');
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
  
  var options = makeOptions('', 'data', 'PATCH', 'config', body);
  sendNSORequest(options, res);

});

// DELETE Access Area
router.delete('/accessareas/:id', (req, res) => {
  // console.log(`Here we are in the Inventory PE Area router. Delete: ${req.params.id}`);
  var pathEnd = '/access_areas/access_area/'+req.params.id;
  var options = makeOptions(pathEnd, 'data', 'DELETE', 'running');
  sendNSORequest(options, res);
  
});

// POST Add Node to Access Area
router.post('/accessareas/addnode', (req, res) => {
  console.log(`Here we are in the Access Area router. POST Access Area Node`);
  console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  console.log(`access_area_id: ${req.body.access_areas.access_area[0].access_area_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var body = JSON.stringify(object_body);
  
  var options = makeOptions('', 'data', 'PATCH', 'config', body);
  sendNSORequest(options, res);

});

// DELETE Node in Access Area
router.delete('/accessareas/deletenode/:access_area_id/:access_node_id', (req, res) => {
  console.log(`Here we are in the Inventory Access Area router. Delete node: ${req.params.access_node_id}, Area: ${req.params.access_area_id}`);
  var pathEnd = '/access_areas/access_area/'+req.params.access_area_id+'/nodes/node/'+req.params.access_node_id;
  var options = makeOptions(pathEnd, 'data', 'DELETE', 'running');
  sendNSORequest(options, res);

});

// ***************************************

function makeOptions(pathEnd, collOrData, method, configOrRunning, body) {
  // console.log(`In the function: User: ${process.env.NSO_USER}, Password: ${process.env.NSO_PWD}`);
  var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);

  if (configOrRunning == "running") {
    var options = {
      method: method,
      url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/'+configOrRunning+'/open-net-access/inventory'+pathEnd,
      qs: { deep: '' },
      headers: {
          Authorization: 'Basic '+auth,
          Accept: 'application/vnd.yang.'+collOrData+'+json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/vnd.yang.data+json'
      }
    };
  } else if (configOrRunning == "config") {
    // console.log(`Body in makeOptions: ${body}`);
    var options = {
      method: method,
      url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/'+configOrRunning+'/open-net-access/inventory',
      headers: {
        Authorization: 'Basic '+auth,
        Accept: 'application/vnd.yang.'+collOrData+'+json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/vnd.yang.data+json'
      },
      body: body
    };
  };

  return options;
};

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
