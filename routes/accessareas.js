const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Accessarea} = require('../models/accessarea');

router.post('/', (req, res) => {
  var registeree = req.user.name.firstname;
  var game = new Game({
    name: req.body.name,
    description: req.body.description,
    _creator: req.user._id,
    createdBy: registeree
  });

  game.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/', (req, res) => {
  Game.find({}).then((games) => {
    res.json(games);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Game.findOne({
    _id: id
  }).then((game) => {
    if (!game) {
      return res.status(404).send();
    }

    res.send({game});
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Game.findOneAndRemove({
    _id: id
  }).then((game) => {
    if (!game) {
      return res.status(404).send();
    }

    res.json(game);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'description']);
  // console.log(`Patching game, category: ${body.name}, Description: ${body.description}`);

  var registeree = req.user.name.firstname;
  if (req.user.name.middlename) {registeree = registeree + ' ' + req.user.name.middlename};
  registeree = registeree + ' ' + req.user.name.surname
  body.createdBy = registeree;
  body._creator = req.user._id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Game.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((game) => {
    if (!game) {
      return res.status(404).send();
    }

    res.json(game);
  }).catch((e) => {
    res.status(400).send();
  })
});

module.exports = router;
