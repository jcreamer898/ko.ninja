var _ = require('underscore');

module.exports = function (app) {

    var friends = [{
        id: 1,
        firstName: 'Tyson',
        lastName: 'Cadenhead'
    }, {
        id: 2,
        firstName: 'Jonathan',
        lastName: 'Creamer'
    }], id = 3;

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
                message: 'Your friend was not deleted'
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

};