/*jslint node: true */

var express = require('express'),
    _ = require('underscore'),
    app = express(),
    friends = [{
        id: 1,
        firstName: 'Tyson',
        lastName: 'Cadenhead'
    }, {
        id: 2,
        firstName: 'Jonathan',
        lastName: 'Creamer'
    }], list = [{
        id: 1,
        allItems: ['Dog', 'Chicken', 'Goat'],
        selectedItems: []
    }], id = 3;

// Configure all the things
app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.cookieParser());
    app.set('view engine', 'ejs');
    app.set("view options", { layout: false });

    // Set directories

    app.use(express['static']('bower_components'));
    app.use(express['static']('lib'));
    app.use(express['static']('examples'));
    app.use(express['static']('test'));
    //app.use(express['static'](__dirname));
    app.set('views', __dirname);
});

function getFriendItemIndex (id) {
    for (var i = 0; i < friends.length; i++) {
        if (friends[i].id == id) {
            return i;
        }
    }
}

// List
app.get('/friends', function(req, res) {
    res.send(friends);
});

// Insert
app.post('/friends', function (req, res) {
    var friend = _.extend(req.body, {
       id: id++ 
    });
    friends.push(friend);
    res.send(friend);
});

// Update
app.put('/friends/:id', function (req, res) {
    var friend = getFriendItemIndex(req.params.id);
    friends[friend] = _.extend(req.body, {
        id: req.params.id
    });
    res.send((friends[friend]) ? req.body : {
        error: true,
        message: 'There was an error updating your list'
    });
});

// Remove
app['delete']('/friends/:id', function (req, res) {
    var friend = getFriendItemIndex(req.params.id);

    if (typeof friend !== 'undefined') {
        friends.splice(friend, 1);
        res.send({
            success: true
        });
    } else {
        res.send({
            error: true,
            message: 'Your friend was deleted'
        });
    }
});

// Find
app.get('/friends/:id', function(req, res) {
    var friend = friends[getFriendItemIndex(req.params.id)];
    res.send(friend || {
        error: true,
        message: 'You have no friend'
    });
});

function getListItemIndex (id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].id == id) {
            return i;
        }
    }
}

// FindOne list item
app.get('/list/:id', function (req, res) {
    var item = list[getListItemIndex(req.params.id)];
    res.send(item || {
        error: true,
        message: 'There was an error finding your list'
    });
});

// Update list item
app.put('/list/:id', function (req, res) {
    var item = getListItemIndex(req.params.id);
    list[item] = req.body;
    res.send((list[item]) ? req.params : {
        error: true,
        message: 'There was an error updating your list'
    });
});

module.exports = app;