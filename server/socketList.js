var _ = require('underscore');

module.exports = function (app, io) {

    var list = [{
        id: 1,
        allItems: ['Dog', 'Chicken', 'Goat'],
        selectedItems: []
    }];

    function getListItemIndex (id) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                return i;
            }
        }
    }

    io.sockets.on('connection', function (socket) {

        socket.on('list-findOne', function (data, done) {
            var item = list[getListItemIndex(data.id)];
            done(item || {
                error: true,
                message: 'There was an error finding your list'
            });
        });

        socket.on('list-update', function (data, done) {
            var item = getListItemIndex(data.id);
            list[item] = _.extend(data.data, {
                id: data.id
            });
            done((list[item]) ? list[item] : {
                error: true,
                message: 'There was an error updating your list'
            });
        });

    });

};