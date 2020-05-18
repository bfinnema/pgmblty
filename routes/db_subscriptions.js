const {ObjectID} = require('mongodb');
const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

var {Subscription} = require('../models/subscription');

router.post('/', (req, res) => {
  console.log(`In DB Subscriptions POST: ${req.body.subscription_id}`);
  var body = _.pick(req.body, ['subscription_id', 'subscription_description', 'subscriber_id', 'moved_subscriber', 'services', 'summaryStatus', 'deploymentStatus', 'mvr', 'access', 'tunnel_technology', 'pe', 'poi', 'sp_id', 'service_id', ]);
  var subscription = new Subscription(body);

  subscription.save().then((doc) => {
    res.json(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.put('/:id', (req, res) => {
  console.log(`In router PUT`);
  console.log(`In DB Subscription PUT, id: ${req.body.subscription_id}`);
  // console.log(`In VLAN Pool PUT: ${req.body.vp}`);
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Subscription.findById(id, function(err, subscription){
		if(!subscription){
			return next(new Error('Could not load customer'));
		} else {
			// Update
            subscription.subscription_id= req.body.subscription_id;
            subscription.subscription_description= req.body.subscription_description;
            subscription.access_area_id= req.body.access_area_id;
            subscription.access_node_id= req.body.access_node_id;
            subscription.sp_id= req.body.sp_id;
            subscription.vlans= req.body.vlans;
  
			subscription.save(callback);
		}
	});

});

router.get('/', (req, res) => {
  Subscription.find({}).then((subscriptions) => {
    res.json(subscriptions);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Subscription.findOne({
    _id: id
  }).then((subscription) => {
    if (!subscription) {
      return res.status(404).send();
    }

    res.json(subscription);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.delete('/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Subscription.findOneAndRemove({
    _id: id
  }).then((subscription) => {
    if (!subscription) {
      return res.status(404).send();
    }

    res.json(subscription);
  }).catch((e) => {
    res.status(400).send();
  });
});

router.patch('/:id', (req, res) => {
  // console.log(`In DB Subscriptions PATCH, id: ${req.body.subscription_id}`);
  var id = req.params.id;
  var body = _.pick(req.body, ['services', 'summaryStatus', 'deploymentStatus']);
  // console.log(`Patching DB Subscription, services: ${JSON.stringify(body.services)}`);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Subscription.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((subscription) => {
    if (!subscription) {
      return res.status(404).send();
    }

    res.json(subscription);
  }).catch((e) => {
    res.status(400).send();
  })
});

module.exports = router;
