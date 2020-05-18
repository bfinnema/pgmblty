var makeOptions = function (pathEnd, method, body) {
    // console.log(`In the function: User: ${process.env.NSO_USER}, Password: ${process.env.NSO_PWD}`);
    var auth = new Buffer.from(process.env.NSO_USER + ':' + process.env.NSO_PWD).toString('base64');
    // console.log(`Encoded Authentication: ${auth}`);
  
    var options = {
        method: method,
        url: `http://${process.env.NSO_ADDRESS}:${process.env.NSO_PORT}/restconf/data${pathEnd}`,
        headers: {
            'Authorization': 'Basic '+auth,
            'Accept': 'application/yang-data+json',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/yang-data+json'
        }
    };
    if (body) {
        options.body = body;
    };
    // console.log(`Options url: ${options.url}`);
  
    return options;
};

exports.makeOptions = makeOptions;