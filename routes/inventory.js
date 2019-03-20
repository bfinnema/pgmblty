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
  var options = makeOptions('/sps/sp','collection');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// GET Access Areas
router.get('/accessareas', (req, res) => {
  // console.log(`Here we are in the inventory router, access areas.`);
  var options = makeOptions('/access_areas/access_area','collection');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// GET PE Areas
router.get('/peareas', (req, res) => {
  // console.log(`Here we are in the inventory router, PE areas.`);
  var options = makeOptions('/pe_areas/pe_area','collection');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// GET POI Areas
router.get('/poiareas', (req, res) => {
  // console.log(`Here we are in the inventory router, POI areas.`);
  var options = makeOptions('/poi_areas/poi_area','collection');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

function makeOptions(pathEnd, collOrData) {
  // console.log(`In the function: User: ${process.env.NSO_USER}, Password: ${process.env.NSO_PWD}`);
  var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);

  var options = { method: 'GET',
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
