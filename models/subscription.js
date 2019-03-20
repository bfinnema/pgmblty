const mongoose = require('mongoose');

var SubscriptionSchema = new mongoose.Schema({
    subscription_id: {
        type: String,
        required: true
    },
    subscription_description: {
        type: String
    },
    subscriber_id: {
        type: Number,
        required: true
    },
    services: [
        {
            inner_vlan_id: {type: Number},
            access_vlan_id: {type: Number},
            pe_vlan_id: {type: Number},
            poi_vlan_id: {type: Number},
            status: {type: Number},
            timestamp: {type: Date},
            RTT: {type: Number}
        }
    ],
    mvr: {
        mvr_vlan: {
            type: Number
        },
        mvr_receiver_vlan: {
            type: Number
        }
    },
    access: {
        access_area_id: {
            type: String
        },
        access_node_id: {
            type: String
        },
        access_interface: {
            type: String
        }
    },
    pe: {
        pe_area_id: {
            type: String
        },
        pe_node_id: {
            type: String
        },
        pe_interface: {
            type: String
        }
    },
    poi: {
        poi_area_id: {
            type: String
        },
        poi_node_id: {
            type: String
        },
        poi_interface: {
            type: String
        }
    },
    sp_id: {
        type: String
    },
    service_id: {
        type: String
    }
});

var Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = {Subscription};
