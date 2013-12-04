/*global io */

define([
    'ko.ninja.baseModel',
    'underscore'
], function (BaseModel, _) {

    return BaseModel.extend({

        find: function (query, done) {
            if (!done) {
                done = query;
            }
            this.socket.emit(this.messageNames.find, {
                data: query
            }, done);
        },

        findOne: function (id, done) {
            this.socket.emit(this.messageNames.findOne, {
                id: id
            }, done);
        },

        insert: function (data, done) {
            this.socket.emit(this.messageNames.insert, {
                data: data
            }, done);
        },

        remove: function (id, done) {
            this.socket.emit(this.messageNames.remove, {
                id: id
            }, done);
        },

        update: function (id, data, done) {
            this.socket.emit(this.messageNames.update, {
                id: id,
                data: data
            }, done);
        },

        initialize: function (options) {

            this.socket = io.connect((options.protocol || 'http')+ '://' + (options.hostName || 'localhost') + ':' + (options.port || '8080'));

            // This lets us override the message names if we want to
            this.messageNames = _.extend({
                'update': options.name + '-update',
                'insert': options.name + '-insert',
                'find': options.name + '-find',
                'findOne': options.name + '-findOne',
                'remove': options.name + '-remove'
            }, options.messageNames || {});
            
        }

    });

});