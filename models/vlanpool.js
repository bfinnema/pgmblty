const mongoose = require('mongoose');

var VlanpoolSchema = new mongoose.Schema({
    vlanpool_id: {
        type: String,
        required: true
    },
    vlanpool_description: {
        type: String
    },
    tunnel_technology: {
        type: String
    },
    vlans: [
        {
            vlan_id: {type: Number},
            status: {type: String},
            timestamp: {type: Date},
            subscriber_id: {type: String},
            subscription_id: {type: String}
        }
    ],
    access_area_id: {
        type: String
    },
    access_node_id: {
        type: String
    },
    sp_id: {
        type: String
    }
});

var Vlanpool = mongoose.model('Vlanpool', VlanpoolSchema);

module.exports = {Vlanpool};
