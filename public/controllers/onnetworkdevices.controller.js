angular.module('pgmblty')

.controller('onnetworkdevicesCtrl', ['$scope', '$http', '$window', '$route', function($scope, $http, $window, $route) {
    // console.log(`You are in OpenNET Network Devices Section.`);

    $scope.username = "admin";
    $scope.password = "admin"
    $scope.host = "10.101.1.211";
    $scope.hostport = "8080";
    $scope.path = "/api/running/devices";
    $scope.url = "http://"+$scope.host+":"+$scope.hostport+$scope.path;
    // console.log(`url: ${$scope.url}`);
    var method = "GET";
    var auth = $window.btoa("admin:admin");
    // console.log(`Encoded Authentication: ${auth}`);

    $http({
        method: method,
        url: $scope.url,
        headers: {
            'Accept': 'application/vnd.yang.data+xml',
            'Authorization': 'Basic '+auth
        }
    }).then(function(response) {
        $scope.devicereport = response.data;
        $scope.devices_headers = response.headers;
        // console.log($scope.devicereport);

        if (window.DOMParser) {
            // console.log(`DOMParser OK!`);
            parser = new DOMParser();
            xmlDoc = parser.parseFromString($scope.devicereport, "text/xml");
        }
        else { // Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML($scope.devicereport);
        };

        var x=0;
        $scope.devices = [];
        while (xmlDoc.getElementsByTagName("device")[x] != null) {
            var deviceContainer = xmlDoc.getElementsByTagName("device")[x];
            var devicename = deviceContainer.getElementsByTagName("name")[0].childNodes[0].nodeValue;
            var device = {"name": devicename, "address": "", "type": "", "port": 0, "authgroup": ""};
            // console.log(`DEVICE ${x}: ${device.name}`);
            $scope.devices.push(device);
            x++;
        };
        
        var deviceDetails = [];
        for (var i=0; i<$scope.devices.length; i++) {
            // console.log(`Device ${i}: ${$scope.devices[i].name}`);
            $scope.path = "/api/running/devices/device/"+$scope.devices[i].name;
            $scope.url = "http://"+$scope.host+":"+$scope.hostport+$scope.path;
            // console.log(`url: ${$scope.url}`);
            var method = "GET";
            var auth = $window.btoa("admin:admin");
            // console.log(`Encoded Authentication: ${auth}`);

            $http({
                method: method,
                url: $scope.url,
                headers: {
                    'Accept': 'application/vnd.yang.data+xml',
                    'Authorization': 'Basic '+auth
                }
            }).then(function(response) {
                deviceDetails.push(response.data);
                // console.log(response.data);
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

        setTimeout(function(){
            for (var i=0; i<$scope.devices.length; i++) {
                if (window.DOMParser) {
                    // console.log(`deviceDetails: ${deviceDetails[i]}`);
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(deviceDetails[i], "text/xml");
                    // console.log(`xmlDoc: ${xmlDoc}`);
                }
                else { // Internet Explorer
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML($scope.device);
                };
    
                console.log(`${xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue}`);
                console.log(`${xmlDoc.getElementsByTagName("address")[0].childNodes[0].nodeValue}`);
                // console.log(`${xmlDoc.getElementsByTagName("port")[0].childNodes[0].nodeValue}`);
                console.log(`${xmlDoc.getElementsByTagName("authgroup")[0].childNodes[0].nodeValue}`);
                console.log(`var i: ${i}`);
                console.log(`Device details: ${$scope.devices[i].name}, ${$scope.devices[i].address}`);
                $scope.devices[i].address = xmlDoc.getElementsByTagName("address")[0].childNodes[0].nodeValue;
                // $scope.devices[i].port = xmlDoc.getElementsByTagName("port")[0].childNodes[0].nodeValue;
                $scope.devices[i].authgroup = xmlDoc.getElementsByTagName("authgroup")[0].childNodes[0].nodeValue;
            };
            $scope.$digest();
        }, 600);
        
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });
}])