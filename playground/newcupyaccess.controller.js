angular.module('pgmblty')

.controller('newcupyaccessCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET New Customer in Access Section.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    
    $scope.host = NSOServer.host;
    $scope.hostport = NSOServer.port;
    $scope.path = "/api/running/newCuPy-access?deep";
    $scope.url = "http://"+$scope.host+":"+$scope.hostport+$scope.path;
    // console.log(`url: ${$scope.url}`);
    var method = "GET";
    var auth = $window.btoa(NSOServer.username+":"+NSOServer.password);
    // console.log(`Encoded Authentication: ${auth}`);

    $http({
        method: method,
        url: $scope.url,
        headers: {
            'Content-Type': 'application/vnd.yang.data+json',
            'Accept': 'application/vnd.yang.collection+json',
            'Authorization': 'Basic '+auth
        }
    }).then(function(response) {
        var strCollection = JSON.stringify(response.data);
        var modCollection = strCollection.replace("newCuPy-access:newCuPy-access", "newCuPyAccess");
        var newCollection = JSON.parse(modCollection);
        $scope.customers = newCollection.collection.newCuPyAccess;
        // console.log($scope.customers);
        
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

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
            $scope.cuid = null;
            $scope.device = null;
            $scope.interface = null;
            $scope.mvr_vlan = null;
            $scope.mvr_receiver_vlan = null;
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

    $scope.generateAccessCustomer = function() {

        var vlanMappings = [];
        for (var n=0; n<$scope.vlanMappings.length; n++) {
            if ($scope.vlanMappings[n].inner_vlan > 10 && $scope.vlanMappings[n].outer_vlan > 10) {
                vlanMappings.push($scope.vlanMappings[n]);
            };
        };

        var data = {
            "newCuPy-access:newCuPy-access": {
                "Customer_ID": $scope.cuid,
                "device": $scope.device,
                "access_interface": $scope.interface,
                "mvr_vlan": $scope.mvr_vlan,
                "mvr_receiver_vlan": $scope.mvr_receiver_vlan,
                "vlan_mappings": vlanMappings
            }
        }

        $scope.path = "/api/running";
        $scope.url = "http://"+$scope.host+":"+$scope.hostport+$scope.path;
        console.log(`url: ${$scope.url}`);
        var method = "POST";
        var auth = $window.btoa(NSOServer.username+":"+NSOServer.password);
        console.log(`Encoded Authentication: ${auth}`);

        $http({
            method: method,
            url: $scope.url,
            headers: {
                'Content-Type': 'application/vnd.yang.data+json',
                'Accept': 'application/vnd.yang.data+json',
                'Authorization': 'Basic '+auth
            },
            data: data
        }).then(function(response) {
            console.log(`DATA: ${response.data}`);
            console.log(`HEADERS: ${response.headers}`);
            $location.path('/newcupyaccess');
            $route.reload();
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });

    };

    $scope.editCust = function(customer) {
        $scope.editEntry = true;
        $scope.editedCust = game;
    };

    $scope.editToggle = function() {
        $scope.editEntry = false;
    };

}])