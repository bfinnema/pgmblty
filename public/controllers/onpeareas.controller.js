angular.module('pgmblty')

.controller('onpeareasCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET PE Areas section.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    
    $http({
        method: "GET",
        url: "/inventory/peareas"
    }).then(function(response) {
        $scope.collection = JSON.parse(JSON.stringify(response.data).replace("open-net-access:pe_area", "pe_area")).pe_area;
        // console.log(`SP's: ${JSON.stringify($scope.collection)}`);
        // console.log(`SP: ${$scope.collection[0].pe_area_id}`);
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
            $scope.pe_node_id = null;
            $scope.pe_if = null;
            $scope.pe_area_description = null;
            $scope.pe_pwhe_ipaddress = null;
        } else {
            $scope.newEntry = true;
        };
    };

    $scope.generateItem = function() {

        var data = {
            "pe_areas": {
                "pe_area": [
                    {
                        "pe_area_id": $scope.pe_area_id,
                        "pe_area_description": $scope.description,
                        "node": {
                            "pe_node_id": $scope.pe_node_id,
                            "pe_if": $scope.pe_if,
                            "pe_pwhe_ipaddress": $scope.pe_pwhe_ipaddress
                        }
                    }
                ]
            }
        }
        // console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: "POST",
            url: "/inventory/peareas",
            data: data
        }).then(function(response) {
            // console.log(`DATA: ${response.data}`);
            $location.path('/onpeareas');
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

        if ($window.confirm('Please confirm that you want to delete the subscription '+item.pe_area_id)) {

            $http({
                method: "DELETE",
                url: "/inventory/peareas/"+item.pe_area_id
            }).then(function(response) {
                $location.path('/onpeareas');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

}])