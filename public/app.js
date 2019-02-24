var pgmblty = angular.module('pgmblty', ['ngRoute']);

pgmblty.config(function($httpProvider) {
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
});

pgmblty.config(['$routeProvider', function($routeProvider){
    $routeProvider.
        when('/', {
            templateUrl: 'views/opennet.view.html',
            controller: 'indexCtrl'
        }).
        when('/about', {
            templateUrl: 'views/about.view.html',
            controller: 'aboutCtrl'
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
        when('/onpoiareas', {
            templateUrl: 'views/onpoiareas.view.html',
            controller: 'onpoiareasCtrl'
        }).
        when('/onpeareas', {
            templateUrl: 'views/onpeareas.view.html',
            controller: 'onpeareasCtrl'
        }).
        when('/onaccessareas', {
            templateUrl: 'views/onaccessareas.view.html',
            controller: 'onaccessareasCtrl'
        }).
        when('/oncustomers', {
            templateUrl: 'views/oncustomers.view.html',
            controller: 'oncustomersCtrl'
        }).
        when('/onservices', {
            templateUrl: 'views/onservices.view.html',
            controller: 'onservicesCtrl'
        }).
        when('/onnetworkdevices', {
            templateUrl: 'views/onnetworkdevices.view.html',
            controller: 'onnetworkdevicesCtrl'
        }).
        when('/onoperations', {
            templateUrl: 'views/onoperations.view.html',
            controller: 'onoperationsCtrl'
        }).
        when('/onsplashscreen', {
            templateUrl: 'views/onsplashscreen.view.html',
            controller: 'onsplashscreenCtrl'
        }).
        when('/newcupyaccess', {
            templateUrl: 'views/newcupyaccess.view.html',
            controller: 'newcupyaccessCtrl'
        }).
        when('/newcupype', {
            templateUrl: 'views/newcupype.view.html',
            controller: 'newcupypeCtrl'
        }).
        when('/newcupypoi', {
            templateUrl: 'views/newcupypoi.view.html',
            controller: 'newcupypoiCtrl'
        }).
        when('/vlanpools', {
            templateUrl: 'views/vlanpools.view.html',
            controller: 'vlanpoolCtrl'
        }).
        when('/pseudowires', {
            templateUrl: 'views/pseudowires.view.html',
            controller: 'pseudowireCtrl'
        }).
        when('/accessareas', {
            templateUrl: 'views/accessareas.view.html',
            controller: 'accessareaCtrl'
        }).
        when('/inventory', {
            templateUrl: 'views/inventory.view.html',
            controller: 'inventoryCtrl'
        }).
		otherwise({redirectTo: '/'})
}]);
