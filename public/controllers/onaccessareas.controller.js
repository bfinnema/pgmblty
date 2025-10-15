angular.module('pgmblty')

.controller('onaccessareasCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET Access Areas section.`);

    $scope.newEntry = false;
    $scope.newService = false;
    
    $scope.vlanArray = [0,1,2,3,4,5,6,7];
    $scope.vlans = [];
    for (var i=0; i<8; i++) {
        $scope.vlans.push({vlan: null});
    };
    $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
    $scope.vlanShow = [true,false,false,false,false,false,false,false];
    var numVlanLines = 0;
    $scope.devices = [{"device_id": "c4500"}];

    $http({
        method: "GET",
        url: "/inventory/accessareas"
    }).then(function(response) {
        $scope.collection = JSON.parse(JSON.stringify(response.data).replace("open-net-access:access_area", "access_area")).access_area;
        // console.log(`Access Areas's: ${JSON.stringify($scope.collection)}`);
        // console.log(`Access Area: ${$scope.collection[0].access_area_id}`);
        return $http({
            method: "GET",
            url: "/deviceservices/devices"
        });
    }).then(function(response) {
        console.log(JSON.stringify(response.data));
        devicedetails = JSON.parse(JSON.stringify(response.data).replace("tailf-ncs:devices", "devices")).devices.device;
        // console.log(`Devicedetails: ${JSON.stringify($scope.devicedetails)}`);
        // console.log(`Devices Status: ${response.status}`);
        devices = [];
        for (var i=0; i<devicedetails.length; i++) {
            devices.push({"device_id": devicedetails[i].name});
        };
        // console.log(`Devices: ${JSON.stringify(devices)}`);
        $scope.devices = devices;
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

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

    $scope.addServiceToggle = function(editItem) {
        if ($scope.newService) {
            $scope.newService = false;
            $scope.service_id = null;
            $scope.service_description = null;
            $scope.vlans = [];
            for (var i=0; i<8; i++) {
                $scope.vlans.push({vlan: null});
            };
            $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
            $scope.vlanShow = [true,false,false,false,false,false,false,false];
            numVlanLines = 0;
        } else {
            $scope.newService = true;
            $scope.editItem = editItem;
        };
    };

    $scope.generateItem = function() {

        var data = {
            "access_areas": {
                "access_area": [
                    {
                        "access_area_id": $scope.access_area_id,
                        "access_area_description": $scope.description
                    }
                ]
            }
        }
        console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: "POST",
            url: "/inventory/accessareas",
            data: data
        }).then(function(response) {
            console.log(`Post Access Area status: ${response.status}`);
            $location.path('/onaccessareas');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteItem = function(item) {

        if ($window.confirm('Please confirm that you want to delete the access area '+item.access_area_id)) {
            $http({
                method: "DELETE",
                url: "/inventory/accessareas/"+item.access_area_id
            }).then(function(response) {
                $location.path('/onaccessareas');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

    $scope.showVlanLine = function() {
        // console.log("Entering showVlanline. numVlanLines: "+numVlanLines);
        if ($scope.vlans[numVlanLines].vlan != null) {
            // console.log("numVlanLines: "+numVlanLines+", vlan: "+$scope.vlans[numVlanLines].vlan);
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

        var myPorts = [];
        for (var i=0; i<=$scope.numVlanLines; i++) {
            myPorts.push({access_if: $scope.vlans[i].vlan});
            // myPorts.push($scope.vlans[i]);
        };
        // console.log(`myPorts: ${JSON.stringify(myPorts)}`);
        // console.log(`Node to add access area ${$scope.editItem.access_area_id} ${$scope.editItem}`);

        var data = {
            "access_areas": {
                "access_area": [
                    {
                        "access_area_id": $scope.editItem.access_area_id,
                        "nodes": {
                            "node": [
                                {
                                    "access_node_id": $scope.access_node_id,
                                    "interfaces": {
                                        "interface": myPorts
                                    },
                                    "s_vlan_num": $scope.s_vlan_num
                                }
                            ]
                        }
                    }
                ]
            }
        }
        // console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: "POST",
            url: "/inventory/accessareas/addnode",
            data: data
        }).then(function(response) {
            console.log(`Post Access Area add Node status: ${response.status}`);
            $location.path('/onaccessareas');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteService = function(access_area_id, access_node_id) {

        if ($window.confirm('Please confirm that you want to delete the node '+access_node_id+' for Acess Area '+access_area_id)) {
            $http({
                method: "DELETE",
                url: "/inventory/accessareas/deletenode/"+access_area_id+"/"+access_node_id
            }).then(function(response) {
                $location.path('/onaccessareas');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

}])