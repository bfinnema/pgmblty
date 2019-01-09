const mongoose = require('mongoose');

var PwsubinterfaceSchema = new mongoose.Schema({
    Pwsubinterface_id: {
        type: String,
        required: true
    },
    pwsubinterface_description: {
        type: String
    },
    pseudowire_id: {
        type: Number,
        required: true
    },
    subinterface_id: {
        type: Number
    },
    subscriber_id: {
        type: String
    },
    subscription_id: {
        type: String
    },
    sp_id: {
        type: String
    }
});

var Pwsubinterface = mongoose.model('Pwsubinterface', PwsubinterfaceSchema);

module.exports = {Pwsubinterface};
