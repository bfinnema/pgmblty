angular.module('pgmblty')

.controller('onservicesCtrl', ['$scope', '$http', '$window', '$route', '$location', 
function($scope, $http, $window, $route, $location) {
    // console.log(`You are in OpenNET Services section.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    $scope.newService = false;
    
    $scope.vlanArray = [0,1,2,3,4,5,6,7];
    $scope.vlans = [];
    for (var i=0; i<8; i++) {
        $scope.vlans.push({vlan: null, multicast: null});
    };
    $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
    $scope.vlanShow = [true,false,false,false,false,false,false,false];
    var numVlanLines = 0;
    
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

    $scope.addServiceToggle = function(editSP) {
        if ($scope.newService) {
            $scope.newService = false;
            $scope.service_id = null;
            $scope.service_description = null;
            $scope.qos_profile_in = "220M_TDC_UNI_IN";
            $scope.qos_profile_out = "220M_TDC_UNI_OUT";
            $scope.vlans = [];
            for (var i=0; i<8; i++) {
                $scope.vlans.push({vlan: null, multicast: null});
            };
            $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
            $scope.vlanShow = [true,false,false,false,false,false,false,false];
            numVlanLines = 0;
        } else {
            $scope.newService = true;
            $scope.editSP = editSP;
        };
    };

    $scope.showVlanLine = function() {
        console.log("Entering showVlanline. numVlanLines: "+numVlanLines);
        if ($scope.vlans[numVlanLines].vlan != null) {
            console.log("numVlanLines: "+numVlanLines+", vlan: "+$scope.vlans[numVlanLines].vlan+", "+$scope.vlans[numVlanLines].multicast);
            if (!$scope.vlans[numVlanLines].multicast) {$scope.vlans[numVlanLines].multicast = false};
            console.log("numVlanLines: "+numVlanLines+", vlan: "+$scope.vlans[numVlanLines].vlan+", "+$scope.vlans[numVlanLines].multicast);
            numVlanLines++;
            $scope.numVlanLines = numVlanLines;
            $scope.vlanShow[numVlanLines] = true;
            $scope.vlanBtnShow[numVlanLines] = false;
            $scope.vlanBtnShow[numVlanLines+1] = true;
        }
        else {
            $window.alert("You must fill in the previous field");
        };
    };
    
    $scope.removeVlan = function(orgNum) {
        // console.log("Entering removevlan. numVlanLines: "+numVlanLines);
        for (var i=orgNum; i<numVlanLines; i++) {
            $scope.vlans[i] = $scope.vlans[i+1];
        };
        $scope.vlans[numVlanLines] = "";
        $scope.vlanShow[numVlanLines] = false;
        $scope.vlanBtnShow[numVlanLines] = true;
        $scope.vlanBtnShow[numVlanLines+1] = false;
        numVlanLines -= 1;
        $scope.numVlanLines = numVlanLines;
    };

    $scope.generateService = function() {

        if (!$scope.vlans[numVlanLines].multicast) {$scope.vlans[numVlanLines].multicast = false};
        var myVlans = [];
        for (var i=0; i<=$scope.numVlanLines; i++) {
            myVlans.push($scope.vlans[i]);
        };
        // console.log(`myVlans: ${JSON.stringify(myVlans)}`);
        // console.log(`SP to add service ${$scope.editSP.sp_id} ${$scope.editSP}`);

        var data = {
            "sps": {
                "sp": [
                    {
                        "sp_id": $scope.editSP.sp_id,
                        "services": {
                            "service": [
                                {
                                    "id": $scope.service_id,
                                    "qos_profile_in": "220M_TDC_UNI_IN",
                                    "qos_profile_out": "220M_TDC_UNI_OUT",
                                    "service_description": $scope.service_description,
                                    "vlans": myVlans
                                }
                            ]
                        }
                    }
                ]
            }
        }
        // console.log(`DATA: ${JSON.stringify(data)}`);

        $http({
            method: "POST",
            url: "/inventory/sps/addservice",
            data: data
        }).then(function(response) {
            console.log(`Post SP add Service status: ${response.status}`);
            $location.path('/onservices');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.deleteService = function(sp_id, service_id) {

        if ($window.confirm('Please confirm that you want to delete the service '+service_id+' for SP '+sp_id)) {
            $http({
                method: "DELETE",
                url: "/inventory/sps/deleteservice/"+sp_id+"/"+service_id
            }).then(function(response) {
                $location.path('/onservices');
                $route.reload();
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

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

}])