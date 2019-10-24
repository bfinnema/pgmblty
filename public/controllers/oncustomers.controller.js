angular.module('pgmblty')

.controller('oncustomersCtrl', ['$scope', '$http', '$window', '$route', '$location', '$q', 
function($scope, $http, $window, $route, $location, $q) {
    // console.log(`You are in OpenNET Subscription Splash Screen.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    $scope.showAccessNodes = false;
    $scope.showAccessInterface = false;
    $scope.spinnerStatus = false;
    $scope.spinnerStatusDelete = false;
    $scope.errorMessage = false;
    $scope.cpe_id = 0;
    
    $http({
        method: "GET",
        url: "/inventory"
    }).then(function(inventory) {
        $scope.inventory = JSON.parse(JSON.stringify(inventory.data).replace("open-net-access:inventory", "inventory")).inventory;
        // console.log(`INVENTORY: ${JSON.stringify($scope.inventory)}`);
        // console.log(`SP: ${JSON.stringify($scope.inventory.sps.sp[0].sp_id)}`);
        return $http({
            method: "GET",
            url: "/vlanpools"
        });
    }).then(function(response) {
        $scope.vlanpools = response.data;
        // console.log(`VLAN Pools: ${JSON.stringify($scope.vlanpools)}`);
        // console.log(`VLAN Pools Status: ${response.status}`);
        return $http({
            method: "GET",
            url: "/pseudowires"
        });
    }).then(function(response) {
        // console.log(`PW Sets Status: ${response.status}`);
        $scope.pseudowires = response.data;
        // console.log(`PW Sets: ${JSON.stringify($scope.pseudowires)}`);
        return $http({
            method: "GET",
            url: "/db_subscriptions"
        });
    }).then(function(response) {
        // console.log(`DB Subscriptions Status: ${response.status}`);
        $scope.db_subscriptions = response.data;
        // console.log(`DB Subscriptions: ${JSON.stringify($scope.db_subscriptions)}`);
        return $http({
            method: "GET",
            url: "/subscriptions"
        });
    }).then(function(collection) {
        // console.log(`Collection: ${JSON.stringify(collection.data)}`);
        if (collection.data) {
            // console.log(`There are some subscriptions.`);
            $scope.subscriptions = JSON.parse(JSON.stringify(collection.data).replace("open-net-core:open-net-core", "openNetCore")).collection.openNetCore;
        } else {
            console.log(`There are no subscriptions.`);
            $scope.subscriptions = [];
        };
        
        $scope.showSubDetails = [];
        $scope.showIpslaSpinner = [];
        for (var i=0; i<$scope.subscriptions.length; i++) {
            // console.log(`Counter i: ${i}`);
            $scope.subscriptions[i].db_subscription = matchDBSubs($scope.subscriptions[i].name);
            $scope.subscriptions[i].index = i;
            var services_status =[];
            var showSpinner = [];
            for (var j=0; j<$scope.subscriptions[i].db_subscription.services.length; j++) {
                var st = $scope.subscriptions[i].db_subscription.services[j].statistics[$scope.subscriptions[i].db_subscription.services[j].statistics.length-1].status;
                var service_status = {
                    'index': j,
                    'inner_vlan_id': $scope.subscriptions[i].db_subscription.services[j].inner_vlan_id,
                    'access_vlan_id': $scope.subscriptions[i].db_subscription.services[j].access_vlan_id,
                    'pe_vlan_id': $scope.subscriptions[i].db_subscription.services[j].pe_vlan_id,
                    'poi_vlan_id': $scope.subscriptions[i].db_subscription.services[j].poi_vlan_id,
                    'status': st,   // 0: Unknown, 1: IPSLA ICMP echo failed, 3: IPSLA ICMP echo success
                    'timestamp': $scope.subscriptions[i].db_subscription.services[j].statistics[$scope.subscriptions[i].db_subscription.services[j].statistics.length-1].timestamp,
                    'RTT': $scope.subscriptions[i].db_subscription.services[j].statistics[$scope.subscriptions[i].db_subscription.services[j].statistics.length-1].RTT
                };
                services_status.push(service_status);
                showSpinner.push(false);
            };
            $scope.subscriptions[i].serviceStatus = {
                "status": $scope.subscriptions[i].db_subscription.summaryStatus[$scope.subscriptions[i].db_subscription.summaryStatus.length-1].status, 
                "timestamp": $scope.subscriptions[i].db_subscription.summaryStatus[$scope.subscriptions[i].db_subscription.summaryStatus.length-1].timestamp, 
                "services_status": services_status
            };
            $scope.subscriptions[i].allCollected = false;
            $scope.showSubDetails.push(false);
            $scope.showIpslaSpinner.push(showSpinner);
            $scope.subscriptions[i].ipslaMessage = "";
            $scope.subscriptions[i].showIpslaMessage = false;
            $scope.subscriptions[i].cpe_id = matchCPE($scope.subscriptions[i].cpe_name);
            $scope.subscriptions[i].subscription_id = $scope.subscriptions[i].sp_id+"-Sub"+$scope.subscriptions[i].subscriber_id+"."+$scope.subscriptions[i].cpe_id+"-"+$scope.subscriptions[i].service_id;
            // console.log(`Subscription ID calculated to be: ${$scope.subscriptions[i].subscription_id}`);

            $scope.subscriptions[i].access_area = matchAccess($scope.subscriptions[i].access_area_id);
            $scope.subscriptions[i].pe_area = matchPE($scope.subscriptions[i].pe_area_id);
            $scope.subscriptions[i].poi_area = matchPOI($scope.subscriptions[i].poi_area_id);

            var chain = $q.when();
            (function(s_id, count) {
                chain = chain.then(function() {
                    return $http({
                        method: "GET",
                        url: "/subscriptions/check-sync/"+s_id
                    }).then(function(response) {
                        // console.log(`DATA stringified: ${JSON.stringify(response.data)}`);
                        var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-core:output":{"in-sync":', '"sync_output":{"in_sync":'));
                        // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
                        $scope.subscriptions[count].sync_status = newSyncStatus.sync_output;
                    }, function errorCallback(response) {
                        console.log(`Status: ${response.status}`);
                    });
                });
            })($scope.subscriptions[i].subscription_id, i);
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $scope.hoverIn = function(index) {
        $scope.showSubDetails[index] = true;
        /* if (!$scope.subscriptions[index].allCollected) {    //  && $scope.subscriptions[index].sync_status.in_sync
            // console.log(`Getting the DETAILS`);
            $http({
                method: 'GET',
                url: "/deviceservices/newSubAccess/"+$scope.subscriptions[index].subscription_id
            }).then(function(subAccess) {
                $scope.newSubAccess = JSON.parse(JSON.stringify(subAccess.data).replace("newSubAccess:newSubAccess", "newSubAccess")).newSubAccess;
                // console.log(`newSubAccess: ${JSON.stringify($scope.newSubAccess)}`);
                $scope.subscriptions[index].newSubAccess = $scope.newSubAccess;
                // console.log(`Stringified: ${JSON.stringify($scope.subscriptions[index].newSubAccess)}`);

                return $http({
                    method: 'GET',
                    url: "/deviceservices/newSubPE/"+$scope.subscriptions[index].subscription_id
                });
            }).then(function(subPE) {
                $scope.newSubPE = JSON.parse(JSON.stringify(subPE.data).replace("newSubPE:newSubPE", "newSubPE")).newSubPE;
                // console.log(`newSubPE: ${JSON.stringify($scope.newSubPE)}`);
                $scope.subscriptions[index].newSubPE = $scope.newSubPE;
                return $http({
                    method: 'GET',
                    url: "/deviceservices/newSubPOI/"+$scope.subscriptions[index].subscription_id
                });
            }).then(function(subPOI) {
                $scope.newSubPOI = JSON.parse(JSON.stringify(subPOI.data).replace("newSubPOI:newSubPOI", "newSubPOI")).newSubPOI;
                // console.log(`newSubPOI: ${JSON.stringify($scope.newSubPOI)}`);
                $scope.subscriptions[index].newSubPOI = $scope.newSubPOI;
                return $http({
                    method: 'GET',
                    url: "/deviceservices/newSubCPE/"+$scope.subscriptions[index].subscription_id
                });
            }).then(function(subCPE) {
                $scope.newSubCPE = JSON.parse(JSON.stringify(subCPE.data).replace("newSubCPE:newSubCPE", "newSubCPE")).newSubCPE;
                // console.log(`newSubCPE: ${JSON.stringify($scope.newSubCPE)}`);
                $scope.subscriptions[index].newSubCPE = $scope.newSubCPE;

                return $http({
                    method: "GET",
                    url: "/subscriptions/check-sync/"+$scope.subscriptions[index].subscription_id
                });
            }).then(function(response) {
                // console.log(`DATA stringified: ${JSON.stringify(response.data)}`);
                var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-core:output":{"in-sync":', '"sync_output":{"in_sync":'));
                // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
                $scope.subscriptions[index].sync_status = newSyncStatus.sync_output;
        
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
            $scope.subscriptions[index].allCollected = true;
        } else {

            $http({
                method: "GET",
                url: "/subscriptions/check-sync/"+$scope.subscriptions[index].subscription_id
            }).then(function(response) {
                // console.log(`DATA stringified: ${JSON.stringify(response.data)}`);
                var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-core:output":{"in-sync":', '"sync_output":{"in_sync":'));
                // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
                $scope.subscriptions[index].sync_status = newSyncStatus.sync_output;
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        }; */
        // console.log($scope.subscriptions);
    };

    $scope.hoverOut = function(index) {
        $scope.showSubDetails[index] = false;
    };

    $scope.ipslaIcmp = function(sub_index) {
        $scope.showSubDetails[sub_index] = true;

        for (var j=0; j<$scope.showIpslaSpinner[sub_index].length; j++) {
            // console.log(`Sub index: ${sub_index}, j: ${j}, ${$scope.showIpslaSpinner[sub_index][j]}`);
            $scope.showIpslaSpinner[sub_index][j] = true;
        };

        var subscription = $scope.subscriptions[sub_index];

        var vlan = [];
        for (var i=0; i<subscription.vlan_mappings.vlan_mapping.length; i++) {
            var vlan_id = subscription.vlan_mappings.vlan_mapping[i].outer_vlan;
            // console.log(`vlan_id: ${vlan_id}`);
            vlan.push({"vlan_id": vlan_id});
        };

        var data = {
            "subscription_id": subscription.subscription_id,
            "device": subscription.poi_area.node.poi_node_id,
            "cpe_id": subscription.cpe_id,
            "vlan": vlan
        };
        // console.log(`DATA: ${JSON.stringify(data)}`);

        var stats = [];
        var numGood = 0;
        $scope.subscriptions[sub_index].showIpslaMessage = true;
        $scope.subscriptions[sub_index].ipslaMessage = "Deploying IPSLA...";

        var chain = $q.when();
        chain = chain.then(function() {
            return $http({
                method: 'POST',
                url: '/ipslaicmp',
                data: data
            }).then(function(response) {
                // console.log(`ipslaicmp deployment Status: ${response.status}`);
                $scope.subscriptions[sub_index].ipslaMessage = "IPSLA deployed. Checking each service..";
            });
        });
        // for(var v = 0; v < vlan.length; v++) {
        for(var v = 0; v < $scope.subscriptions[sub_index].db_subscription.services.length; v++) {
            // console.log(`#: ${v}, vlan_id: ${$scope.subscriptions[sub_index].db_subscription.services[v].access_vlan_id}`);
            (function(index, count, len) {
                chain = chain.then(function() {
                    return $http({
                        method: "POST",
                        url: "/ipslaicmp/statistics/"+subscription.subscription_id,
                        data: {
                            "the_vlan": index
                        }
                    }).then(function(response) {
                        // console.log(`ipslaicmp statistics Status: ${response.status}`);
                        // console.log(`Result: ${JSON.stringify(response.data)}`);
                        if (response.data.result) {
                            numGood++;
                            $scope.subscriptions[sub_index].serviceStatus.services_status[count].status = 3;
                            $scope.subscriptions[sub_index].serviceStatus.services_status[count].RTT = response.data.rtt
                        } else {
                            $scope.subscriptions[sub_index].serviceStatus.services_status[count].status = 1;
                        };
                        $scope.subscriptions[sub_index].serviceStatus.services_status[count].timestamp = new Date();
                        stats.push(response.data);
                        var stat = {
                            "status": $scope.subscriptions[sub_index].serviceStatus.services_status[count].status,
                            "timestamp": $scope.subscriptions[sub_index].serviceStatus.services_status[count].timestamp,
                            "RTT": response.data.rtt
                        };
                        $scope.subscriptions[sub_index].db_subscription.services[count].statistics.push(stat);
                        // console.log(`numGood: ${numGood}, Stats: ${JSON.stringify(stats)}`);
                        // console.log(`Index: ${index}, Count: ${count}, Length: ${len}`);
                        // console.log(`Services Statistics: ${JSON.stringify($scope.subscriptions[sub_index].db_subscription.services[count].statistics)}`);
                        if (count == len-1) {
                            $scope.subscriptions[sub_index].ipslaMessage = "Deleting IPSLA..";
                        } else {
                            $scope.subscriptions[sub_index].ipslaMessage = "Service VLAN "+index+" was checked...";
                        };
                        $scope.showIpslaSpinner[sub_index][count] = false;
                    }, function errorCallback(response) {
                        console.log(`Status: ${response.status}`);
                    });
                });
            })($scope.subscriptions[sub_index].db_subscription.services[v].access_vlan_id, v, $scope.subscriptions[sub_index].db_subscription.services.length);
            // })(vlan[v].vlan_id, v, vlan.length);
        };
        chain = chain.then(function() {
            return $http({
                method: "DELETE",
                url: "/ipslaicmp/"+subscription.subscription_id
            }).then(function(response) {
                // console.log(`ipslaicmp delete Status: ${response.status}`);
                // console.log(`numGood: ${numGood}, FINAL Stats: ${JSON.stringify(stats)}`);
                if (numGood == vlan.length) {
                    // $scope.subscriptions[sub_index].serviceStatus = {"status": 3, "timestamp": new Date()};
                    $scope.subscriptions[sub_index].serviceStatus.status = 3;
                } else if (numGood > 0) {
                    $scope.subscriptions[sub_index].serviceStatus.status = 2;
                } else if (numGood == 0) {
                    $scope.subscriptions[sub_index].serviceStatus.status = 1;
                };
                var now = new Date();
                $scope.subscriptions[sub_index].serviceStatus.timestamp = now;
                var summaryStatus = {"status": $scope.subscriptions[sub_index].serviceStatus.status, "timestamp": now};
                $scope.subscriptions[sub_index].db_subscription.summaryStatus.push(summaryStatus);
                $scope.subscriptions[sub_index].ipslaMessage = "IPSLA Deleted";
                // console.log(`showSubDetails: ${$scope.showSubDetails[sub_index]}, showIpslaSpinner: ${$scope.showIpslaSpinner[sub_index]}`);
                // console.log(`Services Status: ${JSON.stringify($scope.subscriptions[sub_index].serviceStatus.services_status)}`);
                setTimeout(function(){
                    $scope.subscriptions[sub_index].showIpslaMessage = false;
                }, 3000);
            });
        });
        chain = chain.then(function() {
            return $http({
                method: "PATCH",
                url: "/db_subscriptions/"+subscription.db_subscription._id,
                data: subscription.db_subscription
            }).then(function(response) {
                // console.log(`PATCH db_subscriptions Status: ${response.status}`);
            });
        })

    };

    $scope.listServices = function() {
        for (var i=0; i<$scope.inventory.sps.sp.length; i++) {
            // console.log(`sp_id: ${$scope.inventory.sps.sp[i].sp_id}`);
            if ($scope.sp_id == $scope.inventory.sps.sp[i].sp_id) {
                $scope.services = $scope.inventory.sps.sp[i].services.service;
                // console.log(`Found: ${JSON.stringify($scope.services)}`);
            };
        };
        $scope.showServices = true;
        if ($scope.sp_id) {var sp_id = $scope.sp_id} else {var sp_id = ""};
        if ($scope.subscriber_id) {var subscriber_id = $scope.subscriber_id} else {var subscriber_id = 0};
        if ($scope.service_id) {var service_id = $scope.service_id} else {var service_id = ""};
        $scope.name = sp_id+"-Sub"+subscriber_id+"."+$scope.cpe_id+"-"+service_id;
    };

    $scope.listAccessNodes = function() {
        for (var i=0; i<$scope.inventory.access_areas.access_area.length; i++) {
            // console.log(`access_area_id: ${$scope.inventory.access_areas.access_area[i].access_area_id}`);
            if ($scope.access_area_id == $scope.inventory.access_areas.access_area[i].access_area_id) {
                $scope.access_nodes = $scope.inventory.access_areas.access_area[i].nodes.node;
                // console.log(`Found: ${JSON.stringify($scope.access_nodes)}`);
            };
        };
        $scope.showAccessNodes = true;
    };

    $scope.listAccessInterfaces = function() {
        for (var j=0; j<$scope.access_nodes.length; j++) {
            // console.log(`access_node_id: ${$scope.access_nodes[j].access_node_id}`);
            if ($scope.access_node_id == $scope.access_nodes[j].access_node_id) {
                $scope.access_interfaces = $scope.access_nodes[j].interfaces.interface;
                // console.log(`Found: ${JSON.stringify($scope.access_interfaces)}`);
            };
        };
        $scope.showAccessInterface = true;
    };

    $scope.makeSubscriptionID = function() {
        if ($scope.cpe_name) {
            for (var w=0; w<$scope.inventory.cpes.cpe.length; w++) {
                // console.log(`Counter w: ${w}`);
                // console.log(`Looking for cpe: ${$scope.cpe_name}`);
                if ($scope.inventory.cpes.cpe[w].cpe_name == $scope.cpe_name) {
                    $scope.cpe_id = $scope.inventory.cpes.cpe[w].cpe_id;
                    // console.log(`Found cpe_id: ${$scope.inventory.cpes.cpe[w].cpe_id}`);
                };
            };
        };
        if ($scope.sp_id) {var sp_id = $scope.sp_id} else {var sp_id = ""};
        if ($scope.subscriber_id) {var subscriber_id = $scope.subscriber_id} else {var subscriber_id = 0};
        if ($scope.service_id) {var service_id = $scope.service_id} else {var service_id = ""};
        $scope.name = sp_id+"-Sub"+subscriber_id+"."+$scope.cpe_id+"-"+service_id;
    };

    $scope.newEntryToggle = function() {
        if ($scope.newEntry) {
            $scope.newEntry = false;
            $scope.name = null;
            $scope.subscriber_id = null;
            $scope.sp_id = null;
            $scope.service_id = null;
            $scope.access_area_id = null;
            $scope.pe_area_id = null;
            $scope.poi_area_id = null;

        } else {
            $scope.newEntry = true;
        };
    };

    $scope.editToggle = function(index) {
        if ($scope.editEntry) {
            $scope.editEntry = false;
            $scope.name = null;
            $scope.subscriber_id = null;
            $scope.cpe_name = null;
            $scope.sp_id = null;
            $scope.service_id = null;
            $scope.access_area_id = null;
            $scope.pe_area_id = null;
            $scope.poi_area_id = null;
            $scope.showAccessNodes = false;
            $scope.showAccessInterface = false;
            $scope.showServices = false;
        } else {
            $scope.editEntry = true;
            $scope.subscriptionToMove = $scope.subscriptions[index];
            $scope.indexOfSubToMove = index;
            $scope.name = $scope.subscriptions[index].name;
            $scope.subscriber_id = parseInt($scope.subscriptions[index].subscriber_id);
            $scope.cpe_name = $scope.subscriptions[index].cpe_name;
            $scope.sp_id = $scope.subscriptions[index].sp_id;
            $scope.service_id = $scope.subscriptions[index].service_id;
            $scope.access_area_id = $scope.subscriptions[index].access_area_id;
            $scope.access_node_id = $scope.subscriptions[index].access_node_id;
            $scope.pe_area_id = $scope.subscriptions[index].pe_area_id;
            $scope.poi_area_id = $scope.subscriptions[index].poi_area_id;
            // $scope.showAccessNodes = false;
            // $scope.showAccessInterface = false;
            $scope.listAccessNodes();
            $scope.listServices();
        };
    };

    // ********************* DEPLOY SUBSCRIPTION **************************
    $scope.generateSubscription = function() {
        $scope.spinnerStatus = true;
        var subscription_id = $scope.name;
        // console.log(`subscription_id: ${subscription_id}`);

        var subscriptionExistsAlready = false;
        for (var q=0; q<$scope.subscriptions.length; q++) {
            // console.log(`Subscription ID: ${$scope.subscriptions[q].name}`);
            if ($scope.subscriptions[q].name == subscription_id) {
                subscriptionExistsAlready = true;
                $window.alert("The Subscription ID exists already. Operation interrupted.");
            };
            if ($scope.subscriptions[q].sp_id == $scope.sp_id && $scope.subscriptions[q].subscriber_id == $scope.subscriber_id) {
                subscriptionExistsAlready = true;
                $window.alert("The ISP already has a subscription provisioned for that subscriber.");
            }
        };

        if (!subscriptionExistsAlready) {

            var moved_subscriber = false;
            var vlanResults = allocateVlans(moved_subscriber);
            var vlan_mapping = vlanResults.vlan_mapping;
            var vp = vlanResults.updatedVlanpool;
            var vlan_mappings = {"vlan_mapping": vlan_mapping};
            // console.log(`vlan_mappings: ${JSON.stringify(vlan_mappings)}`);
            // console.log(`VLAN Pool now: ${JSON.stringify(vp)}`);

            // var PWResults = allocatePws();
            var PWPool = matchPWPool();
            var PWResults = allocatePWSubInt(PWPool);
            var selectedPWSubInterface = PWResults.selectedPWSubInterface;
            var pw = PWResults.updatedPWPool;
            // console.log(`Selected PW sub-interface: ${selectedPWSubInterface}`);
            // console.log(`PW now: ${JSON.stringify(pw)}`);

            var access = {
                "access_area_id": $scope.access_area_id,
                "access_node_id": $scope.access_node_id,
                "access_if": $scope.access_if
            };

            var data_for_nso = {
                "name": $scope.name,
                "subscriber_id": $scope.subscriber_id,
                "moved_subscriber": false,
                "cpe_name": $scope.cpe_name,
                "sp_id": $scope.sp_id,
                "service_id": $scope.service_id,
                "access_area_id": $scope.access_area_id,
                "access_node_id": $scope.access_node_id,
                "access_if": $scope.access_if,
                "pe_area_id": $scope.pe_area_id,
                "poi_area_id": $scope.poi_area_id,
                "pwsubinterface_id": selectedPWSubInterface,
                "vlan_mappings": vlan_mappings,
                "original_access": access
            };
            // console.log(`DATA: ${JSON.stringify(data_for_nso)}`);

            var cpe = {
                "cpe_name": $scope.cpe_name,
                "cpe_id": matchCPE($scope.cpe_name)
            };

            var services_for_db = [];
            for (l=0; l<vlan_mapping.length; l++) {
                var service_for_db = {
                    "inner_vlan_id": vlan_mapping[l].inner_vlan,
                    "access_vlan_id": vlan_mapping[l].outer_vlan,
                    "pe_vlan_id": vlan_mapping[l].old_vlan,
                    "poi_vlan_id": vlan_mapping[l].old_vlan,
                    "cpe_ipaddress": {
                        "octet1": 10,
                        "octet2": matchCPE($scope.cpe_name) % 255,
                        "octet3": vlan_mapping[l].outer_vlan % 255,
                        "octet4": 2
                    },
                    "statistics": [
                        {
                            "status": 0,
                            "timestamp": new Date(),
                            "RTT": 0
                        }
                    ]
                };
                services_for_db.push(service_for_db);
            };
            // console.log(`services_for_db DATA: ${JSON.stringify(service_for_db)}`);

            var mvr = {
                "mvr_vlan": 0,
                "mvr_receiver_vlan": 0
            };

            var summaryStatus = [
                {
                    "status": 0,
                    "timestamp": new Date()
                }
            ];

            var moved_subscriber = {
                "moved": false,
                "original_subscription_id": subscription_id,
                "original_vlanpool": vp.vlanpool_id,
                "original_pw_pool": pw.pseudowire_id
            };

            var data_for_db_subscription = {
                "subscription_id": subscription_id,
                "subscription_description": "Subscription "+subscription_id+", Subscriber: "+$scope.subscriber_id+", SP: "+$scope.sp_id+".",
                "subscriber_id": $scope.subscriber_id,
                "moved_subscriber": moved_subscriber,
                "services": services_for_db,
                "summaryStatus": summaryStatus,
                "deploymentStatus": true,
                "mvr": mvr,
                "access": access,
                "pe": matchPE($scope.pe_area_id),
                "poi": matchPOI($scope.poi_area_id),
                "cpe": cpe,
                "sp_id": $scope.sp_id,
                "service_id": $scope.service_id
            };
            // console.log(`db_subscription DATA: ${JSON.stringify(data_for_db_subscription)}`);
            
            $http({
                method: "POST",
                url: "/subscriptions",
                data: data_for_nso
            }).then(function(response) {
                // console.log(`open-net-access Status: ${response.status}`);

                return $http({
                    method: 'GET',
                    url: "/deviceservices/newSubAccess/"+subscription_id
                });
            }).then(function(subAccess) {
                $scope.newSubAccess = JSON.parse(JSON.stringify(subAccess.data).replace("newSubAccess:newSubAccess", "newSubAccess")).newSubAccess;
                // console.log(`newSubAccess: ${JSON.stringify($scope.newSubAccess)}`);
                mvr = {
                    "mvr_vlan": $scope.newSubAccess.mvr_vlan,
                    "mvr_receiver_vlan": $scope.newSubAccess.mvr_receiver_vlan
                };
                data_for_db_subscription.mvr = mvr;

                return $http({
                    method: 'GET',
                    url: "/deviceservices/newSubPE/"+subscription_id
                });
            }).then(function(subPE) {
                $scope.newSubPE = JSON.parse(JSON.stringify(subPE.data).replace("newSubPE:newSubPE", "newSubPE")).newSubPE;
                // console.log(`newSubPE: ${JSON.stringify($scope.newSubPE)}`);
                data_for_db_subscription.pe.node.pe_if = $scope.newSubPE.pe_interface;

                return $http({
                    method: 'GET',
                    url: "/deviceservices/newSubPOI/"+subscription_id
                });
            }).then(function(subPOI) {
                $scope.newSubPOI = JSON.parse(JSON.stringify(subPOI.data).replace("newSubPOI:newSubPOI", "newSubPOI")).newSubPOI;
                // console.log(`newSubPOI: ${JSON.stringify($scope.newSubPOI)}`);
                data_for_db_subscription.poi.node.pw_sub_if = $scope.newSubPOI.PWESubInt;

                return $http({
                    method: "PATCH",
                    url: "/vlanpools/"+vp._id,
                    data: vp
                });
            }).then(function(response) {
                // console.log(`VLAN Pool Status: ${response.status}`);
                return $http({
                    method: "PATCH",
                    url: "/pseudowires/"+pw._id,
                    data: pw
                });
            }).then(function(response) {
                // console.log(`Status of PW Set: ${response.status}`);

                return $http({
                    method: "POST",
                    url: "/db_subscriptions",
                    data: data_for_db_subscription
                });
            }).then(function(response) {
                // console.log(`Status of Subscription in DB: ${response.status}`);
                $location.path('/oncustomers');
                $route.reload();
            }, function errorCallback(response) {
                $scope.spinnerStatus = false;
                $scope.errorMessage = true;
                if (response.status == 500) {$scope.errorDetails = response.status +", Internal Server Error"};
                if (response.status == 400) {
                    $scope.errorDetails = response.status +", Bad Request "+JSON.stringify(response.data);
                    /* if (response.data.errors.error[0].error-message) {
                        $scope.errorDetails = $scope.errorDetails + response.data.errors.error[0].error-message
                    }; */
                };
                if (response.status == 403) {$scope.errorDetails = response.status +", Forbidden"};
                if (response.status == 404) {$scope.errorDetails = response.status +", Not Found"};
                if (response.status == 501) {$scope.errorDetails = response.status +", Not Implemented"};
                if (response.status == 502) {$scope.errorDetails = response.status +", Bad Gateway"};
                if (response.status == 503) {$scope.errorDetails = response.status +", Service Unavailable"};
                console.log(`Status: ${response.status}`);
                console.log(`Data: ${JSON.stringify(response)}`);
            });
        } else {
            $scope.spinnerStatus = false;
        }
    };

    $scope.moveSubscription = function() {
        // $window.alert("This function is not implemented yet.");
        $scope.spinnerStatus = true;
        var subscription_id = $scope.name;
        console.log(`subscription_id: ${subscription_id}`);

        var subscriptionExistsAlready = false;
        for (var q=0; q<$scope.subscriptions.length; q++) {
            console.log(`Subscription ID: ${$scope.subscriptions[q].name}`);
            if ($scope.subscriptions[q].name == subscription_id) {
                subscriptionExistsAlready = true;
                $window.alert("The Subscription ID exists already. Operation interrupted.");
            };
            /* if ($scope.subscriptions[q].sp_id == $scope.sp_id && $scope.subscriptions[q].subscriber_id == $scope.subscriber_id) {
                subscriptionExistsAlready = true;
                $window.alert("The ISP already has a subscription provisioned for that subscriber.");
            }; */
        };

        if (!subscriptionExistsAlready) {

            $scope.spinnerStatus = true;
            var moved_subscriber = true;
            var vlanResults = allocateVlans(moved_subscriber);
            var vlan_mapping = vlanResults.vlan_mapping;
            var vp = vlanResults.updatedVlanpool;
            var PWPool = vlanResults.updatedPWPool;
            var vlan_mappings = {"vlan_mapping": vlan_mapping};
            // console.log(`vlan_mappings: ${JSON.stringify(vlan_mappings)}`);
            // console.log(`VLAN Pool now: ${JSON.stringify(vp)}`);

            // console.log(`PW now after local PW Sub interfaces: ${JSON.stringify(PWPool)}`);

            PWResults = allocatePWSubInt(PWPool);
            pw = PWResults.updatedPWPool;
            var selectedPWSubInterface = PWResults.selectedPWSubInterface;
            // console.log(`PW now after global PW sub if: ${JSON.stringify(pw)}`);

            var access = {
                "access_area_id": $scope.access_area_id,
                "access_node_id": $scope.access_node_id,
                "access_if": $scope.access_if
            };

            var data_for_nso = {
                "name": $scope.name,
                "moved_subscriber": moved_subscriber,
                "subscriber_id": $scope.subscriber_id,
                "cpe_name": $scope.cpe_name,
                "sp_id": $scope.sp_id,
                "service_id": $scope.service_id,
                "access_area_id": $scope.access_area_id,
                "access_node_id": $scope.access_node_id,
                "access_if": $scope.access_if,
                "pe_area_id": $scope.pe_area_id,
                "poi_area_id": $scope.poi_area_id,
                "pwsubinterface_id": selectedPWSubInterface,
                "vlan_mappings": vlan_mappings,
                "original_access": $scope.subscriptionToMove.db_subscription.access
            };
            // console.log(`DATA: ${JSON.stringify(data_for_nso)}`);

            var cpe = {
                "cpe_name": $scope.cpe_name,
                "cpe_id": matchCPE($scope.cpe_name)
            };

            var services_for_db = [];
            for (l=0; l<vlan_mapping.length; l++) {
                var service_for_db = {
                    "inner_vlan_id": vlan_mapping[l].inner_vlan,
                    "access_vlan_id": vlan_mapping[l].outer_vlan,
                    "pe_vlan_id": vlan_mapping[l].old_vlan,
                    "poi_vlan_id": vlan_mapping[l].old_vlan,
                    "cpe_ipaddress": {
                        "octet1": 10,
                        "octet2": matchCPE($scope.cpe_name) % 255,
                        "octet3": vlan_mapping[l].outer_vlan % 255,
                        "octet4": 2
                    },
                    "statistics": [
                        {
                            "status": 0,
                            "timestamp": new Date(),
                            "RTT": 0
                        }
                    ]
                };
                services_for_db.push(service_for_db);
            };
            // console.log(`services_for_db DATA: ${JSON.stringify(services_for_db)}`);

            var mvr = {
                "mvr_vlan": 0,
                "mvr_receiver_vlan": 0
            };

            var summaryStatus = [
                {
                    "status": 0,
                    "timestamp": new Date()
                }
            ];

            for (var l=0; l<$scope.pseudowires.length; l++) {
                if ($scope.subscriptionToMove.sp_id == $scope.pseudowires[l].sp_id && $scope.subscriptionToMove.access_node_id == $scope.pseudowires[l].access_node_id) {
                    var original_pw_pool = $scope.pseudowires[l];
                    console.log(`Found PW: ${JSON.stringify(original_pw_pool)}`);
                };
            };

            var moved_subscriber = {
                "moved": true,
                "original_subscription_id": $scope.subscriptionToMove.name,
                "original_vlanpool": "unknown",
                "original_pw_pool": original_pw_pool.pseudowire_id
            };

            var data_for_db_subscription = {
                "subscription_id": subscription_id,
                "subscription_description": "Subscription "+subscription_id+", Subscriber: "+$scope.subscriber_id+", SP: "+$scope.sp_id+".",
                "subscriber_id": $scope.subscriber_id,
                "moved_subscriber": moved_subscriber,
                "services": services_for_db,
                "summaryStatus": summaryStatus,
                "deploymentStatus": true,
                "mvr": mvr,
                "access": access,
                "pe": matchPE($scope.pe_area_id),
                "poi": matchPOI($scope.poi_area_id),
                "cpe": cpe,
                "sp_id": $scope.sp_id,
                "service_id": $scope.service_id
            };
            // console.log(`db_subscription DATA: ${JSON.stringify(data_for_db_subscription)}`);

            $http({
                method: "DELETE",
                url: "/subscriptions/"+$scope.subscriptionToMove.subscription_id
            }).then(function(response) {
                // console.log(`DELETE Status: ${response.status}`);

                for (var l=0; l<$scope.vlanpools.length; l++) {
                    if ($scope.subscriptionToMove.sp_id == $scope.vlanpools[l].sp_id && $scope.subscriptionToMove.access_area_id == $scope.vlanpools[l].access_area_id && $scope.subscriptionToMove.access_node_id == $scope.vlanpools[l].access_node_id) {
                        var vpToChange = $scope.vlanpools[l];
                        // console.log(`Found VLAN Pool: ${JSON.stringify(vpToChange)}`);
                    };
                };
                var now = new Date();
                for (var n=0; n<vpToChange.vlans.length; n++) {
                    if (vpToChange.vlans[n].subscription_id == $scope.subscriptionToMove.subscription_id) {
                        vpToChange.vlans[n].status = "Active";
                        vpToChange.vlans[n].subscriber_id = "";
                        // vpToChange.vlans[n].subscription_id = $scope.name+": Subscriber moved from "+$scope.subscriptionToMove.access_node_id+", interface "+$scope.subscriptionToMove.access_if+" to "+$scope.access_node_id+" interface "+$scope.access_if;
                        vpToChange.vlans[n].subscription_id = subscription_id;
                        vpToChange.vlans[n].timestamp = now;
                    };
                };
                data_for_db_subscription.moved_subscriber.original_vlanpool = vpToChange.vlanpool_id;
                console.log(`vpToChange: ${JSON.stringify(vpToChange)}`);
    
                return $http({
                    method: "PATCH",
                    url: "/vlanpools/"+vpToChange._id,
                    data: vpToChange
                });
            }).then(function(response) {
                // console.log(`VLAN Pool Status: ${response.status}`);

                // console.log(`Deleting db_subscription, _id: ${$scope.subscriptionToMove.db_subscription._id}, subscription_id: ${$scope.subscriptionToMove.db_subscription.subscription_id}`);
                return $http({
                    method: "DELETE",
                    url: "/db_subscriptions/"+$scope.subscriptionToMove.db_subscription._id
                });
            }).then(function(response) {
                // console.log(`DELETE Status of DB Subscription: ${response.status}`);

                return $http({
                    method: "POST",
                    url: "/subscriptions",
                    data: data_for_nso
                });
            }).then(function(response) {
                // console.log(`open-net-access Status: ${response.status}`);

                return $http({
                    method: 'GET',
                    url: "/deviceservices/newSubAccess/"+subscription_id
                });
            }).then(function(subAccess) {
                $scope.newSubAccess = JSON.parse(JSON.stringify(subAccess.data).replace("newSubAccess:newSubAccess", "newSubAccess")).newSubAccess;
                // console.log(`newSubAccess: ${JSON.stringify($scope.newSubAccess)}`);
                mvr = {
                    "mvr_vlan": $scope.newSubAccess.mvr_vlan,
                    "mvr_receiver_vlan": $scope.newSubAccess.mvr_receiver_vlan
                };
                data_for_db_subscription.mvr = mvr;

                return $http({
                    method: 'GET',
                    url: "/deviceservices/moveSubPE/"+subscription_id
                });
            }).then(function(subPE) {
                $scope.moveSubPE = JSON.parse(JSON.stringify(subPE.data).replace("moveSubPE:moveSubPE", "moveSubPE")).moveSubPE;
                // console.log(`moveSubPE: ${JSON.stringify($scope.moveSubPE)}`);
                data_for_db_subscription.pe.node.pe_if = $scope.moveSubPE.vlans.vlan[0].pe_interface;

                return $http({
                    method: 'GET',
                    url: "/deviceservices/newSubPOI/"+subscription_id
                });
            }).then(function(subPOI) {
                $scope.newSubPOI = JSON.parse(JSON.stringify(subPOI.data).replace("newSubPOI:newSubPOI", "newSubPOI")).newSubPOI;
                // console.log(`newSubPOI: ${JSON.stringify($scope.newSubPOI)}`);
                data_for_db_subscription.poi.node.pw_sub_if = $scope.newSubPOI.PWESubInt;

                return $http({
                    method: "PATCH",
                    url: "/vlanpools/"+vp._id,
                    data: vp
                });
            }).then(function(response) {
                // console.log(`VLAN Pool Status: ${response.status}`);
                return $http({
                    method: "PATCH",
                    url: "/pseudowires/"+pw._id,
                    data: pw
                });
            }).then(function(response) {
                // console.log(`Status of PW Set: ${response.status}`);
                return $http({
                    method: "POST",
                    url: "/db_subscriptions",
                    data: data_for_db_subscription
                });
            }).then(function(response) {
                // console.log(`Status of Subscription in DB: ${response.status}`);
                $location.path('/oncustomers');
                $route.reload();
            }, function errorCallback(response) {
                $scope.spinnerStatus = false;
                $scope.errorMessage = true;
                if (response.status == 500) {$scope.errorDetails = response.status +", Internal Server Error"};
                if (response.status == 400) {
                    $scope.errorDetails = response.status +", Bad Request "+JSON.stringify(response.data);
                };
                if (response.status == 403) {$scope.errorDetails = response.status +", Forbidden"};
                if (response.status == 404) {$scope.errorDetails = response.status +", Not Found"};
                if (response.status == 501) {$scope.errorDetails = response.status +", Not Implemented"};
                if (response.status == 502) {$scope.errorDetails = response.status +", Bad Gateway"};
                if (response.status == 503) {$scope.errorDetails = response.status +", Service Unavailable"};
                console.log(`Status: ${response.status}`);
                console.log(`Data: ${JSON.stringify(response)}`);
            });
        } else {
            $scope.spinnerStatus = false;
        };
        
    };

    $scope.unDeploySubscription = function(sub_index) {
        var subscription = $scope.subscriptions[sub_index];
        $scope.spinnerStatusDelete = true;
        var now = new Date();

        $http({
            method: "GET",
            url: "/subscriptions/un-deploy/"+subscription.subscription_id
        }).then(function(response) {
            // console.log(`Un-deploy Status: ${response.status}`);
            return $http({
                method: "GET",
                url: "/subscriptions/check-sync/"+subscription.subscription_id
            });
        }).then(function(response) {
            // console.log(`DATA stringified: ${JSON.stringify(response.data)}`);
            var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-core:output":{"in-sync":', '"sync_output":{"in_sync":'));
            // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
            for (var i=0; i<$scope.subscriptions.length; i++) {
                if ($scope.subscriptions[i].subscription_id == subscription.subscription_id) {
                    $scope.subscriptions[i].sync_status = newSyncStatus.sync_output;
                    // console.log(`Sync Status for ${$scope.subscriptions[i].subscription_id}: ${JSON.stringify($scope.subscriptions[i].sync_status)}`);
                };
            };

            for (var l=0; l<$scope.vlanpools.length; l++) {
                if (subscription.sp_id == $scope.vlanpools[l].sp_id && subscription.access_area_id == $scope.vlanpools[l].access_area_id && subscription.access_node_id == $scope.vlanpools[l].access_node_id) {
                    var vp = $scope.vlanpools[l];
                    // console.log(`Found VLAN Pool: ${JSON.stringify(vp)}`);
                };
            };
            // var now = new Date();
            for (var n=0; n<vp.vlans.length; n++) {
                if (vp.vlans[n].subscription_id == subscription.subscription_id && vp.vlans[n].status == "Active") {
                    vp.vlans[n].status = "Inactive";
                    vp.vlans[n].timestamp = now;
                };
            };

            return $http({
                method: "PATCH",
                url: "/vlanpools/"+vp._id,
                data: vp
            });
        }).then(function(response) {
            // console.log(`VLAN Pool Status: ${response.status}`);

            for (var l=0; l<$scope.pseudowires.length; l++) {
                if (subscription.sp_id == $scope.pseudowires[l].sp_id && subscription.access_node_id == $scope.pseudowires[l].access_node_id) {
                    var pw = $scope.pseudowires[l];
                    // console.log(`Found PW: ${JSON.stringify(pw)}`);
                };
            };
            // console.log(`PW Subinterfaces length: ${pw.subinterfaces.length}`);
            for (var z=0; z<pw.subinterfaces.length; z++) {
                // console.log(`subinterface_id: ${subscription.pwsubinterface_id}, ${pw.subinterfaces[z].subinterface_id}`);
                if (subscription.pwsubinterface_id == pw.subinterfaces[z].subinterface_id) {
                    // console.log(`Found subinterface_id: ${subscription.pwsubinterface_id}, ${pw.subinterfaces[z].subinterface_id}, ${pw.subinterfaces[z].status}, ${pw.subinterfaces[z].timestamp}`);
                    pw.subinterfaces[z].status = "Inactive";
                    pw.subinterfaces[z].timestamp = now;
                };
            };
            
            return $http({
                method: "PATCH",
                url: "/pseudowires/"+pw._id,
                data: pw
            });
        }).then(function(response) {
            console.log(`PATCH Status of Pseudowire Set: ${response.status}`);
            $scope.subscriptions[sub_index].db_subscription.deploymentStatus = false;
            return $http({
                method: "PATCH",
                url: "/db_subscriptions/"+subscription.db_subscription._id,
                data: $scope.subscriptions[sub_index].db_subscription
            });
        }).then(function(response) {
            console.log(`PATCH db_subscriptions Status: ${response.status}`);
            $scope.spinnerStatusDelete = false;
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.reDeploySubscription = function(sub_index) {
        var subscription = $scope.subscriptions[sub_index];
        $scope.spinnerStatusDelete = true;
        var now = new Date();

        $http({
            method: "GET",
            url: "/subscriptions/re-deploy/"+subscription.subscription_id
        }).then(function(response) {
            // console.log(`Re-deploy Status: ${response.status}`);
            return $http({
                method: "GET",
                url: "/subscriptions/check-sync/"+subscription.subscription_id
            });
        }).then(function(response) {
            // console.log(`DATA stringified: ${JSON.stringify(response.data)}`);
            var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-core:output":{"in-sync":', '"sync_output":{"in_sync":'));
            // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
            for (var i=0; i<$scope.subscriptions.length; i++) {
                if ($scope.subscriptions[i].subscription_id == subscription.subscription_id) {
                    $scope.subscriptions[i].sync_status = newSyncStatus.sync_output;
                    // console.log(`Sync Status for ${$scope.subscriptions[i].subscription_id}: ${JSON.stringify($scope.subscriptions[i].sync_status)}`);
                };
            };

            for (var l=0; l<$scope.vlanpools.length; l++) {
                if (subscription.sp_id == $scope.vlanpools[l].sp_id && subscription.access_area_id == $scope.vlanpools[l].access_area_id && subscription.access_node_id == $scope.vlanpools[l].access_node_id) {
                    var vp = $scope.vlanpools[l];
                    // console.log(`Found VLAN Pool: ${JSON.stringify(vp)}`);
                };
            };
            // var now = new Date();
            for (var n=0; n<vp.vlans.length; n++) {
                if (vp.vlans[n].subscription_id == subscription.subscription_id && vp.vlans[n].status == "Inactive") {
                    vp.vlans[n].status = "Active";
                    vp.vlans[n].timestamp = now;
                };
            };

            return $http({
                method: "PATCH",
                url: "/vlanpools/"+vp._id,
                data: vp
            });
        }).then(function(response) {
            // console.log(`VLAN Pool Status: ${response.status}`);

            for (var l=0; l<$scope.pseudowires.length; l++) {
                if (subscription.sp_id == $scope.pseudowires[l].sp_id && subscription.access_node_id == $scope.pseudowires[l].access_node_id) {
                    var pw = $scope.pseudowires[l];
                    // console.log(`Found PW: ${JSON.stringify(pw)}`);
                };
            };
            // console.log(`PW Subinterfaces length: ${pw.subinterfaces.length}`);
            for (var z=0; z<pw.subinterfaces.length; z++) {
                // console.log(`subinterface_id: ${subscription.pwsubinterface_id}, ${pw.subinterfaces[z].subinterface_id}`);
                if (subscription.pwsubinterface_id == pw.subinterfaces[z].subinterface_id) {
                    // console.log(`Found subinterface_id: ${subscription.pwsubinterface_id}, ${pw.subinterfaces[z].subinterface_id}, ${pw.subinterfaces[z].status}, ${pw.subinterfaces[z].timestamp}`);
                    pw.subinterfaces[z].status = "Active";
                    pw.subinterfaces[z].timestamp = now;
                };
            };

            return $http({
                method: "PATCH",
                url: "/pseudowires/"+pw._id,
                data: pw
            });
        }).then(function(response) {
            console.log(`PATCH Status of Pseudowire Set: ${response.status}`);
            $scope.subscriptions[sub_index].db_subscription.deploymentStatus = true;
            return $http({
                method: "PATCH",
                url: "/db_subscriptions/"+subscription.db_subscription._id,
                data: $scope.subscriptions[sub_index].db_subscription
            });
        }).then(function(response) {
            console.log(`PATCH db_subscriptions Status: ${response.status}`);
            $scope.spinnerStatusDelete = false;
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteSubscription = function(subscription) {

        if ($window.confirm('Please confirm that you want to delete the subscription '+subscription.subscription_id)) {
            $scope.spinnerStatusDelete = true;
            var now = new Date();
            for (var l=0; l<$scope.vlanpools.length; l++) {
                if (subscription.sp_id == $scope.vlanpools[l].sp_id && subscription.access_area_id == $scope.vlanpools[l].access_area_id && subscription.access_node_id == $scope.vlanpools[l].access_node_id) {
                    var vp = $scope.vlanpools[l];
                    console.log(`Found new VLAN Pool: ${JSON.stringify(vp)}`);
                };
            };
            for (var n=0; n<vp.vlans.length; n++) {
                if (vp.vlans[n].subscription_id == subscription.subscription_id) {
                    vp.vlans[n].status = "Free";
                    vp.vlans[n].subscriber_id = "";
                    vp.vlans[n].subscription_id = "";
                    vp.vlans[n].timestamp = now;
                };
            };

            if (subscription.moved_subscriber) {
                for (var l=0; l<$scope.vlanpools.length; l++) {
                    if (subscription.sp_id == $scope.vlanpools[l].sp_id && subscription.original_access.access_area_id == $scope.vlanpools[l].access_area_id && subscription.original_access.access_node_id == $scope.vlanpools[l].access_node_id) {
                        var old_vp = $scope.vlanpools[l];
                        console.log(`Found original VLAN Pool: ${JSON.stringify(old_vp)}`);
                    };
                };
                for (var n=0; n<old_vp.vlans.length; n++) {
                    if (old_vp.vlans[n].subscription_id == subscription.subscription_id) {
                        old_vp.vlans[n].status = "Free";
                        old_vp.vlans[n].subscriber_id = "";
                        old_vp.vlans[n].subscription_id = "";
                        old_vp.vlans[n].timestamp = now;
                    };
                };
            };

            for (var l=0; l<$scope.pseudowires.length; l++) {
                if (subscription.sp_id == $scope.pseudowires[l].sp_id && subscription.access_node_id == $scope.pseudowires[l].access_node_id) {
                    var pw = $scope.pseudowires[l];
                    console.log(`Found PW: ${JSON.stringify(pw)}`);
                };
            };
            // console.log(`PW Subinterfaces length: ${pw.subinterfaces.length}`);
            for (var z=0; z<pw.subinterfaces.length; z++) {
                console.log(`subinterface_id: ${subscription.pwsubinterface_id}, ${pw.subinterfaces[z].subinterface_id}`);
                if (subscription.subscription_id == pw.subinterfaces[z].subscription_id) {
                    console.log(`Found subinterface_id: ${subscription.pwsubinterface_id}`);
                    pw.subinterfaces[z].status = "Free";
                    pw.subinterfaces[z].timestamp = now;
                    pw.subinterfaces[z].subscriber_id = "";
                    pw.subinterfaces[z].subscription_id = "";
                };
                if (subscription.moved_subscriber) {
                    if (subscription.db_subscription.moved_subscriber.original_subscription_id == pw.subinterfaces[z].subscription_id) {
                        console.log(`Found original subinterface_id: ${subscription.pwsubinterface_id}`);
                        pw.subinterfaces[z].status = "Free";
                        pw.subinterfaces[z].timestamp = now;
                        pw.subinterfaces[z].subscriber_id = "";
                        pw.subinterfaces[z].subscription_id = "";
                    }
                }
            };

            var chain = $q.when();
            chain = chain.then(function() {
                return $http({
                    method: "DELETE",
                    url: "/subscriptions/"+subscription.subscription_id
                }).then(function(response) {
                    console.log(`DELETE Status: ${response.status}`);
                }, function errorCallback(response) {
                    $scope.spinnerStatusDelete = false;
                    $scope.errorMessage = true;
                    if (response.status == 500) {$scope.errorDetails = response.status +", Internal Server Error"};
                    if (response.status == 400) {
                        $scope.errorDetails = response.status +", Bad Request "+JSON.stringify(response.data);
                    };
                    if (response.status == 403) {$scope.errorDetails = response.status +", Forbidden"};
                    if (response.status == 404) {$scope.errorDetails = response.status +", Not Found"};
                    if (response.status == 501) {$scope.errorDetails = response.status +", Not Implemented"};
                    if (response.status == 502) {$scope.errorDetails = response.status +", Bad Gateway"};
                    if (response.status == 503) {$scope.errorDetails = response.status +", Service Unavailable"};
                    console.log(`ERROR. Status: ${response.status}`);
                    console.log(`Data: ${JSON.stringify(response)}`);
                });
            });

            chain = chain.then(function() {
                return $http({
                    method: "PATCH",
                    url: "/vlanpools/"+vp._id,
                    data: vp
                }).then(function(response) {
                    console.log(`VLAN Pool Status: ${response.status}`);
                }, function errorCallback(response) {
                    $scope.spinnerStatusDelete = false;
                    console.log(`ERROR. VLAN Pool DELETE Status: ${response.status}`);
                });
            });

            chain = chain.then(function() {
                return $http({
                    method: "DELETE",
                    url: "/db_subscriptions/"+subscription.db_subscription._id
                }).then(function(response) {
                    console.log(`DELETE Status of DB Subscription: ${response.status}`);
                }, function errorCallback(response) {
                    $scope.spinnerStatusDelete = false;
                    console.log(`ERROR. DELETE Status of DB Subscription: ${response.status}`);
                });
            });

            chain = chain.then(function() {
                return $http({
                    method: "PATCH",
                    url: "/pseudowires/"+pw._id,
                    data: pw
                }).then(function(response) {
                    console.log(`PATCH Status of Pseudowire Set: ${response.status}`);
                    if (subscription.moved_subscriber) {
                        chain = chain.then(function() {
                            return $http({
                                method: "PATCH",
                                url: "/vlanpools/"+old_vp._id,
                                data: old_vp
                            }).then(function(response) {
                                console.log(`VLAN Pool Status, Old VLAN Pool: ${response.status}`);
                                $location.path('/oncustomers');
                                $route.reload();
                            }, function errorCallback(response) {
                                $scope.spinnerStatusDelete = false;
                                console.log(`ERROR. Old VLAN Pool DELETE Status: ${response.status}`);
                            });
                        });
                    } else {
                        $location.path('/oncustomers');
                        $route.reload();
                    };
                }, function errorCallback(response) {
                    $scope.spinnerStatusDelete = false;
                    console.log(`ERROR. PW DELETE Status: ${response.status}`);
                });
            });

            

            /* $http({
                method: "DELETE",
                url: "/subscriptions/"+subscription.subscription_id
            }).then(function(response) {
                // console.log(`DELETE Status: ${response.status}`);

                for (var l=0; l<$scope.vlanpools.length; l++) {
                    if (subscription.sp_id == $scope.vlanpools[l].sp_id && subscription.access_area_id == $scope.vlanpools[l].access_area_id && subscription.access_node_id == $scope.vlanpools[l].access_node_id) {
                        var vp = $scope.vlanpools[l];
                        // console.log(`Found VLAN Pool: ${JSON.stringify(vp)}`);
                    };
                };
                for (var n=0; n<vp.vlans.length; n++) {
                    if (vp.vlans[n].subscription_id == subscription.subscription_id) {
                        vp.vlans[n].status = "Free";
                        vp.vlans[n].subscriber_id = "";
                        vp.vlans[n].subscription_id = "";
                        vp.vlans[n].timestamp = now;
                    };
                };
    
                return $http({
                    method: "PATCH",
                    url: "/vlanpools/"+vp._id,
                    data: vp
                });
            }).then(function(response) {
                // console.log(`VLAN Pool Status: ${response.status}`);

                for (var l=0; l<$scope.pseudowires.length; l++) {
                    if (subscription.sp_id == $scope.pseudowires[l].sp_id && subscription.access_node_id == $scope.pseudowires[l].access_node_id) {
                        var pw = $scope.pseudowires[l];
                        // console.log(`Found PW: ${JSON.stringify(pw)}`);
                    };
                };
                // console.log(`PW Subinterfaces length: ${pw.subinterfaces.length}`);
                for (var z=0; z<pw.subinterfaces.length; z++) {
                    // console.log(`subinterface_id: ${subscription.pwsubinterface_id}, ${pw.subinterfaces[z].subinterface_id}`);
                    if (subscription.pwsubinterface_id == pw.subinterfaces[z].subinterface_id) {
                        // console.log(`Found subinterface_id: ${subscription.pwsubinterface_id}`);
                        pw.subinterfaces[z].status = "Free";
                        pw.subinterfaces[z].timestamp = now;
                        pw.subinterfaces[z].subscriber_id = "";
                        pw.subinterfaces[z].subscription_id = "";
                    };
                };

                return $http({
                    method: "PATCH",
                    url: "/pseudowires/"+pw._id,
                    data: pw
                });
            }).then(function(response) {
                // console.log(`PATCH Status of Pseudowire Set: ${response.status}`);
                return $http({
                    method: "DELETE",
                    url: "/db_subscriptions/"+subscription.db_subscription._id
                });
            }).then(function(response) {
                // console.log(`DELETE Status of DB Subscription: ${response.status}`);
                $location.path('/oncustomers');
                $route.reload();
            }, function errorCallback(response) {
                $scope.spinnerStatusDelete = false;
                $scope.errorMessage = true;
                if (response.status == 500) {$scope.errorDetails = response.status +", Internal Server Error"};
                if (response.status == 400) {
                    $scope.errorDetails = response.status +", Bad Request "+JSON.stringify(response.data);
                };
                if (response.status == 403) {$scope.errorDetails = response.status +", Forbidden"};
                if (response.status == 404) {$scope.errorDetails = response.status +", Not Found"};
                if (response.status == 501) {$scope.errorDetails = response.status +", Not Implemented"};
                if (response.status == 502) {$scope.errorDetails = response.status +", Bad Gateway"};
                if (response.status == 503) {$scope.errorDetails = response.status +", Service Unavailable"};
                console.log(`Status: ${response.status}`);
                console.log(`Data: ${JSON.stringify(response)}`);
            }); */
        };

    };

    function allocateVlans(moved_subscriber) {
        for (var z=0; z<$scope.inventory.sps.sp.length; z++) {
            // console.log(`Counter z: ${z}`);
            // console.log(`Looking for services: ${$scope.inventory.sps.sp[z].sp_id}`);
            if ($scope.inventory.sps.sp[z].sp_id == $scope.sp_id) {
                $scope.spServices = $scope.inventory.sps.sp[z].services.service;
                // console.log(`Found services: ${JSON.stringify($scope.spServices)}`);
            };
        };

        for (var l=0; l<$scope.vlanpools.length; l++) {
            if ($scope.sp_id == $scope.vlanpools[l].sp_id && $scope.access_area_id == $scope.vlanpools[l].access_area_id && $scope.access_node_id == $scope.vlanpools[l].access_node_id) {
                var vp = $scope.vlanpools[l];
                // console.log(`Found VLAN Pool: ${JSON.stringify(vp)}`);
            };
        };
        var vlan_mapping = [];
        if (moved_subscriber) {
            var PWPool = matchPWPool();
            var PWResults;
            var pw_sub_if = 0;
            var old_vlan = 100;
        };
        var now = new Date();
        for (var n=0; n<$scope.spServices.length; n++) {
            if ($scope.spServices[n].id == $scope.service_id) {
                var serviceVlans = $scope.spServices[n].vlans;
                var numVlanMappings = $scope.spServices[n].vlans.length;
                console.log(`serviceVlans: ${JSON.stringify(serviceVlans)}, numVlanMappings: ${numVlanMappings}`);
                var outerVlansAllocated = false;
                var j = 0;
                while (!outerVlansAllocated && j<vp.vlans.length) {
                    if (vp.vlans[j].status != "Free") {
                        j = j+8;
                        // console.log(`j: ${j}`);
                    } else {
                        for (var k=0; k<numVlanMappings; k++) {
                            console.log(`j: ${j}, k: ${k} inner_vlan: ${serviceVlans[k].vlan}, outer_vlan: ${vp.vlans[j+k].vlan_id}`);
                            if (moved_subscriber) {
                                PWResults = allocatePWSubInt(PWPool);
                                PWPool = PWResults.updatedPWPool;
                                pw_sub_if = PWResults.selectedPWSubInterface;
                                old_vlan = $scope.subscriptionToMove.vlan_mappings.vlan_mapping[k].outer_vlan;
                            } else {
                                pw_sub_if = 0;
                                old_vlan = vp.vlans[j+k].vlan_id;
                            };
                            vlan_mapping.push({
                                "inner_vlan": serviceVlans[k].vlan,
                                "outer_vlan": vp.vlans[j+k].vlan_id,
                                "old_vlan": old_vlan,
                                "pw_sub_if": pw_sub_if
                            });
                            vp.vlans[j+k].status = "Active";
                            vp.vlans[j+k].subscriber_id = $scope.subscriber_id;
                            vp.vlans[j+k].subscription_id = $scope.name;
                            vp.vlans[j+k].timestamp = now;
                        };
                        var endReserve = j+8;
                        console.log(`j: ${j} k: ${k}, endReserve: ${endReserve}`);
                        for (var o=j+numVlanMappings; o<endReserve; o++) {
                            // console.log(`Setting Reserved VLAN's`);
                            // console.log(`j: ${j} o: ${o}, k: ${k}, endReserve: ${endReserve}`);
                            vp.vlans[o].status = "Reserved";
                            vp.vlans[o].subscriber_id = $scope.subscriber_id;
                            vp.vlans[o].subscription_id = $scope.name;
                            vp.vlans[o].timestamp = now;
                        };
                        outerVlansAllocated = true;
                    };
                };
            };
        };
        // console.log(`VLAN Pool now: ${JSON.stringify(vp)}`);
        return {
            "vlan_mapping": vlan_mapping,
            "updatedVlanpool": vp,
            "updatedPWPool": PWPool
        };
    };

    function allocatePWSubInt(pw) {
        var pwSubIntAllocated = false;
        var z = 0;
        while (!pwSubIntAllocated && z<pw.subinterfaces.length) {
            if (pw.subinterfaces[z].status != "Free") {
                z++;
            } else {
                selectedPWSubInterface = pw.subinterfaces[z].subinterface_id;
                pw.subinterfaces[z].status = "Active";
                pw.subinterfaces[z].timestamp = new Date();
                pw.subinterfaces[z].subscriber_id = $scope.subscriber_id;
                pw.subinterfaces[z].subscription_id = $scope.name;
                pwSubIntAllocated = true;
            };
        };
        return {
            "selectedPWSubInterface": selectedPWSubInterface,
            "updatedPWPool": pw
        };
    };

    function matchPWPool() {
        for (var l=0; l<$scope.pseudowires.length; l++) {
            if ($scope.sp_id == $scope.pseudowires[l].sp_id && $scope.access_node_id == $scope.pseudowires[l].access_node_id) {
                var pw = $scope.pseudowires[l];
                // console.log(`Found PW: ${JSON.stringify(pw)}`);
            };
        };
        return pw;
    };

    function matchDBSubs(subscription_id) {
        var db_subscription = "none";
        for (j=0; j<$scope.db_subscriptions.length; j++) {
            // console.log(`Counter j: ${j}`);
            // console.log(`Looking for subscription_id: ${subscription_id}`);
            if ($scope.db_subscriptions[j].subscription_id == subscription_id) {
                db_subscription = $scope.db_subscriptions[j];
                // console.log(`Found db_subscription: ${$scope.db_subscriptions[j].subscription_id}`);
            };
        };
        return db_subscription;
    }

    function matchAccess(access_area_id) {
        var access_area = "none";
        for (j=0; j<$scope.inventory.access_areas.access_area.length; j++) {
            // console.log(`Counter j: ${j}`);
            // console.log(`Looking for access_area: ${access_area_id}`);
            if ($scope.inventory.access_areas.access_area[j].access_area_id == access_area_id) {
                access_area = $scope.inventory.access_areas.access_area[j];
                // console.log(`Found access_area: ${$scope.inventory.access_areas.access_area[j].access_area_id}`);
            };
        };
        return access_area;
    };

    function matchPE(pe_area_id) {
        var pe_area = "none";
        for (var j=0; j<$scope.inventory.pe_areas.pe_area.length; j++) {
            // console.log(`In Function. Counter j: ${j}`);
            // console.log(`Looking for pe_area: ${pe_area_id}`);
            if ($scope.inventory.pe_areas.pe_area[j].pe_area_id == pe_area_id) {
                pe_area = $scope.inventory.pe_areas.pe_area[j];
                // console.log(`Found pe_area: ${$scope.inventory.pe_areas.pe_area[j].pe_area_id}`);
            };
        };
        return pe_area;
    };

    function matchPOI(poi_area_id) {
        var poi_area = "none";
        for (var j=0; j<$scope.inventory.poi_areas.poi_area.length; j++) {
            // console.log(`Counter j: ${j}`);
            // console.log(`Looking for poi_area: ${poi_area_id}`);
            if ($scope.inventory.poi_areas.poi_area[j].poi_area_id == poi_area_id) {
                poi_area = $scope.inventory.poi_areas.poi_area[j];
                // console.log(`Found poi_area: ${$scope.inventory.poi_areas.poi_area[j].poi_area_id}`);
            };
        };
        return poi_area;
    };

    function matchCPE(cpe_name) {
        var cpe_id = 0;
        for (var j=0; j<$scope.inventory.cpes.cpe.length; j++) {
            // console.log(`Counter j: ${j}`);
            // console.log(`Looking for cpe: ${cpe_name}`);
            if ($scope.inventory.cpes.cpe[j].cpe_name == cpe_name) {
                cpe_id = $scope.inventory.cpes.cpe[j].cpe_id;
                // console.log(`Found cpe_id: ${$scope.inventory.cpes.cpe[j].cpe_id}`);
            };
        };
        return cpe_id;
    };

}])