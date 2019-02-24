angular.module('pgmblty')

.controller('oncustomersCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
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
        // console.log(`PW Sets: ${JSON.stringify($scope.pseudowires)}`);
        $scope.pseudowires = response.data;
        return $http({
            method: "GET",
            url: "/subscriptions"
        });
    }).then(function(collection) {
        $scope.subscriptions = JSON.parse(JSON.stringify(collection.data).replace("open-net-core:open-net-core", "openNetCore")).collection.openNetCore;
        
        $scope.showSubDetails = [];
        for (var i=0; i<$scope.subscriptions.length; i++) {
            // console.log(`Counter i: ${i}`);
            $scope.subscriptions[i].index = i;
            $scope.subscriptions[i].allCollected = false;
            $scope.showSubDetails.push(false);
            for (var j=0; j<$scope.inventory.cpes.cpe.length; j++) {
                // console.log(`Counter j: ${j}`);
                // console.log(`Looking for cpe: ${$scope.subscriptions[i].cpe_name}`);
                if ($scope.inventory.cpes.cpe[j].cpe_name == $scope.subscriptions[i].cpe_name) {
                    $scope.subscriptions[i].cpe_id = $scope.inventory.cpes.cpe[j].cpe_id;
                    // console.log(`Found cpe_id: ${$scope.inventory.cpes.cpe[j].cpe_id}`);
                };
            };
            $scope.subscriptions[i].subscription_id = $scope.subscriptions[i].sp_id+"-Sub"+$scope.subscriptions[i].subscriber_id+"."+$scope.subscriptions[i].cpe_id+"-"+$scope.subscriptions[i].service_id;
            // console.log(`Subscription ID calculated to be: ${$scope.subscriptions[i].subscription_id}`);
            for (j=0; j<$scope.inventory.access_areas.access_area.length; j++) {
                // console.log(`Counter j: ${j}`);
                // console.log(`Looking for access_area: ${$scope.subscriptions[i].access_area_id}`);
                if ($scope.inventory.access_areas.access_area[j].access_area_id == $scope.subscriptions[i].access_area_id) {
                    $scope.subscriptions[i].access_area = $scope.inventory.access_areas.access_area[j];
                    // console.log(`Found access_area: ${$scope.inventory.access_areas.access_area[j].access_area_id}`);
                };
            };
            for (j=0; j<$scope.inventory.pe_areas.pe_area.length; j++) {
                // console.log(`Counter j: ${j}`);
                // console.log(`Looking for pe_area: ${$scope.subscriptions[i].pe_area_id}`);
                if ($scope.inventory.pe_areas.pe_area[j].pe_area_id == $scope.subscriptions[i].pe_area_id) {
                    $scope.subscriptions[i].pe_area = $scope.inventory.pe_areas.pe_area[j];
                    // console.log(`Found pe_area: ${$scope.inventory.pe_areas.pe_area[j].pe_area_id}`);
                };
            };
            for (j=0; j<$scope.inventory.poi_areas.poi_area.length; j++) {
                // console.log(`Counter j: ${j}`);
                // console.log(`Looking for poi_area: ${$scope.subscriptions[i].poi_area_id}`);
                if ($scope.inventory.poi_areas.poi_area[j].poi_area_id == $scope.subscriptions[i].poi_area_id) {
                    $scope.subscriptions[i].poi_area = $scope.inventory.poi_areas.poi_area[j];
                    // console.log(`Found poi_area: ${$scope.inventory.poi_areas.poi_area[j].poi_area_id}`);
                };
            };

            $scope.syncStatusArray = [];

            $http({
                method: "GET",
                url: "/subscriptions/check-sync/"+$scope.subscriptions[i].subscription_id
            }).then(function(response) {
                // console.log(`DATA stringified: ${JSON.stringify(response.data)}`);
                var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-core:output":{"in-sync":', '"sync_output":{"in_sync":'));
                // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
                $scope.syncStatusArray.push(newSyncStatus.sync_output);
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    setTimeout(function(){
        if ($scope.subscriptions == null) {
            console.log(`There are no subscriptions`);
        } else {
            // console.log(`There are some subscriptions`);
            for (var i=0; i<$scope.subscriptions.length; i++) {
                $scope.subscriptions[i].sync_status = $scope.syncStatusArray[i];
            };
            $scope.$digest();
        };
    }, 3000);

    $scope.hoverIn = function(index) {
        $scope.showSubDetails[index] = true;
        if (!$scope.subscriptions[index].allCollected) {    //  && $scope.subscriptions[index].sync_status.in_sync
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
        }
        // console.log($scope.subscriptions);
    };

    $scope.hoverOut = function(index) {
        $scope.showSubDetails[index] = false;
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
            $scope.vlanMappings = [];
            for (var i=0; i<8; i++) {
                $scope.vlanMappings.push({inner_vlan: null, outer_vlan: null});
            };
            $scope.vlanMappingBtnShow = [false,true,false,false,false,false,false,false];
            $scope.vlanMappingShow = [true,false,false,false,false,false,false,false];
            numVMLines = 0;

        } else {
            $scope.newEntry = true;
        };
    };

    $scope.generateSubscription = function() {
        $scope.spinnerStatus = true;
        var subscription_id = $scope.name;
        // console.log(`subscription_id: ${subscription_id}`);

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
        var now = new Date();
        for (var n=0; n<$scope.spServices.length; n++) {
            if ($scope.spServices[n].id == $scope.service_id) {
                var serviceVlans = $scope.spServices[n].vlans;
                var numVlanMappings = $scope.spServices[n].vlans.length;
                // console.log(`serviceVlans: ${JSON.stringify(serviceVlans)}, numVlanMappings: ${numVlanMappings}`);
                var outerVlansAllocated = false;
                var j = 0;
                while (!outerVlansAllocated && j<vp.vlans.length) {
                    if (vp.vlans[j].status != "Free") {
                        j = j+8;
                        // console.log(`j: ${j}`);
                    } else {
                        for (var k=0; k<numVlanMappings; k++) {
                            // console.log(`j: ${j}, k: ${k} inner_vlan: ${serviceVlans[k].vlan}, outer_vlan: ${vp.vlans[j+k].vlan_id}`);
                            vlan_mapping.push({"inner_vlan": serviceVlans[k].vlan, "outer_vlan": vp.vlans[j+k].vlan_id});
                            vp.vlans[j+k].status = "Active";
                            vp.vlans[j+k].subscriber_id = $scope.subscriber_id;
                            vp.vlans[j+k].subscription_id = subscription_id;
                            vp.vlans[j+k].timestamp = now;
                        };
                        var endReserve = j+8;
                        // console.log(`j: ${j} k: ${k}, endReserve: ${endReserve}`);
                        for (var o=j+numVlanMappings; o<endReserve; o++) {
                            // console.log(`Setting Reserved VLAN's`);
                            // console.log(`j: ${j} o: ${o}, k: ${k}, endReserve: ${endReserve}`);
                            vp.vlans[o].status = "Reserved";
                            vp.vlans[o].subscriber_id = $scope.subscriber_id;
                            vp.vlans[o].subscription_id = subscription_id;
                            vp.vlans[o].timestamp = now;
                        };
                        outerVlansAllocated = true;
                    };
                };
            };
        };
        // console.log(`VLAN Pool now: ${JSON.stringify(vp)}`);
        var vlan_mappings = {"vlan_mapping": vlan_mapping};
        // console.log(`vlan_mappings: ${JSON.stringify(vlan_mappings)}`);

        for (var l=0; l<$scope.pseudowires.length; l++) {
            if ($scope.sp_id == $scope.pseudowires[l].sp_id && $scope.access_node_id == $scope.pseudowires[l].access_node_id) {
                var pw = $scope.pseudowires[l];
                // console.log(`Found PW: ${JSON.stringify(pw)}`);
            };
        };
        var pwSubIntAllocated = false;
        var z = 0;
        while (!pwSubIntAllocated && z<pw.subinterfaces.length) {
            if (pw.subinterfaces[z].status != "Free") {
                z++;
            } else {
                selectedPWSubInterface = pw.subinterfaces[z].subinterface_id;
                pw.subinterfaces[z].status = "Active";
                pw.subinterfaces[z].timestamp = now;
                pw.subinterfaces[z].subscriber_id = $scope.subscriber_id;
                pw.subinterfaces[z].subscription_id = subscription_id;
                pwSubIntAllocated = true;
            };
        };
        // console.log(`PW now: ${JSON.stringify(pw)}`);

        var data = {
            "name": $scope.name,
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
            "vlan_mappings": vlan_mappings
        };
        // console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: 'POST',
            url: '/subscriptions',
            data: data
        }).then(function(response) {
            // console.log(`open-net-access Status: ${response.status}`);
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
            $location.path('/oncustomers');
            $route.reload();
        }, function errorCallback(response) {
            $scope.spinnerStatus = false;
            $scope.errorMessage = true;
            if (response.status == 500) {$scope.errorDetails = response.status +", Internal Server Error"};
            if (response.status == 400) {$scope.errorDetails = response.status +", Bad Request"};
            if (response.status == 403) {$scope.errorDetails = response.status +", Forbidden"};
            if (response.status == 404) {$scope.errorDetails = response.status +", Not Found"};
            if (response.status == 501) {$scope.errorDetails = response.status +", Not Implemented"};
            if (response.status == 502) {$scope.errorDetails = response.status +", Bad Gateway"};
            if (response.status == 503) {$scope.errorDetails = response.status +", Service Unavailable"};
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.editSubscription = function(subscription) {
        $window.alert("This function is not implemented yet.");
        // $scope.editEntry = true;
        // $scope.editedSubscription = subscription;
    };

    $scope.editToggle = function() {
        $scope.editEntry = false;
    };

    $scope.unDeploySubscription = function(subscription) {
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
            // console.log(`PATCH Status of Pseudowire Set: ${response.status}`);
            $scope.spinnerStatusDelete = false;
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.reDeploySubscription = function(subscription) {
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
            // console.log(`PATCH Status of Pseudowire Set: ${response.status}`);
            $scope.spinnerStatusDelete = false;
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteSubscription = function(subscription) {

        if ($window.confirm('Please confirm that you want to delete the subscription '+subscription.subscription_id)) {
            $scope.spinnerStatusDelete = true;
            var now = new Date();

            $http({
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
                $location.path('/oncustomers');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

}])