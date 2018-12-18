angular.module('pgmblty')

.controller('apicCtrl', ['$scope', '$http', function($scope, $http) {
    console.log(`You are in APIC.`);
    $scope.loggedIn = false;

    $scope.apiclogin = function() {

        $scope.username = "admin";
        $scope.password = "ciscopsdt"
        $scope.host = "sandboxapicdc.cisco.com";
        $scope.url = "https://"+$scope.host+"/api/aaaLogin.json";
        var method = "POST";

        var data = JSON.stringify({
            "aaaUser": {
                "attributes": {
                    "name": $scope.username,
                    "pwd": $scope.password
                }
            }
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
        });

        xhr.open(method, $scope.url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Postman-Token", "9ff968e2-8f29-48e5-ac82-e91b2940f658");

        xhr.send(data);

/* 
        $http({
            method: method,
            url: $scope.url,
            data: data
        }).then(function(response) {
            $scope.loginresponse = response.data;
            $scope.loginheaders = response.headers;
            $scope.loggedIn = true;
        }, function errorCallback(response) {
            console.log(`Status: ${response.status}`);
        });
 */        
    }
}])