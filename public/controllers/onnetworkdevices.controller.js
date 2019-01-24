angular.module('pgmblty')

.controller('onnetworkdevicesCtrl', ['$scope', '$http', '$window', '$route', 'NSOServer', 
function($scope, $http, $window, $route, NSOServer) {
    // console.log(`You are in OpenNET Network Devices Section.`);

    $scope.host = NSOServer.host;
    $scope.hostport = NSOServer.port;
    $scope.path = "/api/running/devices";
    $scope.url = "http://"+$scope.host+":"+$scope.hostport+$scope.path;
    // console.log(`url: ${$scope.url}`);
    var method = "GET";
    var auth = $window.btoa(NSOServer.username+":"+NSOServer.password);
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
            var device = {"name": devicename, "address": "", "type": "", "port": 22, "authgroup": ""};
            // console.log(`DEVICE ${x}: ${device.name}`);
            $scope.devices.push(device);
            x++;
        };
        
        var deviceDetailsXML = [];
        for (var i=0; i<$scope.devices.length; i++) {
            console.log(`Device ${i}: ${$scope.devices[i].name}`);
            $scope.path = "/api/running/devices/device/"+$scope.devices[i].name;
            $scope.url = "http://"+$scope.host+":"+$scope.hostport+$scope.path;
            // console.log(`url: ${$scope.url}`);
            var method = "GET";
            var auth = $window.btoa(NSOServer.username+":"+NSOServer.password);
            // console.log(`Encoded Authentication: ${auth}`);

            $http({
                method: method,
                url: $scope.url,
                headers: {
                    'Accept': 'application/vnd.yang.data+xml',
                    'Authorization': 'Basic '+auth
                }
            }).then(function(response) {
                deviceDetailsXML.push(response.data);
                // console.log(response.data);
            }, function errorCallback(response) {
                console.log(`Status: ${response.status}`);
            });
        };

        setTimeout(function(){
            var deviceDetails = [];
            for (var l=0; l<deviceDetailsXML.length; l++) {
                // console.log(`VAR l: ${l}`);
                if (window.DOMParser) {
                    // console.log(`deviceDetails: ${deviceDetailsXML[l]}`);
                    parser = new DOMParser();
                    xmlDoc = parser.parseFromString(deviceDetailsXML[l], "text/xml");
                }
                else { // Internet Explorer
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = false;
                    xmlDoc.loadXML(deviceDetailsXML[l]);
                };
                deviceDetails.push(xmlDoc);
                // console.log(`${xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue}`);
                // console.log(`${xmlDoc.getElementsByTagName("address")[0].childNodes[0].nodeValue}`);
                // console.log(`${xmlDoc.getElementsByTagName("authgroup")[0].childNodes[0].nodeValue}`);
            };

            for (var i=0; i<$scope.devices.length; i++) {
                console.log(`var i: ${i}, Device details: ${$scope.devices[i].name}, ${$scope.devices[i].address}`);
                for (var j=0; j<deviceDetails.length; j++) {
                    var xmlDoc2 = deviceDetails[j];
                    // console.log(`${xmlDoc2.getElementsByTagName("name")[0].childNodes[0].nodeValue}`);
                    // console.log(`${xmlDoc2.getElementsByTagName("address")[0].childNodes[0].nodeValue}`);
                    // console.log(`${xmlDoc2.getElementsByTagName("authgroup")[0].childNodes[0].nodeValue}`);
                    var currentName = xmlDoc2.getElementsByTagName("name")[0].childNodes[0].nodeValue;
                    if (currentName == $scope.devices[i].name) {
                        $scope.devices[i].address = xmlDoc2.getElementsByTagName("address")[0].childNodes[0].nodeValue;
                        if (xmlDoc2.getElementsByTagName("port")[0] != null) {
                            $scope.devices[i].port = xmlDoc2.getElementsByTagName("port")[0].childNodes[0].nodeValue;
                            // console.log(`Port: ${xmlDoc2.getElementsByTagName("port")[0].childNodes[0].nodeValue}`);
                        };
                        $scope.devices[i].authgroup = xmlDoc2.getElementsByTagName("authgroup")[0].childNodes[0].nodeValue;
                    }
                };
            };
            $scope.$digest();
        }, 1000);
        
    }, function errorCallback(response) {
        console.log(`Status: ${response.status}`);
    });
}])