angular.module('pgmblty')

.controller('oncustomersCtrl', ['$scope', '$http', '$window', '$route', '$location', function($scope, $http, $window, $route, $location) {
    // console.log(`You are in OpenNET Subscription Splash Screen.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    $scope.showAccessNodes = false;
    $scope.showAccessInterface = false;
    
    var username = "admin";
    var password = "admin"
    var host = "10.101.1.211";
    var hostport = "8080";
    var core_path = "/api/running/open-net-access/open-net-core?deep";
    var inventory_path = "/api/running/open-net-access/inventory?deep";
    var core_url = "http://"+host+":"+hostport+core_path;
    var inventory_url = "http://"+host+":"+hostport+inventory_path;
    // console.log(`Core url: ${core_url}`);
    // console.log(`Inventory url: ${inventory_url}`);
    var method = "GET";
    var auth = $window.btoa("admin:admin");
    // console.log(`Encoded Authentication: ${auth}`);

    $http({
        method: method,
        url: inventory_url,
        headers: {
            'Content-Type': 'application/vnd.yang.data+json',
            'Accept': 'application/vnd.yang.data+json',
            'Authorization': 'Basic '+auth
        }
    }).then(function(inventory) {
        var strInventory = JSON.stringify(inventory.data);
        var modInventory = strInventory.replace("open-net-access:inventory", "inventory");
        var newInventory = JSON.parse(modInventory);
        $scope.inventory = newInventory.inventory;
        // console.log(`INVENTORY: ${JSON.stringify($scope.inventory)}`);
        // console.log(`SP: ${JSON.stringify($scope.inventory.sps.sp[0].sp_id)}`);
        return $http({
            method: method,
            url: core_url,
            headers: {
                'Content-Type': 'application/vnd.yang.data+json',
                'Accept': 'application/vnd.yang.collection+json',
                'Authorization': 'Basic '+auth
            }
        });
    }).then(function(collection) {
        var strCollection = JSON.stringify(collection.data);
        var modCollection = strCollection.replace("open-net-core:open-net-core", "openNetCore");
        var newCollection = JSON.parse(modCollection);
        $scope.subscriptions = newCollection.collection.openNetCore;
        // console.log($scope.subscriptions);
        // console.log(`NAME: ${$scope.subscriptions[0].name}`);
        // console.log(`Access Area: ${$scope.subscriptions[0].access_area_id}`);
        // console.log(`PE Area: ${$scope.subscriptions[0].pe_area_id}`);
        // console.log(`POI Area: ${$scope.subscriptions[0].poi_area_id}`);
        // console.log(`SP: ${$scope.subscriptions[0].sp_id}`);
        
        $scope.showSubDetails = [];
        for (var i=0; i<$scope.subscriptions.length; i++) {
            // console.log(`Counter i: ${i}`);
            $scope.subscriptions[i].index = i;
            $scope.subscriptions[i].allCollected = false;
            $scope.showSubDetails.push(false);
            $scope.subscriptions[i].subscription_id = $scope.subscriptions[i].sp_id+"-"+$scope.subscriptions[i].subscriber_id+"-"+$scope.subscriptions[i].service_id;
            // console.log(`Subscription ID calculated to be: ${$scope.subscriptions[i].subscription_id}`);
            for (var j=0; j<$scope.inventory.access_areas.access_area.length; j++) {
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
            // console.log(`SUBSCRIPTION string: ${JSON.stringify($scope.subscriptions[i])}`);
            // var strSubscription = JSON.stringify($scope.subscriptions[i]);
            // var modSubscription = JSON.stringify($scope.subscriptions[i]).replace('"check-sync":', '"check_sync":');
            // console.log(`SUBSCRIPTION modified: ${modSubscription}`);
            var newSubsciption = JSON.parse(JSON.stringify($scope.subscriptions[i]).replace('"check-sync":', '"check_sync":'));
            var path = newSubsciption.operations.check_sync;
            var url = "http://"+host+":"+hostport+path;
            // console.log(`url: ${url}`);
            var method = "POST";
            var auth = $window.btoa("admin:admin");

            $http({
                method: method,
                url: url,
                headers: {
                    'Content-Type': 'application/vnd.yang.data+json',
                    'Accept': 'application/vnd.yang.data+json',
                    'Authorization': 'Basic '+auth
                }
            }).then(function(response) {
                // console.log(`DATA stringified: ${JSON.stringify(response.data)}`);
                var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-core:output":{"in-sync":', '"sync_output":{"in_sync":'));
                // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
                $scope.syncStatusArray.push(newSyncStatus.sync_output);
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
        // console.log($scope.subscriptions);
        // console.log(`showSubDetails: ${$scope.showSubDetails[0]}`);

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

        $http({
            method: "GET",
            url: "/vlanpools"
        }).then(function(response) {
            // console.log(`VLAN Pools Status: ${response.status}`);
            $scope.vlanpools = response.data;
            // console.log(`VLAN Pools: ${JSON.stringify($scope.vlanpools)}`);
            return $http({
                method: "GET",
                url: "/pseudowires"
            });
        }).then(function(response) {
            // console.log(`PW Sets Status: ${response.status}`);
            $scope.pseudowires = response.data;
            // console.log(`PW Sets: ${JSON.stringify($scope.pseudowires)}`);
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    }, 3000);

    $scope.hoverIn = function(index) {
        $scope.showSubDetails[index] = true;
        if (!$scope.subscriptions[index].allCollected) {    //  && $scope.subscriptions[index].sync_status.in_sync
            // console.log(`Getting the DETAILS`);
            $http({
                method: method,
                url: "http://"+host+":"+hostport+"/api/running/newSubAccess/"+$scope.subscriptions[index].subscription_id+"?deep",
                headers: {
                    'Content-Type': 'application/vnd.yang.data+json',
                    'Accept': 'application/vnd.yang.data+json',
                    'Authorization': 'Basic '+auth
                }
            }).then(function(subAccess) {
                $scope.newSubAccess = JSON.parse(JSON.stringify(subAccess.data).replace("newSubAccess:newSubAccess", "newSubAccess")).newSubAccess;
                // console.log(`newSubAccess: ${JSON.stringify($scope.newSubAccess)}`);
                $scope.subscriptions[index].newSubAccess = $scope.newSubAccess;
                // console.log(`Stringified: ${JSON.stringify($scope.subscriptions[index].newSubAccess)}`);
                return $http({
                    method: method,
                    url: "http://"+host+":"+hostport+"/api/running/newSubPE/"+$scope.subscriptions[index].subscription_id+"?deep",
                    headers: {
                        'Content-Type': 'application/vnd.yang.data+json',
                        'Accept': 'application/vnd.yang.data+json',
                        'Authorization': 'Basic '+auth
                    }
                });
            }).then(function(subPE) {
                $scope.newSubPE = JSON.parse(JSON.stringify(subPE.data).replace("newSubPE:newSubPE", "newSubPE")).newSubPE;
                // console.log(`newSubPE: ${JSON.stringify($scope.newSubPE)}`);
                $scope.subscriptions[index].newSubPE = $scope.newSubPE;
                return $http({
                    method: method,
                    url: "http://"+host+":"+hostport+"/api/running/newSubPOI/"+$scope.subscriptions[index].subscription_id+"?deep",
                    headers: {
                        'Content-Type': 'application/vnd.yang.data+json',
                        'Accept': 'application/vnd.yang.data+json',
                        'Authorization': 'Basic '+auth
                    }
                });
            }).then(function(subPOI) {
                $scope.newSubPOI = JSON.parse(JSON.stringify(subPOI.data).replace("newSubPOI:newSubPOI", "newSubPOI")).newSubPOI;
                // console.log(`newSubPOI: ${JSON.stringify($scope.newSubPOI)}`);
                $scope.subscriptions[index].newSubPOI = $scope.newSubPOI;

                var newSubsciption = JSON.parse(JSON.stringify($scope.subscriptions[index]).replace('"check-sync":', '"check_sync":'));
                var path = newSubsciption.operations.check_sync;
                var sync_url = "http://"+host+":"+hostport+path;
                // console.log(`url: ${sync_url}`);

                return $http({
                    method: "POST",
                    url: sync_url,
                    headers: {
                        'Content-Type': 'application/vnd.yang.data+json',
                        'Accept': 'application/vnd.yang.data+json',
                        'Authorization': 'Basic '+auth
                    }
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
            var newSubsciption = JSON.parse(JSON.stringify($scope.subscriptions[index]).replace('"check-sync":', '"check_sync":'));
            var path = newSubsciption.operations.check_sync;
            var sync_url = "http://"+host+":"+hostport+path;
            // console.log(`url: ${sync_url}`);

            $http({
                method: "POST",
                url: sync_url,
                headers: {
                    'Content-Type': 'application/vnd.yang.data+json',
                    'Accept': 'application/vnd.yang.data+json',
                    'Authorization': 'Basic '+auth
                }
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

    $scope.VMArray = [0,1,2,3,4,5,6,7];
    $scope.vlanMappings = [];
    for (var i=0; i<8; i++) {
        $scope.vlanMappings.push({inner_vlan: null, outer_vlan: null});
    };
    $scope.vlanMappingBtnShow = [false,true,false,false,false,false,false,false];
    $scope.vlanMappingShow = [true,false,false,false,false,false,false,false];
    var numVMLines = 0;

    $scope.showVMLine = function() {
        // console.log("Entering showVMline. numVMLines: "+numVMLines);
        if ($scope.vlanMappings[numVMLines]) {
            // console.log("numVMLines: "+numVMLines+", vlanMapping: "+$scope.vlanMappings[numVMLines].inner_vlan+", "+$scope.vlanMappings[numVMLines].outer_vlan);
            numVMLines = numVMLines + 1;
            $scope.numVMLines = numVMLines;
            $scope.vlanMappingShow[numVMLines] = true;
            $scope.vlanMappingBtnShow[numVMLines] = false;
            $scope.vlanMappingBtnShow[numVMLines+1] = true;
        }
        else {
            $window.alert("You must fill in the previous field.");
        };
    };
    
    $scope.removeVlanMapping = function(orgNum) {
        // console.log("Entering removevlanMapping. numVMLines: "+numVMLines);
        for (var i=orgNum; i<numVMLines; i++) {
            $scope.vlanMappings[i] = $scope.vlanMappings[i+1];
        };
        $scope.vlanMappings[numVMLines] = "";
        $scope.vlanMappingShow[numVMLines] = false;
        $scope.vlanMappingBtnShow[numVMLines] = true;
        $scope.vlanMappingBtnShow[numVMLines+1] = false;
        numVMLines -= 1;
        $scope.numVMLines = numVMLines;
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
            $http({
                method: "GET",
                url: "/vlanpools"
            }).then(function(response) {
                // console.log(`VLAN Pools Status: ${response.status}`);
                $scope.vlanpools = response.data;
                // console.log(`VLAN Pools: ${JSON.stringify($scope.vlanpools)}`);
                return $http({
                    method: "GET",
                    url: "/pseudowires"
                });
            }).then(function(response) {
                // console.log(`PW Sets Status: ${response.status}`);
                $scope.pseudowires = response.data;
                // console.log(`PW Sets: ${JSON.stringify($scope.pseudowires)}`);
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });

        };
    };

    $scope.generateSubscription = function() {
/* 
        var vlan_mapping = [];
        for (var n=0; n<$scope.vlanMappings.length; n++) {
            if ($scope.vlanMappings[n].inner_vlan > 10 && $scope.vlanMappings[n].outer_vlan > 10) {
                vlan_mapping.push($scope.vlanMappings[n]);
            };
        };
 */
        var subscription_id = $scope.sp_id+"-"+$scope.subscriber_id+"-"+$scope.service_id;

        for (var l=0; l<$scope.vlanpools.length; l++) {
            if ($scope.sp_id == $scope.vlanpools[l].sp_id && $scope.access_area_id == $scope.vlanpools[l].access_area_id && $scope.access_node_id == $scope.vlanpools[l].access_node_id) {
                var vp = $scope.vlanpools[l];
                // console.log(`Found VLAN Pool: ${JSON.stringify(vp)}`);
            };
        };
        var vlan_mapping = [];
        var now = new Date();
        for (var n=0; n<$scope.inventory.services.service.length; n++) {
            if ($scope.inventory.services.service[n].id == $scope.service_id) {
                var serviceVlans = $scope.inventory.services.service[n].vlans;
                var numVlanMappings = $scope.inventory.services.service[n].vlans.length;
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
            "open-net-core:open-net-core": {
                "name": $scope.name,
                "subscriber_id": $scope.subscriber_id,
                "sp_id": $scope.sp_id,
                "service_id": $scope.service_id,
                "access_area_id": $scope.access_area_id,
                "access_node_id": $scope.access_node_id,
                "access_if": $scope.access_if,
                "pe_area_id": $scope.pe_area_id,
                "poi_area_id": $scope.poi_area_id,
                "pwsubinterface_id": selectedPWSubInterface,
                "vlan_mappings": vlan_mappings
            }
        };
        // console.log(`DATA: ${JSON.stringify(data)}`);

        var path = "/api/running/open-net-access";
        var url = "http://"+host+":"+hostport+path;
        // console.log(`url: ${url}`);
        var method = "POST";
        var auth = $window.btoa("admin:admin");
        // console.log(`Encoded Authentication: ${auth}`);

        $http({
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/vnd.yang.data+json',
                'Accept': 'application/vnd.yang.data+json',
                'Authorization': 'Basic '+auth
            },
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
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.editSubscription = function(subscription) {
        $scope.editEntry = true;
        $scope.editedSubscription = subscription;
    };

    $scope.editToggle = function() {
        $scope.editEntry = false;
    };

    $scope.unDeploySubscription = function(subscription) {

        var path = JSON.parse(JSON.stringify(subscription).replace('"un-deploy":', '"un_deploy":')).operations.un_deploy;
        // var path = newSubsciption.operations.un_deploy;
        var url = "http://"+host+":"+hostport+path;
        // console.log(`url: ${url}`);
        var method = "POST";
        var auth = $window.btoa("admin:admin");

        $http({
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/vnd.yang.data+json',
                'Accept': 'application/vnd.yang.data+json',
                'Authorization': 'Basic '+auth
            }
        }).then(function(response) {
            var path = JSON.parse(JSON.stringify(subscription).replace('"check-sync":', '"check_sync":')).operations.check_sync;
            var url = "http://"+host+":"+hostport+path;
            // console.log(`url: ${url}`);
            var method = "POST";
            var auth = $window.btoa("admin:admin");
            return $http({
                method: method,
                url: url,
                headers: {
                    'Content-Type': 'application/vnd.yang.data+json',
                    'Accept': 'application/vnd.yang.data+json',
                    'Authorization': 'Basic '+auth
                }
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
            var now = new Date();
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
                    console.log(`Found PW: ${JSON.stringify(pw)}`);
                };
            };
            // console.log(`PW Subinterfaces length: ${pw.subinterfaces.length}`);
            for (var z=0; z<pw.subinterfaces.length; z++) {
                // console.log(`subinterface_id: ${subscription.pwsubinterface_id}, ${pw.subinterfaces[z].subinterface_id}`);
                if (subscription.pwsubinterface_id == pw.subinterfaces[z].subinterface_id) {
                    console.log(`Found subinterface_id: ${subscription.pwsubinterface_id}`);
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

            // $location.path('/oncustomers');
            // $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.reDeploySubscription = function(subscription) {

        var path = JSON.parse(JSON.stringify(subscription).replace('"re-deploy":', '"re_deploy":')).operations.re_deploy;
        // var path = newSubsciption.operations.re_deploy;
        var url = "http://"+host+":"+hostport+path;
        // console.log(`url: ${url}`);
        var method = "POST";
        var auth = $window.btoa("admin:admin");

        $http({
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/vnd.yang.data+json',
                'Accept': 'application/vnd.yang.data+json',
                'Authorization': 'Basic '+auth
            }
        }).then(function(response) {
            var path = JSON.parse(JSON.stringify(subscription).replace('"check-sync":', '"check_sync":')).operations.check_sync;
            var url = "http://"+host+":"+hostport+path;
            // console.log(`url: ${url}`);
            var method = "POST";
            var auth = $window.btoa("admin:admin");
            return $http({
                method: method,
                url: url,
                headers: {
                    'Content-Type': 'application/vnd.yang.data+json',
                    'Accept': 'application/vnd.yang.data+json',
                    'Authorization': 'Basic '+auth
                }
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
            var now = new Date();
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
                    console.log(`Found PW: ${JSON.stringify(pw)}`);
                };
            };
            // console.log(`PW Subinterfaces length: ${pw.subinterfaces.length}`);
            for (var z=0; z<pw.subinterfaces.length; z++) {
                // console.log(`subinterface_id: ${subscription.pwsubinterface_id}, ${pw.subinterfaces[z].subinterface_id}`);
                if (subscription.pwsubinterface_id == pw.subinterfaces[z].subinterface_id) {
                    console.log(`Found subinterface_id: ${subscription.pwsubinterface_id}`);
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
            // console.log(`Status: ${response.status}`);

            // $location.path('/oncustomers');
            // $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteSubscription = function(subscription) {

        if ($window.confirm('Please confirm that you want to delete the subscription '+subscription.subscription_id)) {
            var now = new Date();
            var path = "/api/running/open-net-access/open-net-core:open-net-core/"+subscription.name;
            var url = "http://"+host+":"+hostport+path;
            // console.log(`url: ${url}`);
            var method = "DELETE";
            var auth = $window.btoa("admin:admin");

            $http({
                method: method,
                url: url,
                headers: {
                    'Content-Type': 'application/vnd.yang.data+json',
                    'Accept': 'application/vnd.yang.data+json',
                    'Authorization': 'Basic '+auth
                }
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