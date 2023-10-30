#!/usr/bin/env node

/*__________________________Module dependencies_____________________*/
import debug from 'debug';
import http from 'http';
import path from 'path';
import {glob} from 'glob';

import app from './app.js';
import logger from '../helpers/loggerWinston.js';


/*__________________________Check note version_____________________*/
// const [major, minor] = process.versions.node.split('.').map(parseFloat);
// if (major < 10 || (major === 10 && minor <= 0)) {
//     logger.error(
//         'Please go to nodejs.org and download version 10 or greater. 👌\n '
//     );
//     process.exit();
// }

// const files = glob.sync('./models/*.js');
// console.log(files);
// files.forEach(function (file) {
//   console.log(1);
//   // Thực hiện tác vụ với tệp, ví dụ: import tệp, thực thi, v.v.
//   path.resolve(file);
// });
console.log("Here");
/*__________________________Server settings__________________________*/
//Get port from environment and store in Express
let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

//Create http server
var server = http.createServer(app);

//Listen on provided port, on all network interfaces
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
/*__________________________Function Other__________________________*/
/**
 * Nomorlize apoort into a number, string or false
 * @param {String} val String will be convert to port number
 * @returns {Number} Value of Port or Pipe base on val
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        //named pipe
        return val;
    }
    if (port >= 0) {
        //port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server 'error' event => Exit with error
 * @param {Object} error Error object
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    //handle specific listen error with friends message
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        case 'ECONNREFUSED':
            console.error(bind + ' connot connect to MongoDB.');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listen for HTTP server 'listening' event
 */
function onListening() {
    console.log('Start in port: ${port}');
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'Pipe ' + addr : 'Port ' + addr.port;

    debug('Listening on ' + bind);
}