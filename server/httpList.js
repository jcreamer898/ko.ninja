var _ = require('underscore');

module.exports = function (app) {

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

    app.get('/item', function (req, res) {
        res.send(list);
    });

    // FindOne list item
    app.get('/item/:id', function (req, res) {
        var item = list[getListItemIndex(req.params.id)];
        res.send(item || {
            error: true,
            message: 'There was an error finding your list'
        });
    });

    // Insert list item
    app.post('/item', function (req, res) {
        var data = req.body;
        data.id = new Date().getTime();
        list.push(data);
        res.send(data);
    });

    // Update list item
    app.put('/item/:id', function (req, res) {
        var item = getListItemIndex(req.params.id);
        list[item] = req.body;
        res.send((list[item]) ? req.params : {
            error: true,
            message: 'There was an error updating your list'
        });
    });

    // Delete list item
    app['delete']('/item/:id', function (req, res) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == req.params.id) {
                list.splice(i, 1);
                res.send({
                    success: true
                });
            }
        }
    });

};