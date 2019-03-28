const _ = require('lodash');
const express = require('express');
const router = express.Router();
const request = require("request");
const {PythonShell} = require('python-shell');

// GET ipsla icmp operations
router.get('/', (req, res) => {
  console.log(`Here we are in the ipsla icmp router, GET all operations.`);
  var options = makeOptions('', 'collection', 'GET');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(body);
    res.send(body);
  });
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
    // console.log('results: %j', results);
    // console.log(`Python Result: ${results}`);
    res.send(results[0]);
  });

});

// POST check-sync
router.get('/check-sync/:id', (req, res) => {
  // console.log(`Here we are in the subscriptions router. Check-sync for id: ${req.params.id}`);
  var options = makeOptions(':multipleIpslaIcmp/'+req.params.id+'/_operations/check-sync', 'data', 'POST');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(`Body: ${body}`);
    res.send(body);
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
  // console.log(`User: ${process.env.NSO_USER}, Password: ${process.env.NSO_PWD}`);
  var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);
  // console.log(`***************`);

  var options = {
    method: 'POST',
    url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/running',
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
    console.log(`Body: ${body}`);
    res.send(body);
  });

});

// POST un-deploy an ipsla icmp operation
router.get('/un-deploy/:id', (req, res) => {
  console.log(`Here we are in the ipsla icmp router. Un-deploy id: ${req.params.id}`);
  var options = makeOptions(':multipleIpslaIcmp/'+req.params.id+'/_operations/un-deploy', 'data', 'POST');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(`Body: ${body}`);
    res.send(body);
  });
});

// POST re-deploy an ipsla icmp operation
router.get('/re-deploy/:id', (req, res) => {
  console.log(`Here we are in the ipsla icmp router. Re-deploy id: ${req.params.id}`);
  var options = makeOptions(':multipleIpslaIcmp/'+req.params.id+'/_operations/re-deploy', 'data', 'POST');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(`Body: ${body}`);
    res.send(body);
  });
});

// DELETE an ipsla icmp operation
router.delete('/:id', (req, res) => {
  // console.log(`Here we are in the ipsla icmp router. Delete: ${req.params.id}`);
  var options = makeOptions(':multipleIpslaIcmp/'+req.params.id, 'data', 'DELETE');
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(`Body: ${body}`);
    res.send(body);
  });
});

function makeOptions(pathEnd, collOrData, method) {
  // console.log(`In the function: User: ${process.env.NSO_USER}, Password: ${process.env.NSO_PWD}`);
  var auth = new Buffer(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
  // console.log(`Encoded Authentication: ${auth}`);

  var options = {
    method: method,
    url: 'http://'+process.env.NSO_ADDRESS+':'+process.env.NSO_PORT+'/api/running/multipleIpslaIcmp'+pathEnd,
    qs: { deep: '' },
    headers: {
        Authorization: 'Basic '+auth,
        Accept: 'application/vnd.yang.'+collOrData+'+json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/vnd.yang.data+json'
    }
  };
  console.log(`Options url: ${options.url}`);

  return options;
};

module.exports = router;
