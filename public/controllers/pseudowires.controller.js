angular.module('pgmblty')

.controller('pseudowireCtrl', ['$scope', '$http', '$window', '$route', '$location', function($scope, $http, $window, $route, $location) {
    // console.log(`You are in Pseudowire Set Resource Management Screen.`);

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
            url: '/pseudowires',
        });
    }).then(function(response) {
        console.log(`Pseudowire Set Status: ${response.status}`);
        $scope.pseudowires = response.data;

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
        $scope.pe_nodes = [$scope.inventory.pe_areas.pe_area[0].node];
        $scope.poi_nodes = [$scope.inventory.poi_areas.poi_area[0].node];
        $scope.showAccessNodes = true;
    };

    $scope.newEntryToggle = function() {
        if ($scope.newEntry) {
            $scope.newEntry = false;
            $scope.pseudowire_id = null;
            $scope.description = null;
            $scope.sp_id = null;
            $scope.access_node_id = null;
            $scope.access_area_id = null;
            $scope.pe_node_id = null;
            $scope.poi_node_id = null;
            $scope.subint_start = null;
            $scope.subint_stop = null;
        } else {
            $scope.newEntry = true;
        };
    };

    $scope.generateItem = function() {

        console.log(`In generateItem, PW`);
        console.log(`PW ID: ${$scope.pseudowire_id}`);
        console.log(`${$scope.description}`);
        console.log(`${$scope.sp_id}`);
        console.log(`${$scope.pe_node_id}`);
        console.log(`${$scope.access_node_id}`);
        console.log(`${$scope.poi_node_id}`);
        console.log(`${$scope.subint_start}`);
        console.log(`${$scope.subint_stop}`);
        var now = new Date();
        var subinterfaces = [];
        for (var v=$scope.subint_start; v<=$scope.subint_stop; v++) {
            subinterfaces.push({"subinterface_id": v, "status": "Free", "timestamp": now, "subscriber_id": "", "subscription_id": ""})
        };
        console.log(`PW Sets: ${JSON.stringify(subinterfaces)}`);

        var data = {
            "pseudowire_id": $scope.pseudowire_id,
            "pseudowire_description": $scope.description,
            "sp_id": $scope.sp_id,
            "pe_node_id": $scope.pe_node_id,
            "access_node_id": $scope.access_node_id,
            "poi_node_id": $scope.poi_node_id,
            "subinterfaces": subinterfaces
        };
        console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: "POST",
            url: "/pseudowires",
            data: data
        }).then(function(response) {
            // console.log(`DATA: ${response.data}`);
            $location.path('/pseudowires');
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

        if ($window.confirm('Please confirm that you want to delete the Pseudowire Set '+item.pseudowire_id)) {

            $http({
                method: "DELETE",
                url: "/pseudowires/"+item._id
            }).then(function(response) {
                // console.log(`DATA: ${response.data}`);
                $location.path('/pseudowires');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

    };

}])