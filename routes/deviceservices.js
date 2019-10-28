const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const request = require("request");

// GET Devices
router.get('/devices', (req, res) => {
  // console.log(`Here we are in the device services router, GET all devices`);
  var options = makeOptions('/devices', 'data', 'GET');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// GET Device Service Details
router.get('/:device_service/:id', (req, res) => {
  // console.log(`Here we are in the device services router, GET service details for ${req.params.device_service}, ${req.params.id}.`);
  var options = makeOptions('/'+req.params.device_service+'/'+req.params.id, 'data', 'GET');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  })
});

// POST check-sync
router.get('/check-sync/:id', (req, res) => {
  // console.log(`Here we are in the device services router router. Check-sync for id: ${req.params.id}`);
  var options = makeOptions('/'+req.params.id+'/_operations/check-sync', 'data', 'POST');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
    res.send(body);
  })
});

function makeOptions(pathEnd, collOrData, method) {
  // console.log(`In the function: User: ${process.env.NSO_USER}, Password: ${process.env.NSO_PWD}`);
  var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);

  var options = { method: method,
    url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/running'+pathEnd,
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
