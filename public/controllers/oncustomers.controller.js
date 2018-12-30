angular.module('pgmblty')

.controller('oncustomersCtrl', ['$scope', '$http', '$window', '$route', '$location', function($scope, $http, $window, $route, $location) {
    // console.log(`You are in OpenNET New Customer in Access Section.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    
    var username = "admin";
    var password = "admin"
    var host = "10.101.1.211";
    var hostport = "8080";
    var core_path = "/api/running/open-net-access/open-net-core?deep";
    var inventory_path = "/api/running/open-net-access/inventory?deep";
    var core_url = "http://"+host+":"+hostport+core_path;
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
            method: method,
            url: core_url,
            headers: {
                'Content-Type': 'application/vnd.yang.data+json',
                'Accept': 'application/vnd.yang.collection+json',
                'Authorization': 'Basic '+auth
            }
        });
    }).then(function(collection) {
        var strCollection = JSON.stringify(collection.data);
        var modCollection = strCollection.replace("open-net-core:open-net-core", "openNetCore");
        var newCollection = JSON.parse(modCollection);
        $scope.subscriptions = newCollection.collection.openNetCore;
        // console.log($scope.subscriptions);
        // console.log(`NAME: ${$scope.subscriptions[0].name}`);
        // console.log(`Access Area: ${$scope.subscriptions[0].access_area_id}`);
        // console.log(`PE Area: ${$scope.subscriptions[0].pe_area_id}`);
        // console.log(`POI Area: ${$scope.subscriptions[0].poi_area_id}`);
        // console.log(`SP: ${$scope.subscriptions[0].sp_id}`);
        
        $scope.showSubDetails = [];
        for (var i=0; i<$scope.subscriptions.length; i++) {
            // console.log(`Counter i: ${i}`);
            $scope.subscriptions[i].index = i;
            $scope.subscriptions[i].allCollected = false;
            $scope.showSubDetails.push(false);
            $scope.subscriptions[i].subscription_id = $scope.subscriptions[i].sp_id+"-"+$scope.subscriptions[i].subscriber_id+"-"+$scope.subscriptions[i].service_id;
            // console.log(`Subscription ID calculated to be: ${$scope.subscriptions[i].subscription_id}`);
            for (var j=0; j<$scope.inventory.access_areas.access_area.length; j++) {
                // console.log(`Counter j: ${j}`);
                // console.log(`Looking for access_area: ${$scope.subscriptions[i].access_area_id}`);
                if ($scope.inventory.access_areas.access_area[j].access_area_id == $scope.subscriptions[i].access_area_id) {
                    $scope.subscriptions[i].access_area = $scope.inventory.access_areas.access_area[j];
                    // console.log(`Found access_area: ${$scope.inventory.access_areas.access_area[j].access_area_id}`);
                };
            };
            for (j=0; j<$scope.inventory.pe_areas.pe_area.length; j++) {
                // console.log(`Counter j: ${j}`);
                // console.log(`Looking for pe_area: ${$scope.subscriptions[i].pe_area_id}`);
                if ($scope.inventory.pe_areas.pe_area[j].pe_area_id == $scope.subscriptions[i].pe_area_id) {
                    $scope.subscriptions[i].pe_area = $scope.inventory.pe_areas.pe_area[j];
                    // console.log(`Found pe_area: ${$scope.inventory.pe_areas.pe_area[j].pe_area_id}`);
                };
            };
            for (j=0; j<$scope.inventory.poi_areas.poi_area.length; j++) {
                // console.log(`Counter j: ${j}`);
                // console.log(`Looking for poi_area: ${$scope.subscriptions[i].poi_area_id}`);
                if ($scope.inventory.poi_areas.poi_area[j].poi_area_id == $scope.subscriptions[i].poi_area_id) {
                    $scope.subscriptions[i].poi_area = $scope.inventory.poi_areas.poi_area[j];
                    // console.log(`Found poi_area: ${$scope.inventory.poi_areas.poi_area[j].poi_area_id}`);
                };
            };
        };
        // console.log($scope.subscriptions);
        // console.log(`showSubDetails: ${$scope.showSubDetails[0]}`);

    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

    $scope.hoverIn = function(index) {
        $scope.showSubDetails[index] = true;
        if (!$scope.subscriptions[index].allCollected) {
            // console.log(`Getting the DETAILS`);
            $http({
                method: method,
                url: "http://"+host+":"+hostport+"/api/running/newSubAccess/"+$scope.subscriptions[index].subscription_id+"?deep",
                headers: {
                    'Content-Type': 'application/vnd.yang.data+json',
                    'Accept': 'application/vnd.yang.data+json',
                    'Authorization': 'Basic '+auth
                }
            }).then(function(subAccess) {
                var strSubAccess = JSON.stringify(subAccess.data);
                var modSubAccess = strSubAccess.replace("newSubAccess:newSubAccess", "newSubAccess");
                var newSubAccess = JSON.parse(modSubAccess);
                $scope.newSubAccess = newSubAccess.newSubAccess;
                // console.log(`newSubAccess: ${JSON.stringify($scope.newSubAccess)}`);
                $scope.subscriptions[index].newSubAccess = $scope.newSubAccess;
                return $http({
                    method: method,
                    url: "http://"+host+":"+hostport+"/api/running/newSubPE/"+$scope.subscriptions[index].subscription_id+"?deep",
                    headers: {
                        'Content-Type': 'application/vnd.yang.data+json',
                        'Accept': 'application/vnd.yang.data+json',
                        'Authorization': 'Basic '+auth
                    }
                });
            }).then(function(subPE) {
                var strSubPE = JSON.stringify(subPE.data);
                var modSubPE = strSubPE.replace("newSubPE:newSubPE", "newSubPE");
                var newSubPE = JSON.parse(modSubPE);
                $scope.newSubPE = newSubPE.newSubPE;
                // console.log(`newSubPE: ${JSON.stringify($scope.newSubPE)}`);
                $scope.subscriptions[index].newSubPE = $scope.newSubPE;
                return $http({
                    method: method,
                    url: "http://"+host+":"+hostport+"/api/running/newSubPOI/"+$scope.subscriptions[index].subscription_id+"?deep",
                    headers: {
                        'Content-Type': 'application/vnd.yang.data+json',
                        'Accept': 'application/vnd.yang.data+json',
                        'Authorization': 'Basic '+auth
                    }
                });
            }).then(function(subPOI) {
                var strSubPOI = JSON.stringify(subPOI.data);
                var modSubPOI = strSubPOI.replace("newSubPOI:newSubPOI", "newSubPOI");
                var newSubPOI = JSON.parse(modSubPOI);
                $scope.newSubPOI = newSubPOI.newSubPOI;
                // console.log(`newSubPOI: ${JSON.stringify($scope.newSubPOI)}`);
                $scope.subscriptions[index].newSubPOI = $scope.newSubPOI;
        
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
            $scope.subscriptions[index].allCollected = true;
        };
        // console.log($scope.subscriptions);
    };

    $scope.hoverOut = function(index) {
        $scope.showSubDetails[index] = false;
    };

    $scope.VMArray = [0,1,2,3,4,5,6,7];
    $scope.vlanMappings = [];
    for (var i=0; i<8; i++) {
        $scope.vlanMappings.push({inner_vlan: null, outer_vlan: null});
    };
    $scope.vlanMappingBtnShow = [false,true,false,false,false,false,false,false];
    $scope.vlanMappingShow = [true,false,false,false,false,false,false,false];
    var numVMLines = 0;

    $scope.showVMLine = function() {
        console.log("Entering showVMline. numVMLines: "+numVMLines);
        if ($scope.vlanMappings[numVMLines]) {
            console.log("numVMLines: "+numVMLines+", vlanMapping: "+$scope.vlanMappings[numVMLines].inner_vlan+", "+$scope.vlanMappings[numVMLines].outer_vlan);
            numVMLines = numVMLines + 1;
            $scope.numVMLines = numVMLines;
            $scope.vlanMappingShow[numVMLines] = true;
            $scope.vlanMappingBtnShow[numVMLines] = false;
            $scope.vlanMappingBtnShow[numVMLines+1] = true;
        }
        else {
            $window.alert("Du skal udfylde det tomme arrangør felt.");
        };
    };
    
    $scope.removeVlanMapping = function(orgNum) {
        console.log("Entering removevlanMapping. numVMLines: "+numVMLines);
        for (var i=orgNum; i<numVMLines; i++) {
            $scope.vlanMappings[i] = $scope.vlanMappings[i+1];
        };
        $scope.vlanMappings[numVMLines] = "";
        $scope.vlanMappingShow[numVMLines] = false;
        $scope.vlanMappingBtnShow[numVMLines] = true;
        $scope.vlanMappingBtnShow[numVMLines+1] = false;
        numVMLines -= 1;
        $scope.numVMLines = numVMLines;
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
            $scope.vlanMappings = [];
            for (var i=0; i<8; i++) {
                $scope.vlanMappings.push({inner_vlan: null, outer_vlan: null});
            };
            $scope.vlanMappingBtnShow = [false,true,false,false,false,false,false,false];
            $scope.vlanMappingShow = [true,false,false,false,false,false,false,false];
            numVMLines = 0;
        } else {
            $scope.newEntry = true;
        };
    };

    $scope.generateSubscription = function() {

        var vlan_mapping = [];
        for (var n=0; n<$scope.vlanMappings.length; n++) {
            if ($scope.vlanMappings[n].inner_vlan > 10 && $scope.vlanMappings[n].outer_vlan > 10) {
                vlan_mapping.push($scope.vlanMappings[n]);
            };
        };
        var vlan_mappings = {"vlan_mappings": vlan_mapping};
        console.log(`vlan_mappings: ${vlan_mappings}`);

        var data = {
            "open-net-core:open-net-core": {
                "name": $scope.name,
                "subscriber_id": $scope.subscriber_id,
                "sp_id": $scope.sp_id,
                "service_id": $scope.service_id,
                "access_area_id": $scope.access_area_id,
                "pe_area_id": $scope.pe_area_id,
                "poi_area_id": $scope.poi_area_id,
                "vlan_mappings": vlan_mappings
            }
        };
        console.log(`DATA: ${data}`);

        var path = "/api/running/open-net-access";
        var url = "http://"+host+":"+hostport+path;
        console.log(`url: ${url}`);
        var method = "POST";
        var auth = $window.btoa("admin:admin");
        console.log(`Encoded Authentication: ${auth}`);

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
            console.log(`DATA: ${response.data}`);
            console.log(`HEADERS: ${response.headers}`);
            $location.path('/oncustomers');
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

}])