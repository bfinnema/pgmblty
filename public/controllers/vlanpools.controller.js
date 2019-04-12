angular.module('pgmblty')

.controller('vlanpoolCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET VLAN Pool Resource Management Screen.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    $scope.resetEntry = false;
    $scope.showAccessNodes = false;
    $scope.showAccessInterface = false;
    
    $http({
        method: "GET",
        url: "/inventory"
    }).then(function(inventory) {
        $scope.inventory = JSON.parse(JSON.stringify(inventory.data).replace("open-net-access:inventory", "inventory")).inventory;
        // console.log(`INVENTORY: ${JSON.stringify($scope.inventory)}`);
        // console.log(`SP: ${JSON.stringify($scope.inventory.sps.sp[0].sp_id)}`);
        return $http({
            method: 'GET',
            url: '/vlanpools',
        });
    }).then(function(response) {
        // console.log(`VLAN Pools Status: ${response.status}`);
        $scope.vlanpools = response.data;
        for (var j=0; j<$scope.vlanpools.length; j++) {
            $scope.vlanpools[j].index = j;
            $scope.vlanpools[j].showVlans = false;
        };
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

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
        } else {
            $scope.newEntry = true;
        };
    };

    $scope.editItem = function(item) {
        $scope.editEntry = true;
        $scope.editedVlanpool = item;
    };

    $scope.editToggle = function() {
        if ($scope.editEntry) {
            $scope.editEntry = false;
        } else {
            $scope.editEntry = true;
        };
    };

    $scope.resetToggle = function(vp) {
        if ($scope.resetEntry) {
            $scope.resetEntry = false;
        } else {
            $scope.resetEntry = true;
            $scope.vpToReset = vp;
        };
    };

    $scope.showVlansToggle = function(index) {
        if ($scope.vlanpools[index].showVlans) {
            $scope.vlanpools[index].showVlans = false;
        } else {
            $scope.vlanpools[index].showVlans = true;
        };
    };

    $scope.generateItem = function() {

        var now = new Date();
        var vlans = [];
        for (var v=$scope.vlanpool_start; v<=$scope.vlanpool_stop; v++) {
            vlans.push({"vlan_id": v, "status": "Free", "timestamp": now, "subscriber_id": "", "subscription_id": ""})
        };
        // console.log(`VLANS: ${JSON.stringify(vlans)}`);

        var data = {
            "vlanpool_id": $scope.vlanpool_id,
            "vlanpool_description": $scope.description,
            "sp_id": $scope.sp_id,
            "access_area_id": $scope.access_area_id,
            "access_node_id": $scope.access_node_id,
            "vlans": vlans
        };
        // console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: "POST",
            url: "/vlanpools",
            data: data
        }).then(function(response) {
            // console.log(`DATA: ${response.data}`);
            $location.path('/vlanpools');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.resetItem = function() {
        var now = new Date();
        for (var i=0; i<$scope.vpToReset.vlans.length; i++) {
            $scope.vpToReset.vlans[i].status = "Free";
            $scope.vpToReset.vlans[i].subscriber_id = "";
            $scope.vpToReset.vlans[i].subscription_id = "";
            $scope.vpToReset.vlans[i].timestamp = now;
        };
        if ($scope.vlanreserved_start && $scope.vlanreserved_stop) {
            // console.log(`Reserved start and stop values have been entered`);
            if ($scope.vlanreserved_start >= $scope.vpToReset.vlans[0].vlan_id && $scope.vlanreserved_start <= $scope.vpToReset.vlans[$scope.vpToReset.vlans.length-1].vlan_id) {
                // console.log(`Start value is within range`);
                if ($scope.vlanreserved_stop >= $scope.vpToReset.vlans[0].vlan_id && $scope.vlanreserved_stop <= $scope.vpToReset.vlans[$scope.vpToReset.vlans.length-1].vlan_id) {
                    // console.log(`Stop value is within range`);
                    if ($scope.vlanreserved_start <= $scope.vlanreserved_stop) {
                        // console.log(`Start value is smaller than stop value`);
                        var j=0;
                        while ($scope.vpToReset.vlans[j].vlan_id != $scope.vlanreserved_start) {
                            console.log(`Count: ${j}, VLAN: ${$scope.vpToReset.vlans[j].vlan_id}`);
                            j++;
                        };
                        while ($scope.vpToReset.vlans[j].vlan_id <= $scope.vlanreserved_stop) {
                            console.log(`Count: ${j}, VLAN: ${$scope.vpToReset.vlans[j].vlan_id}`);
                            $scope.vpToReset.vlans[j].status = "Reserved";
                            $scope.vpToReset.vlans[j].subscriber_id = $scope.subscriber_id;
                            $scope.vpToReset.vlans[j].subscription_id = $scope.description;
                            $scope.vpToReset.vlans[j].timestamp = now;
                            j++;
                        };
                    } else {console.log(`!!!!!!!!! Stop value is smaller than start value!!!!!!!!!`);};
                } else {console.log(`Stop value is NOT within range`);};
            } else {console.log(`Start value is NOT within range`);};
        } else {console.log(`Reserved start and stop values have NOT been entered`);};
        $http({
            method: "PATCH",
            url: "/vlanpools/"+$scope.vpToReset._id,
            data: $scope.vpToReset
        }).then(function(response) {
            // console.log(`VLAN Pool Status: ${response.status}`);
            $location.path('/vlanpools');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
    };

    $scope.deleteItem = function(item) {

        if ($window.confirm('Please confirm that you want to delete the VLAN Pool '+item.vlanpool_id)) {

            $http({
                method: "DELETE",
                url: "/vlanpools/"+item._id
            }).then(function(response) {
                // console.log(`DATA: ${response.data}`);
                $location.path('/vlanpools');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

}])