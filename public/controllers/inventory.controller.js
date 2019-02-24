angular.module('pgmblty')

.controller('inventoryCtrl', ['$scope', '$http', '$window', '$route', '$location', 'NSOServer', 
function($scope, $http, $window, $route, $location, NSOServer) {
    // console.log(`You are in OpenNET Subscription Splash Screen.`);

    $scope.newEntry = false;
    $scope.editEntry = false;
    $scope.showAccessNodes = false;
    $scope.showAccessInterface = false;
    $scope.spinnerStatus = false;
    $scope.spinnerStatusDelete = false;
    $scope.errorMessage = false;
    
    $http({
        method: "GET",
        url: "/inventory"
    }).then(function(inventory) {
        console.log(`INVENTORY: ${inventory}`);
        $scope.inventory = JSON.parse(JSON.stringify(inventory.data).replace("open-net-access:inventory", "inventory")).inventory;
        console.log(`INVENTORY: ${JSON.stringify($scope.inventory)}`);
        console.log(`SP: ${JSON.stringify($scope.inventory.sps.sp[0].sp_id)}`);
        $scope.collection = $scope.inventory.sps.sp;

    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });

}])