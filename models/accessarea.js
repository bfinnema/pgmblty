const mongoose = require('mongoose');

var AccessareaSchema = new mongoose.Schema({
    access_area_id: {
        type: String,
        required: true
    },
    access_area_description: {
        type: String
    },
    nodes: [
        {
            access_node_id: {type: String},
            access_node_description: {type: String},
            pseudowire_id: {type: String},
            linecards: [
                {
                    linecard_id: {type: String},
                    ports: [
                        {
                            port_id: {type: String},
                            status: {type: String},
                            timestamp: {type: Date},
                            subscriber_id: {type: String},
                            subscriptions: [
                                {
                                    subscription_id: {type: String},
                                    sp_id:  {type: String}
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

var Accessarea = mongoose.model('Accessarea', AccessareaSchema);

module.exports = {Accessarea};
