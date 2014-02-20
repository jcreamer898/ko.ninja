/*global io, define */

(function (root, factory) {
    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'ko.ninja.baseStorage',
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaBaseStorage, root._, root.ko);
    }

} (this, function (BaseStorage, _, ko) {

    'use strict';

    var SocketStorage = BaseStorage.extend({

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

            options = options || {};

            this.options = _.extend({
                protocol: 'http',
                hostName: 'localhost',
                port: 8080,
                name: 'list'
            }, options.options || {});

            this.socket = io.connect(this.options.protocol + '://' + this.options.hostName + ':' + this.options.port);

            // This lets us override the message names if we want to
            this.messageNames = _.extend({
                'update': this.options.name + '-update',
                'insert': this.options.name + '-insert',
                'find': this.options.name + '-find',
                'findOne': this.options.name + '-findOne',
                'remove': this.options.name + '-remove'
            }, this.options.messageNames || {});
            
        }

    });

    if (typeof define === 'function' && define.amd) {
        return SocketStorage;
    } else {
        ko.ninjaSocketStorage = SocketStorage;
    }

}));