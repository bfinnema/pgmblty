const _ = require('lodash');
const express = require('express');
const router = express.Router();
const request = require("request");

// GET complete inventory
router.get('/', (req, res) => {
  // console.log(`Here we are in the inventory router.`);
  var options = makeOptions('','data');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// GET Service Providers
router.get('/sps', (req, res) => {
  // console.log(`Here we are in the inventory router, sps.`);
  var options = makeOptions('/sps/sp','collection', 'GET');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// GET Access Areas
router.get('/accessareas', (req, res) => {
  // console.log(`Here we are in the inventory router, access areas.`);
  var options = makeOptions('/access_areas/access_area','collection', 'GET');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// GET PE Areas
router.get('/peareas', (req, res) => {
  // console.log(`Here we are in the inventory router, PE areas.`);
  var options = makeOptions('/pe_areas/pe_area','collection', 'GET');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// GET POI Areas
router.get('/poiareas', (req, res) => {
  // console.log(`Here we are in the inventory router, POI areas.`);
  var options = makeOptions('/poi_areas/poi_area','collection', 'GET');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// POST POI Area
router.post('/poiareas', (req, res) => {
  // console.log(`Here we are in the inventory-poiarea router. POST POI Area`);
  // console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  // console.log(`poi_area_id: ${req.body.poi_areas.poi_area[0].poi_area_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var poi_body = JSON.stringify(object_body);
  
  var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);

  var options = {
    method: 'PATCH',
    url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/config/open-net-access/inventory',
    headers: {
      Authorization: 'Basic '+auth,
      Accept: 'application/vnd.yang.data+json',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/vnd.yang.data+json'
    },
    body: poi_body
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

// DELETE POI Area
router.delete('/poiareas/:id', (req, res) => {
  // console.log(`Here we are in the Inventory POI Area router. Delete: ${req.params.id}`);
  var options = makeOptions('/poi_areas/poi_area/'+req.params.id, 'data', 'DELETE');
  
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

// POST PE Area
router.post('/peareas', (req, res) => {
  // console.log(`Here we are in the inventory-pearea router. POST PE Area`);
  // console.log(`Stringified body: ${JSON.stringify(req.body)}`);
  // console.log(`pe_area_id: ${req.body.pe_areas.pe_area[0].pe_area_id}`);
  
  var object_body = {
    "open-net-access:inventory": req.body
  };
  var poi_body = JSON.stringify(object_body);
  
  var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);

  var options = {
    method: 'PATCH',
    url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/config/open-net-access/inventory',
    headers: {
      Authorization: 'Basic '+auth,
      Accept: 'application/vnd.yang.data+json',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/vnd.yang.data+json'
    },
    body: poi_body
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

// DELETE PE Area
router.delete('/peareas/:id', (req, res) => {
  // console.log(`Here we are in the Inventory PE Area router. Delete: ${req.params.id}`);
  var options = makeOptions('/pe_areas/pe_area/'+req.params.id, 'data', 'DELETE');
  
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
    url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/running/open-net-access/inventory'+pathEnd,
    qs: { deep: '' },
    headers: {
        Authorization: 'Basic '+auth,
        Accept: 'application/vnd.yang.'+collOrData+'+json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/vnd.yang.data+json'
    }
  };

  return options;
};

module.exports = router;
