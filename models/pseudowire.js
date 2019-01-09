const mongoose = require('mongoose');

var PseudowireSchema = new mongoose.Schema({
    pseudowire_id: {
        type: String,
        required: true
    },
    pseudowire_description: {
        type: String
    },
    pe_node_id: {
        type: String
    },
    access_node_id: {
        type: String
    },
    poi_node_id: {
        type: String
    },
    sp_id: {
        type: String
    },
    subinterfaces: [
        {
            subinterface_id: {type: Number},
            status: {type: String},
            timestamp: {type: Date},
            subscriber_id: {type: String},
            subscription_id: {type: String}
        }
    ]
});

var Pseudowire = mongoose.model('Pseudowire', PseudowireSchema);

module.exports = {Pseudowire};
