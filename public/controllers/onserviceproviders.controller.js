angular.module('pgmblty')

.controller('onserviceprovidersCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET Service Provider section.`);

    $scope.newEntry = false;
    $scope.newService = false;
    $scope.newAccessNode = false;
    $scope.showAccessNodes = false;
    $scope.spinnerStatus = false;
    
    $scope.vlanArray = [0,1,2,3,4,5,6,7];
    $scope.vlans = [];
    for (var i=0; i<8; i++) {
        $scope.vlans.push({vlan: null, multicast: null});
    };
    $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
    $scope.vlanShow = [true,false,false,false,false,false,false,false];
    var numVlanLines = 0;

    $http({
        method: "GET",
        url: "/inventory"
    }).then(function(response) {
        $scope.inventory = JSON.parse(JSON.stringify(response.data).replace("open-net-access:inventory", "inventory")).inventory;
        // console.log(`Inventory: ${JSON.stringify($scope.inventory)}`);
        // console.log(`SP: ${$scope.inventory.sps.sp[0].sp_id}`);
        $scope.sps = $scope.inventory.sps.sp;
        // console.log(`SP's: ${JSON.stringify($scope.sps)}`);
        
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $scope.listAccessNodes = function() {
        if ($scope.inventory.access_areas) {
            for (var i=0; i<$scope.inventory.access_areas.access_area.length; i++) {
                // console.log(`access_area_id: ${$scope.inventory.access_areas.access_area[i].access_area_id}`);
                if ($scope.access_area_id == $scope.inventory.access_areas.access_area[i].access_area_id) {
                    if ($scope.inventory.access_areas.access_area[i].nodes) {
                        $scope.access_nodes = $scope.inventory.access_areas.access_area[i].nodes.node;
                        // console.log(`Found: ${JSON.stringify($scope.access_nodes)}`);
                        $scope.showAccessNodes = true;
                    } else {
                        $window.alert("No Access Nodes have been defined for this Access Area. Do that under 'Access Areas'.");
                        $scope.showAccessNodes = false;
                        $scope.access_node_id = null;
                    };
                };
            };
        } else {
            $window.alert("No Access Areas have been defined. Do that under 'Access Areas'.");
            $scope.showAccessNodes = false;
            $scope.access_node_id = null;
        };
    };

    $scope.newEntryToggle = function() {
        if ($scope.newEntry) {
            $scope.newEntry = false;
            $scope.sp_id = null;
            $scope.s_vlan_offset = null;
            $scope.mvr_vlan = null;
        } else {
            $scope.newEntry = true;
        };
    };

    $scope.addServiceToggle = function(editSP) {
        if ($scope.newService) {
            $scope.newService = false;
            $scope.service_id = null;
            $scope.service_description = null;
            $scope.vlans = [];
            for (var i=0; i<8; i++) {
                $scope.vlans.push({vlan: null, multicast: null});
            };
            $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
            $scope.vlanShow = [true,false,false,false,false,false,false,false];
            numVlanLines = 0;
        } else {
            $scope.newService = true;
            $scope.editSP = editSP;
        };
    };

    $scope.addAccessNodeToggle = function(editSP) {
        if ($scope.newAccessNode) {
            $scope.newAccessNode = false;
            $scope.name = null;
            $scope.access_area_id = null;
            $scope.access_node_id = null;
            $scope.pe_area_id = null;
            $scope.poi_area_id = null;
            $scope.vlanpool_start = null;
            $scope.vlanpool_stop = null;
        } else {
            $scope.newAccessNode = true;
            $scope.editSP = editSP;
        };
    };

    $scope.generateItem = function() {

        var data = {
            "sps": {
                "sp": [
                    {
                        "sp_id": $scope.sp_id,
                        "s_vlan_offset": $scope.s_vlan_offset,
                        "mvr_vlan": $scope.mvr_vlan,
                    }
                ]
            }
        };
        // console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: "POST",
            url: "/inventory/sps",
            data: data
        }).then(function(response) {
            console.log(`Post SP status: ${response.status}`);
            $location.path('/onserviceproviders');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteItem = function(item) {

        if ($window.confirm('Please confirm that you want to delete the service provider '+item.sp_id)) {
            $http({
                method: "DELETE",
                url: "/inventory/sps/"+item.sp_id
            }).then(function(response) {
                $location.path('/onserviceproviders');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

    $scope.showVlanLine = function() {
        // console.log("Entering showVMline. numVlanLines: "+numVlanLines);
        if ($scope.vlans[numVlanLines].vlan != null) {
            // console.log("numVlanLines: "+numVlanLines+", vlan: "+$scope.vlans[numVlanLines].vlan+", "+$scope.vlans[numVlanLines].multicast);
            if (!$scope.vlans[numVlanLines].multicast) {$scope.vlans[numVlanLines].multicast = false};
            // console.log("numVlanLines: "+numVlanLines+", vlan: "+$scope.vlans[numVlanLines].vlan+", "+$scope.vlans[numVlanLines].multicast);
            numVlanLines++;
            $scope.numVlanLines = numVlanLines;
            $scope.vlanShow[numVlanLines] = true;
            $scope.vlanBtnShow[numVlanLines] = false;
            $scope.vlanBtnShow[numVlanLines+1] = true;
        }
        else {
            $window.alert("You must fill in the previous field");
        };
    };
    
    $scope.removeVlan = function(orgNum) {
        // console.log("Entering removevlan. numVlanLines: "+numVlanLines);
        for (var i=orgNum; i<numVlanLines; i++) {
            $scope.vlans[i] = $scope.vlans[i+1];
        };
        $scope.vlans[numVlanLines] = "";
        $scope.vlanShow[numVlanLines] = false;
        $scope.vlanBtnShow[numVlanLines] = true;
        $scope.vlanBtnShow[numVlanLines+1] = false;
        numVlanLines -= 1;
        $scope.numVlanLines = numVlanLines;
    };

    $scope.generateService = function() {

        if (!$scope.vlans[numVlanLines].multicast) {$scope.vlans[numVlanLines].multicast = false};
        var myVlans = [];
        for (var i=0; i<=$scope.numVlanLines; i++) {
            myVlans.push($scope.vlans[i]);
        };
        // console.log(`myVlans: ${JSON.stringify(myVlans)}`);
        // console.log(`SP to add service ${$scope.editSP.sp_id} ${$scope.editSP}`);

        var data = {
            "sps": {
                "sp": [
                    {
                        "sp_id": $scope.editSP.sp_id,
                        "services": {
                            "service": [
                                {
                                    "id": $scope.service_id,
                                    "qos_profile_in": "220M_TDC_UNI_IN",
                                    "qos_profile_out": "220M_TDC_UNI_OUT",
                                    "service_description": $scope.service_description,
                                    "vlans": myVlans
                                }
                            ]
                        }
                    }
                ]
            }
        };
        // console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: "POST",
            url: "/inventory/sps/addservice",
            data: data
        }).then(function(response) {
            // console.log(`Post SP add Service status: ${response.status}`);
            $location.path('/onserviceproviders');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteService = function(sp_id, service_id) {

        if ($window.confirm('Please confirm that you want to delete the service '+service_id+' for SP '+sp_id)) {
            $http({
                method: "DELETE",
                url: "/inventory/sps/deleteservice/"+sp_id+"/"+service_id
            }).then(function(response) {
                $location.path('/onserviceproviders');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

    $scope.generateNode = function() {

        $scope.spinnerStatus = true;

        var vlanpool_id = $scope.editSP.sp_id + '_' + $scope.access_node_id + '_' + Math.floor(Math.random() * 1000);
        var data = {
            "name": $scope.name,
            "sp_id": $scope.editSP.sp_id,
            "poi_area_id": $scope.poi_area_id,
            "pe_area_id": $scope.pe_area_id,
            "access_area_id": $scope.access_area_id,
            "access_node_id": $scope.access_node_id,
            "vlanpool_id": vlanpool_id
        };
        // console.log(`DATA: ${JSON.stringify(data)}`);

        var now = new Date();
        var vlans = [];
        for (var v=$scope.vlanpool_start; v<=$scope.vlanpool_stop; v++) {
            vlans.push({"vlan_id": v, "status": "Free", "timestamp": now, "subscriber_id": "", "subscription_id": ""})
        };
        // console.log(`VLANS: ${JSON.stringify(vlans)}`);

        var vlanpool = {
            "vlanpool_id": vlanpool_id,
            "vlanpool_description": 'VLAN Pool for SP ' + $scope.editSP.sp_id + ', Access Area ' + $scope.access_area_id + ', Node ' + $scope.access_node_id + '.',
            "sp_id": $scope.editSP.sp_id,
            "access_area_id": $scope.access_area_id,
            "access_node_id": $scope.access_node_id,
            "vlans": vlans
        };
        // console.log(`DATA: ${JSON.stringify(vlanpool)}`);

        $http({
            method: "POST",
            url: "/accessswitchandsp",
            data: data
        }).then(function(response) {
            // console.log(`accessswitchandsp status: ${response.status}`);
            return $http({
                method: "POST",
                url: "/vlanpools",
                data: vlanpool
            });
        }).then(function(response) {
            // console.log(`vlanpool status: ${response.status}`);
            $location.path('/onserviceproviders');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteNode = function(sp_id, access_node_and_sp_service_id, vlanpool_id) {
        if ($window.confirm('Please confirm that you want to delete the access node for service provider,  '+sp_id+', service id '+access_node_and_sp_service_id)) {
            $scope.spinnerStatus = true;
            $http({
                method: "DELETE",
                url: "/accessswitchandsp/"+access_node_and_sp_service_id
            }).then(function(response) {
                console.log(`accessswitchandsp status: ${response.status}`);
                return $http({
                    method: "DELETE",
                    url: "/vlanpools/by_vlanpool_id/"+vlanpool_id
                });
            }).then(function(response) {
                console.log(`vlanpool status: ${response.status}`);
                $location.path('/onserviceproviders');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };

}])