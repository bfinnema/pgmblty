angular.module('pgmblty')

.controller('onpeareasCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET PE Areas section.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    
    var host = NSOServer.host;
    var hostport = NSOServer.port;
    var path = "/api/running/open-net-access/inventory/pe_areas/pe_area?deep";
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
        $scope.collection = JSON.parse(JSON.stringify(response.data).replace("open-net-access:pe_area", "pe_area")).collection.pe_area;
        // console.log(`SP's: ${JSON.stringify($scope.collection)}`);
        // console.log(`SP: ${$scope.collection[0].pe_area_id}`);
        
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
        if ($scope.newEntry) {
            $scope.newEntry = false;
            $scope.name = null;
            $scope.pe_node_id = null;
            $scope.pe_if = null;
            $scope.pe_area_description = null;
/* 
            $scope.vlans = [];
            for (var i=0; i<8; i++) {
                $scope.vlans.push({vlan: null});
            };
            $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
            $scope.vlanShow = [true,false,false,false,false,false,false,false];
            numVMLines = 0;
 */            
        } else {
            $scope.newEntry = true;
        };
    };

    $scope.generateItem = function() {
/* 
        var vlans = [];
        for (var n=0; n<$scope.vlans.length; n++) {
            if ($scope.vlans[n].vlan > 10) {
                vlans.push($scope.vlans[n]);
            };
        };
 */        
        console.log(`vlans: ${JSON.stringify(vlans)}`);

        var data = {
            "open-net-access:inventory": {
                "pe_areas": {
                    "pe_area": [
                        {
                            "pe_area_id": $scope.pe_area_id,
                            "pe_area_description": $scope.description,
                            "node": {
                                "pe_node_id": $scope.pe_node_id,
                                "pe_if": $scope.pe_if
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
        $scope.editEntry = false;
    };

    $scope.deleteItem = function(item) {

        if ($window.confirm('Please confirm that you want to delete the subscription '+item.sp_id)) {
            var path = "/api/running/open-net-access/inventory/services/service/"+item.id;
            var url = "http://"+host+":"+hostport+path;
            // console.log(`url: ${url}`);
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
                $location.path('/onservices');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

}])