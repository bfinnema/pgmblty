angular.module('pgmblty')

.controller('onpoiareasCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET PE Areas section.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    
    $http({
        method: "GET",
        url: "/inventory/poiareas"
    }).then(function(response) {
        $scope.collection = JSON.parse(JSON.stringify(response.data).replace("open-net-access:poi_area", "poi_area")).poi_area;
        // console.log(`POI Area's: ${JSON.stringify($scope.collection)}`);
        // console.log(`POI Area: ${$scope.collection[0].poi_area_id}`);
        return $http({
            method: "GET",
            url: "/deviceservices/devices"
        });
    }).then(function(response) {
        // console.log(JSON.stringify(response.data));
        devicedetails = JSON.parse(JSON.stringify(response.data).replace("tailf-ncs:devices", "devices")).devices.device;
        // console.log(`Devicedetails: ${JSON.stringify($scope.devicedetails)}`);
        // console.log(`Devices Status: ${response.status}`);
        var devices = [];
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
            $scope.name = null;
            $scope.poi_node_id = null;
            $scope.to_pe_if = null;
            $scope.to_sp_if = null;
            $scope.poi_if = null;
            $scope.poi_area_description = null;
        } else {
            $scope.newEntry = true;
        };
    };

    $scope.generateItem = function() {

        var data = {
            "poi_areas": {
                "poi_area": [
                    {
                        "poi_area_id": $scope.poi_area_id,
                        "poi_area_description": $scope.description,
                        "node": {
                            "poi_node_id": $scope.poi_node_id,
                            "to_pe_if": $scope.to_pe_if,
                            "to_sp_if": $scope.to_sp_if,
                            "poi_if": $scope.poi_if,
                            "poi_pwhe_ipaddress": $scope.poi_pwhe_ipaddress
                        }
                    }
                ]
            }
        }
        // console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: "POST",
            url: "/inventory/poiareas",
            data: data
        }).then(function(response) {
            // console.log(`Status: ${response.status}`);
            $location.path('/onpoiareas');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.editItem = function(item) {
        $window.alert("This function is not implemented yet.");
        // $scope.editEntry = true;
        // $scope.editedItem = item;
    };

    $scope.editToggle = function() {
        $scope.editEntry = false;
    };

    $scope.deleteItem = function(item) {

        if ($window.confirm('Please confirm that you want to delete the POI Area '+item.poi_area_id)) {
            $http({
                method: "DELETE",
                url: "/inventory/poiareas/"+item.poi_area_id
            }).then(function(response) {
                $location.path('/onpoiareas');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };
    };
}])