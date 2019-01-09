const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Pseudowire} = require('../models/pseudowire');

router.post('/', (req, res) => {
  // console.log(`In Pseudowire POST: ${req.body.pseudowire_id}`);
  var pseudowire = new Pseudowire({
    pseudowire_id: req.body.pseudowire_id,
    pseudowire_description: req.body.pseudowire_description,
    pe_node_id: req.body.pe_node_id,
    access_node_id: req.body.access_node_id,
    poi_node_id: req.body.poi_node_id,
    sp_id: req.body.sp_id,
    subinterfaces: req.body.subinterfaces
  });

  pseudowire.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/', (req, res) => {
  Pseudowire.find({}).then((pseudowires) => {
    res.json(pseudowires);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Pseudowire.findOne({
    _id: id
  }).then((pseudowire) => {
    if (!pseudowire) {
      return res.status(404).send();
    }

    res.json(pseudowire);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Pseudowire.findOneAndRemove({
    _id: id
  }).then((pseudowire) => {
    if (!pseudowire) {
      return res.status(404).send();
    }

    res.json(pseudowire);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', (req, res) => {
  console.log(`In PW Set PATCH, id: ${req.body.pseudowire_id}`);
  var id = req.params.id;
  var body = _.pick(req.body, ['subinterfaces']);
  console.log(`Patching PW Set, pw Sub interface id's: ${JSON.stringify(body.subinterfaces)}`);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Pseudowire.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((pseudowire) => {
    if (!pseudowire) {
      return res.status(404).send();
    }

    res.json(pseudowire);
  }).catch((e) => {
    res.status(400).send();
  })
});

module.exports = router;
