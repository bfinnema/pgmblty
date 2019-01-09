angular.module('pgmblty')

.controller('vlanpoolCtrl', ['$scope', '$http', '$window', '$route', '$location', function($scope, $http, $window, $route, $location) {
    // console.log(`You are in OpenNET VLAN Pool Resource Management Screen.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    $scope.showAccessNodes = false;
    $scope.showAccessInterface = false;
    
    var username = "admin";
    var password = "admin"
    var host = "10.101.1.211";
    var hostport = "8080";
    var inventory_path = "/api/running/open-net-access/inventory?deep";
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
            method: 'GET',
            url: '/vlanpools',
        });
    }).then(function(response) {
        // console.log(`VLAN Pools Status: ${response.status}`);
        $scope.vlanpools = response.data;

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

    $scope.editSubscription = function(subscription) {
        $scope.editEntry = true;
        $scope.editedSubscription = subscription;
    };

    $scope.editToggle = function() {
        $scope.editEntry = false;
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