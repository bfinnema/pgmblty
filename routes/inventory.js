const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const http = require("http");
const request = require("request");

router.post('/', (req, res) => {
  // console.log(`In VLAN Pool POST: ${req.body.vlanpool_id}`);
  var vlanpool = new Vlanpool({
    vlanpool_id: req.body.vlanpool_id,
    vlanpool_description: req.body.vlanpool_description,
    access_area_id: req.body.access_area_id,
    access_node_id: req.body.access_node_id,
    sp_id: req.body.sp_id,
    vlans: req.body.vlans
  });

  vlanpool.save().then((doc) => {
    res.json(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.put('/:id', (req, res) => {
  console.log(`In router PUT`);
  console.log(`In VLAN Pool PUT, id: ${req.body.vlanpool_id}`);
  // console.log(`In VLAN Pool PUT: ${req.body.vp}`);
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Vlanpool.findById(id, function(err, vlanpool){
		if(!vlanpool){
			return next(new Error('Could not load customer'));
		} else {
			// Update
      vlanpool.vlanpool_id= req.body.vlanpool_id;
      vlanpool.vlanpool_description= req.body.vlanpool_description;
      vlanpool.access_area_id= req.body.access_area_id;
      vlanpool.access_node_id= req.body.access_node_id;
      vlanpool.sp_id= req.body.sp_id;
      vlanpool.vlans= req.body.vlans;
  
			vlanpool.save(callback);
		}
	});
});

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

router.get('/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Vlanpool.findOne({
    _id: id
  }).then((vlanpool) => {
    if (!vlanpool) {
      return res.status(404).send();
    }

    res.json(vlanpool);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Vlanpool.findOneAndRemove({
    _id: id
  }).then((vlanpool) => {
    if (!vlanpool) {
      return res.status(404).send();
    }

    res.json(vlanpool);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', (req, res) => {
  // console.log(`In router PATCH`);
  // console.log(`In VLAN Pool PATCH, id: ${req.body.vlanpool_id}`);
  var id = req.params.id;
  var body = _.pick(req.body, ['vlans']);
  // console.log(`Patching VLAN Pool, vlans: ${JSON.stringify(body.vlans)}`);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Vlanpool.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((vlanpool) => {
    if (!vlanpool) {
      return res.status(404).send();
    }

    res.json(vlanpool);
  }).catch((e) => {
    res.status(400).send();
  })
});

module.exports = router;
