angular.module('pgmblty')

.factory('NSOServer',[function() {
    return({
        host: "10.101.1.102",
        port: "8080",
        username: "admin",
        password: "admin"
    });

}])