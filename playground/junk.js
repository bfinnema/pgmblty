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
