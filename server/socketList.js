var _ = require('underscore');

module.exports = function (app, io) {

    var list = [{
        id: 1,
        name: 'Green Eggs'
    }, {
        id: 2,
        name: 'Ham'
    }];

    function getListItemIndex (id) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                return i;
            }
        }
    }

    io.sockets.on('connection', function (socket) {

        socket.on('meals-find', function (data, done) {
            done(list);
        });

        socket.on('meal-remove', function (data, done) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].id == data.id) {
                    list.splice(i, 1);
                    done({
                        success: true
                    });
                }
            }
        });

        socket.on('meal-insert', function (data, done) {
            data.data.id = new Date().getTime();
            list.push(data.data);
            done(data.data);
        });

    });

};