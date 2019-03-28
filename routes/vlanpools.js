const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Vlanpool} = require('../models/vlanpool');

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

router.get('/', (req, res) => {
  Vlanpool.find({}).then((vlanpools) => {
    res.json(vlanpools);
  }, (e) => {
    res.status(400).send(e);
  });
});

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

router.get('/specific/:sp_id/:access_area_id/:access_node_id', (req, res) => {
  console.log(`Looking for specific vlanpool. SP: ${req.params.sp_id}, Area: ${req.params.access_area_id}, Node: ${req.params.access_node_id}`);
  
  Vlanpool.findOne({
    sp_id: req.params.sp_id,
    access_area_id: req.params.access_area_id,
    access_node_id: req.params.access_node_id
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
