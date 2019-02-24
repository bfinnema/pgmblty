angular.module('pgmblty')

.factory('NSOServer',[function() {
    return({
        host: "127.0.0.1",
        port: "8080",
        username: "admin",
        password: "admin"
    });

}])