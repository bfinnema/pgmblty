$http({
    method: method,
    url: $scope.url,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/vnd.yang.data+json',
        'Authorization': 'Basic '+auth,
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': "http://"+$scope.host+":"+$scope.hostport,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    }
}).then(function(response) {
    $scope.devices = response.data;
    $scope.devices_headers = response.headers;
    console.log($scope.devices);
}, function errorCallback(response) {
    console.log(`Status: ${response.status}`);
});


$http({
    method: method,
    url: inventory_url,
    headers: {
        'Content-Type': 'application/vnd.yang.data+json',
        'Accept': 'application/vnd.yang.data+json',
        'Authorization': 'Basic '+auth
    }
}).then(function(response) {
    // Do stuff with response
    return $http({
        method: method,
        url: core_url,
        headers: {
            'Content-Type': 'application/vnd.yang.data+json',
            'Accept': 'application/vnd.yang.collection+json',
            'Authorization': 'Basic '+auth
        }
    });
}).then(function(response) {
    // Do stuff with response
    return $http({
        method: method,
        url: core_url,
        headers: {
            'Content-Type': 'application/vnd.yang.data+json',
            'Accept': 'application/vnd.yang.collection+json',
            'Authorization': 'Basic '+auth
        }
    });
}).then(function(response) {
    // Do stuff with response
    return $http({
        method: method,
        url: core_url,
        headers: {
            'Content-Type': 'application/vnd.yang.data+json',
            'Accept': 'application/vnd.yang.collection+json',
            'Authorization': 'Basic '+auth
        }
    });
}).then(function(response) {
    // Do stuff with response

}, function errorCallback(response) {
    console.log(`Status: ${response.status}`);
});


for (var l=0; l<$scope.vlanpools.length; l++) {
    if (subscription.sp_id == $scope.vlanpools[l].sp_id && subscription.access_area_id == $scope.vlanpools[l].access_area_id && subscription.access_node_id == $scope.vlanpools[l].access_node_id) {
        var vp = $scope.vlanpools[l];
        console.log(`Found VLAN Pool: ${JSON.stringify(vp)}`);
    };
};

for (var n=0; n<vp.vlans.length; n++) {
    if (vp.vlans[n].subscription_id == subscription.subscriber_id) {
        vp.vlans[n].status = "Reserved";
    };
};

$http({
    method: "PATCH",
    url: "/vlanpools/"+vp._id,
    data: vp
}).then(function(response) {
    console.log(`Status: ${response.status}`);
}, function errorCallback(response) {
    console.log(`Status: ${response.status}`);
});

// About VLAN's

/* 
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
 */

$scope.newEntryToggle = function() {
/* 
        $scope.vlans = [];
        for (var i=0; i<8; i++) {
            $scope.vlans.push({vlan: null});
        };
        $scope.vlanBtnShow = [false,true,false,false,false,false,false,false];
        $scope.vlanShow = [true,false,false,false,false,false,false,false];
        numVMLines = 0;
*/            
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


};
