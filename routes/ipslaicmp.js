const _ = require('lodash');
const express = require('express');
const router = express.Router();
const request = require("request");
const {PythonShell} = require('python-shell');
const mo = require('./nso_restconf');
const servicePath = "/multipleIpslaIcmp:multipleIpslaIcmp";

// GET ipsla icmp operations
router.get('/', (req, res) => {
  console.log(`Here we are in the ipsla icmp router, GET all operations.`);
  var options = mo.makeOptions(servicePath, 'GET');
  
  sendNSORequest(options, res);
});

// GET ipsla icmp statistics, one vlan
router.post('/statistics/:subscription_id', (req, res) => {
  // console.log(`Here we are in the ipsla icmp router, POST for stats.`);
  var vlan = req.body.the_vlan;
  // console.log(`Subscription ID: ${req.params.subscription_id}, VLAN: ${vlan},    from req: ${req.body.the_vlan}`);
  let python_options = {
    mode: 'text',
    pythonPath: process.env.PYTHON_PATH,
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: process.env.PYTHON_SCRIPT_PATH,
    args: [vlan]
  };
  // console.log(`options: ${JSON.stringify(python_options)}`);
  PythonShell.run('netconf-view-data.py', python_options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    // console.log(`Python Result: ${results}`);
    res.send(results[0]);
  });

});

// POST an ipsla icmp operation
router.post('/', (req, res) => {
  // console.log(`Here we are in the ipsla icmp router. POST operation`);
  var picked_body = _.pick(req.body, ['subscription_id', 'device', 'cpe_id', 'vlan']);
  // console.log(`req.body, subscription_id: ${req.body.subscription_id}, pick body, subscription_id: ${picked_body.subscription_id}`);
  // console.log(`Picked body: ${JSON.stringify(picked_body)}`);
  // console.log(`***************`);
  var object_body = {
    "multipleIpslaIcmp:multipleIpslaIcmp": picked_body
  };
  // console.log(`Object body: ${JSON.stringify(object_body)}`);
  // console.log(`***************`);
  var body = JSON.stringify(object_body);
  // console.log(`body: ${body}`);
  // console.log(`***************`);

  var options = mo.makeOptions('', 'POST', body);
  // console.log(`Options in router: ${JSON.stringify(options)}`);

  sendNSORequest(options, res);
});

// DELETE an ipsla icmp operation
router.delete('/:id', (req, res) => {
  // console.log(`Here we are in the ipsla icmp router. Delete: ${req.params.id}`);
  var options = mo.makeOptions(`${servicePath}=${req.params.id}`, 'DELETE');
  // console.log(`Options url: ${options.url}`);
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
