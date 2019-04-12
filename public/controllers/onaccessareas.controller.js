angular.module('pgmblty')

.controller('onaccessareasCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET Access Areas section.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    
    $http({
        method: "GET",
        url: "/inventory/accessareas"
    }).then(function(response) {
        $scope.collection = JSON.parse(JSON.stringify(response.data).replace("open-net-access:access_area", "access_area")).collection.access_area;
        // console.log(`Access Areas's: ${JSON.stringify($scope.collection)}`);
        // console.log(`Access Area: ${$scope.collection[0].access_area_id}`);
        
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $scope.newEntryToggle = function() {
        $window.alert("This function is not implemented.");
        /* if ($scope.newEntry) {
            $scope.newEntry = false;
            $scope.name = null;
            $scope.s_vlan_offset = null;
            $scope.mvr_vlan = null;
            $scope.mvr_receiver_vlan = null;
            $scope.vlan_pool_start = null;
            $scope.vlan_pool_end = null;
        } else {
            $scope.newEntry = true;
        }; */
    };

    $scope.generateItem = function() {
        // console.log(`vlan_mappings: ${JSON.stringify(vlan_mappings)}`);

        var data = {
            "open-net-access:inventory": {
                "sps": {
                    "sp": [
                        {
                            "sp_id": $scope.name,
                            "s_vlan_offset": $scope.s_vlan_offset,
                            "mvr_vlan": $scope.mvr_vlan,
                            "mvr_receiver_vlan": $scope.mvr_receiver_vlan,
                            "vlan_pool": {
                                "start": $scope.vlan_pool_start,
                                "end": $scope.vlan_pool_end
                            }
                        }
                    ]
                }
            }
        }
        // console.log(`DATA: ${JSON.stringify(data)}`);

        var path = "/api/config/open-net-access/inventory";
        var url = "http://"+host+":"+hostport+path;
        // console.log(`url: ${url}`);
        var method = "PATCH";
        var auth = $window.btoa(NSOServer.username+":"+NSOServer.password);
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
            // console.log(`DATA: ${response.data}`);
            // console.log(`HEADERS: ${response.headers}`);
            $location.path('/onserviceproviders');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.editItem = function(item) {
        $scope.editEntry = true;
        $scope.editedItem = item;
    };

    $scope.editToggle = function() {
        $scope.editEntry = false;
    };

    $scope.deleteItem = function(item) {

        if ($window.confirm('Please confirm that you want to delete the access area '+item.access_area_id)) {
            var path = "/api/running/open-net-access/inventory/sps/sp/"+item.access_area_id;
            var url = "http://"+host+":"+hostport+path;
            console.log(`url: ${url}`);
            var method = "DELETE";
            var auth = $window.btoa(NSOServer.username+":"+NSOServer.password);

            $http({
                method: method,
                url: url,
                headers: {
                    'Content-Type': 'application/vnd.yang.data+json',
                    'Accept': 'application/vnd.yang.data+json',
                    'Authorization': 'Basic '+auth
                }
            }).then(function(response) {
                $location.path('/onaccessareas');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };
}])