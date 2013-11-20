var _ = require('underscore');

module.exports = function (app) {

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

};