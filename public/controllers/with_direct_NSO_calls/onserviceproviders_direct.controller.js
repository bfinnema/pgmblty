angular.module('pgmblty')

.controller('onserviceprovidersCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET Service Provider section.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    
    var host = NSOServer.host;
    var hostport = NSOServer.port;
    var path = "/api/running/open-net-access/inventory/sps/sp?deep";
    var url = "http://"+host+":"+hostport+path;
    // console.log(`url: ${url}`);
    var method = "GET";
    var auth = $window.btoa(NSOServer.username+":"+NSOServer.password);
    // console.log(`Encoded Authentication: ${auth}`);

    $http({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/vnd.yang.data+json',
            'Accept': 'application/vnd.yang.collection+json',
            'Authorization': 'Basic '+auth
        }
    }).then(function(response) {
        $scope.collection = JSON.parse(JSON.stringify(response.data).replace("open-net-access:sp", "sp")).collection.sp;
        // console.log(`SP's: ${JSON.stringify($scope.collection)}`);
        // console.log(`SP: ${$scope.collection[0].sp_id}`);
        
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $scope.newEntryToggle = function() {
        if ($scope.newEntry) {
            $scope.newEntry = false;
            $scope.name = null;
            $scope.s_vlan_offset = null;
            $scope.mvr_vlan = null;
            $scope.mvr_receiver_vlan = null;
            $scope.vlan_pool_start = null;
            $scope.vlan_pool_end = null;
        } else {
            $scope.newEntry = true;
        };
    };

    $scope.generateItem = function() {

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
        $window.alert("This function is not implemented yet.");
        // $scope.editEntry = true;
        // $scope.editedItem = item;
    };

    $scope.editToggle = function() {
        $scope.editEntry = false;
    };

    $scope.unDeployItem = function(item) {
        var path = JSON.parse(JSON.stringify(item).replace('"un-deploy":', '"un_deploy":')).operations.un_deploy;
        var url = "http://"+host+":"+hostport+path;
        // console.log(`url: ${url}`);
        var method = "POST";
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
            var path = JSON.parse(JSON.stringify(item).replace('"check-sync":', '"check_sync":')).operations.check_sync;
            var url = "http://"+host+":"+hostport+path;
            // console.log(`url: ${url}`);
            var method = "POST";
            var auth = $window.btoa(NSOServer.username+":"+NSOServer.password);
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
            var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-access:output":{"in-sync":', '"sync_output":{"in_sync":'));
            // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
            for (var i=0; i<$scope.collection.length; i++) {
                if ($scope.collection[i].sp_id == item.sp_id) {
                    $scope.collection[i].sync_status = newSyncStatus.sync_output;
                    // console.log(`Sync Status for ${$scope.collection[i].sp_id}: ${JSON.stringify($scope.collection[i].sync_status)}`);
                };
            };
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.reDeployItem = function(item) {
        var path = JSON.parse(JSON.stringify(item).replace('"re-deploy":', '"re_deploy":')).operations.re_deploy;
        var url = "http://"+host+":"+hostport+path;
        // console.log(`url: ${url}`);
        var method = "POST";
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
            var path = JSON.parse(JSON.stringify(item).replace('"check-sync":', '"check_sync":')).operations.check_sync;
            var url = "http://"+host+":"+hostport+path;
            // console.log(`url: ${url}`);
            var method = "POST";
            var auth = $window.btoa(NSOServer.username+":"+NSOServer.password);
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
            var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-access:output":{"in-sync":', '"sync_output":{"in_sync":'));
            // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
            for (var i=0; i<$scope.collection.length; i++) {
                if ($scope.collection[i].sp_id == item.sp_id) {
                    $scope.collection[i].sync_status = newSyncStatus.sync_output;
                    // console.log(`Sync Status for ${$scope.collection[i].sp_id}: ${JSON.stringify($scope.collection[i].sync_status)}`);
                };
            };
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.checkSync = function(item) {
        var path = JSON.parse(JSON.stringify(item).replace('"check-sync":', '"check_sync":')).operations.check_sync;
        var url = "http://"+host+":"+hostport+path;
        // console.log(`url: ${url}`);
        var method = "POST";
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
            // console.log(`DATA stringified: ${JSON.stringify(response.data)}`);
            var newSyncStatus = JSON.parse(JSON.stringify(response.data).replace('"open-net-access:output":{"in-sync":', '"sync_output":{"in_sync":'));
            // console.log(`newSyncStatus stringified: ${JSON.stringify(newSyncStatus)}`);
            for (var i=0; i<$scope.collection.length; i++) {
                if ($scope.collection[i].sp_id == item.sp_id) {
                    $scope.collection[i].sync_status = newSyncStatus.sync_output;
                    // console.log(`Sync Status for ${$scope.collection[i].sp_id}: ${JSON.stringify($scope.collection[i].sync_status)}`);
                };
            };
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.deleteItem = function(item) {

        if ($window.confirm('Please confirm that you want to delete the subscription '+item.sp_id)) {
            var path = "/api/running/open-net-access/inventory/sps/sp/"+item.sp_id;
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
                $location.path('/onserviceproviders');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };
}])