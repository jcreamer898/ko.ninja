define([
    'baseModel'
], function (BaseModel) {

    return BaseModel.extend({

        urlRoot: function () {
            return ((this.name) ? '/' + this.name : '') + '/';
        },

        find: function (query) {
            console.log('find', query);
            return this;
        },

        findOne: function () {
            return this;
        }

    });

});