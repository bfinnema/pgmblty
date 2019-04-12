angular.module('pgmblty')

.controller('onservicesCtrl', ['$scope', '$http', '$window', '$route', '$location', 
function($scope, $http, $window, $route, $location) {
    // console.log(`You are in OpenNET Services section.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    
    $http({
        method: "GET",
        url: "/inventory/sps"
    }).then(function(response) {
        $scope.collection = JSON.parse(JSON.stringify(response.data).replace("open-net-access:sp", "sp")).collection.sp;
        // console.log(`SP's: ${JSON.stringify($scope.collection)}`);
        // console.log(`SP: ${$scope.collection[0].sp_id}`);
        
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $scope.VMArray = [0,1,2,3,4,5,6,7];
    $scope.vlans = [];
    for (var i=0; i<8; i++) {
        $scope.vlans.push({vlan: null});
    };
    $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
    $scope.vlanShow = [true,false,false,false,false,false,false,false];
    var numVMLines = 0;

    $scope.showVMLine = function() {
        // console.log("Entering showVMline. numVMLines: "+numVMLines);
        if ($scope.vlans[numVMLines]) {
            console.log("numVMLines: "+numVMLines+", vlan: "+$scope.vlans[numVMLines].inner_vlan+", "+$scope.vlans[numVMLines].outer_vlan);
            numVMLines = numVMLines + 1;
            $scope.numVMLines = numVMLines;
            $scope.vlanShow[numVMLines] = true;
            $scope.vlanBtnShow[numVMLines] = false;
            $scope.vlanBtnShow[numVMLines+1] = true;
        }
        else {
            $window.alert("You must fill in the previous field");
        };
    };
    
    $scope.removeVlan = function(orgNum) {
        // console.log("Entering removevlan. numVMLines: "+numVMLines);
        for (var i=orgNum; i<numVMLines; i++) {
            $scope.vlans[i] = $scope.vlans[i+1];
        };
        $scope.vlans[numVMLines] = "";
        $scope.vlanShow[numVMLines] = false;
        $scope.vlanBtnShow[numVMLines] = true;
        $scope.vlanBtnShow[numVMLines+1] = false;
        numVMLines -= 1;
        $scope.numVMLines = numVMLines;
    };

    $scope.newEntryToggle = function() {
        $window.alert("This function is not implemented yet.");
        /* if ($scope.newEntry) {
            $scope.newEntry = false;
            $scope.name = null;
            $scope.qos_profile_in = null;
            $scope.qos_profile_out = null;
            $scope.mvr_receiver_vlan = null;
            $scope.vlan_pool_start = null;
            $scope.vlan_pool_end = null;

            $scope.vlans = [];
            for (var i=0; i<8; i++) {
                $scope.vlans.push({vlan: null});
            };
            $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
            $scope.vlanShow = [true,false,false,false,false,false,false,false];
            numVMLines = 0;
            
        } else {
            $scope.newEntry = true;
        }; */
    };

    $scope.generateItem = function() {

        var vlans = [];
        for (var n=0; n<$scope.vlans.length; n++) {
            if ($scope.vlans[n].vlan > 10) {
                vlans.push($scope.vlans[n]);
            };
        };
        
        console.log(`vlans: ${JSON.stringify(vlans)}`);

        var data = {
            "open-net-access:inventory": {
                "services": {
                    "service": [
                        {
                            "id": $scope.name,
                            "qos_profile_in": $scope.qos_profile_in,
                            "qos_profile_out": $scope.qos_profile_out,
                            "vlans": vlans
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
            // console.log(`DATA: ${response.data}`);
            $location.path('/onservices');
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
        $window.alert("This function is not implemented yet.");
        // $scope.editEntry = false;
    };

    $scope.unDeployItem = function(item) {
        var path = JSON.parse(JSON.stringify(item).replace('"un-deploy":', '"un_deploy":')).operations.un_deploy;
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
            var path = JSON.parse(JSON.stringify(item).replace('"check-sync":', '"check_sync":')).operations.check_sync;
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
            var path = JSON.parse(JSON.stringify(item).replace('"check-sync":', '"check_sync":')).operations.check_sync;
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
            var path = "/api/running/open-net-access/inventory/services/service/"+item.id;
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
                $location.path('/onservices');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

}])