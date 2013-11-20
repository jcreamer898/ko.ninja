var _ = require('underscore');

module.exports = function (app, io) {

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

    // Friends
    io.sockets.on('connection', function (socket) {

        socket.on('friends-custom-find', function (data, done) {
            done({
                friends: friends,
                custom: true
            });
        });

        socket.on('friends-find', function (data, done) {
            done(friends);
        });

        socket.on('friends-findOne', function (data, done) {
            done(friends[getFriendItemIndex(data.id)] || {
                error: true,
                message: 'Could not find your friend'
            });
        });

        socket.on('friends-remove', function (data, done) {
            var friend = getFriendItemIndex(data.id);

            if (typeof friend !== 'undefined') {
                friends.splice(friend, 1);
                done({
                    success: true
                });
            } else {
                done({
                    error: true,
                    message: 'Your friend was not deleted'
                });
            }
        });

        socket.on('friends-update', function (data, done) {
            var friend = getFriendItemIndex(data.id);
            friends[friend] = _.extend(data.data, {
                id: data.id
            });
            done(friends[friend] || {
                error: true,
                message: 'There was an error updating your friend'
            });
        });

        socket.on('friends-insert', function (data, done) {
            var friend = _.extend(data.data, {
               id: id++ 
            });
            friends.push(friend);
            done(friend);
        });

    });

};