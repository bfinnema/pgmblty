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
