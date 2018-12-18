var pgmblty = angular.module('pgmblty', ['ngRoute']);

pgmblty.config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
});

pgmblty.config(['$routeProvider', function($routeProvider){
    $routeProvider.
        when('/', {
            templateUrl: 'views/index.view.html',
            controller: 'indexCtrl'
        }).
        when('/apic', {
            templateUrl: 'views/apic.view.html',
            controller: 'apicCtrl'
        }).
        when('/opennet', {
            templateUrl: 'views/opennet.view.html',
            controller: 'opennetCtrl'
        }).
        when('/onserviceproviders', {
            templateUrl: 'views/onserviceproviders.view.html',
            controller: 'onserviceprovidersCtrl'
        }).
        when('/onservices', {
            templateUrl: 'views/onservices.view.html',
            controller: 'onservicesCtrl'
        }).
        when('/onnetworkdevices', {
            templateUrl: 'views/onnetworkdevices.view.html',
            controller: 'onnetworkdevicesCtrl'
        }).
		otherwise({redirectTo: '/'})
}]);
