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
    moved_subscriber: {
        moved: {type: Boolean},
        original_subscription_id: {type: String},
        original_vlanpool: {type: String},
        original_pw_pool: {type: String}
    },
    services: [
        {
            inner_vlan_id: {type: Number},
            access_vlan_id: {type: Number},
            pe_vlan_id: {type: Number},
            poi_vlan_id: {type: Number},
            cpe_ipaddress: {
                octet1: {
                    type: Number
                },
                octet2: {
                    type: Number
                },
                octet3: {
                    type: Number
                },
                octet4: {
                    type: Number
                }
            },
            statistics: [
                {
                    status: {type: Number},
                    timestamp: {type: Date},
                    RTT: {type: Number}
                }
            ]
        }
    ],
    summaryStatus: [
        {
            status: {type: Number},
            timestamp: {type: Date}
        }
    ],
    deploymentStatus: {
        type: Boolean
    },
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
        access_if: {
            type: String
        }
    },
    tunnel_technology: {
        type: String
    },
    pe: {
        pe_area_id: {
            type: String
        },
        pe_area_description: {
            type: String
        },
        node: {
            pe_node_id: {
                type: String
            },
            pe_if: {
                type: String
            },
            pe_sub_if: {
                type: String
            },
            pe_pwhe_ipaddress: {
                type: String
            },
            evpn_vpws: {
                evi: {
                    type: Number
                },
                target: {
                    type: Number
                },
                source: {
                    type: Number
                }
            }
        }
    },
    poi: {
        poi_area_id: {
            type: String
        },
        poi_area_description: {
            type: String
        },
        node: {
            poi_node_id: {
                type: String
            },
            to_pe_if: {
                type: String
            },
            to_sp_if: {
                type: String
            },
            poi_if: {
                type: String
            },
            poi_pwhe_ipaddress: {
                type: String
            },
            pw_sub_if: {
                type: String
            },
            evpn_vpws: {
                evi: {
                    type: Number
                },
                target: {
                    type: Number
                },
                source: {
                    type: Number
                }
            }
        }
    },
    cpe: {
        cpe_name: {
            type: String
        },
        cpe_id: {
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
