/*jslint node: true */

var express = require('express'),
    _ = require('underscore'),
    app = express(),
    fs = require('fs'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

// Configure all the things
app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.cookieParser());
    app.set('view engine', 'ejs');
    app.set('view options', { layout: false });

    // Set directories
    app.use(express['static']('bower_components'));
    app.use(express['static']('lib'));
    app.use(express['static']('examples'));
    app.use(express['static']('test'));
    app.set('views', __dirname);
});

// Require all of the modules in the server directory
fs.readdir('./server', function (err, files) {
    _.each(files, function (file) {
        require('./server/' + file)(app, io);
    });
});

//module.exports = app;
exports = module.exports = server;
// delegates user() function
exports.use = function() {
  app.use.apply(app, arguments);
};