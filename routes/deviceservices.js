const _ = require('lodash');
const express = require('express');
const router = express.Router();
const request = require("request");
const mo = require('./nso_restconf');

// GET Devices
router.get('/devices', (req, res) => {
  console.log(`Here we are in the device services router, GET all devices`);
  var options = mo.makeOptions('/tailf-ncs:devices?depth=2', 'GET');
  sendNSORequest(options, res);
});

// GET Device Service Details (typically device_service is newSubAccess, newSubPE or newSubPOI)
router.get('/:device_service/:id', (req, res) => {
  // console.log(`Here we are in the device services router, GET service details for ${req.params.device_service}, ${req.params.id}.`);
  var options = mo.makeOptions(`/${req.params.device_service}:${req.params.device_service}=${req.params.id}`, 'GET');
  sendNSORequest(options, res);
});

// POST check-sync
router.get('/check-sync/:id', (req, res) => {
  // console.log(`Here we are in the device services router router. Check-sync for id: ${req.params.id}`);
  var options = mo.makeOptions(`/${req.params.device_service}:${req.params.device_service}=${req.params.id}/check-sync`, 'POST');
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
