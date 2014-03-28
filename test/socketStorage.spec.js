define([
    'ko.ninja.socketStorage'
], function (Storage) {

    module('ko.SocketStorage', {
        setup: function () {
            this.storage = new Storage({
                options: {
                    storage: 'socket.io',
                    name: 'friends',
                    port: 8003
                }
            });
        }
    });

    asyncTest('when the user attempts to find an array of records', function () {
        this.storage.find(function (data) {
            equal(typeof data, 'object', 'the storage should return an array');
            start();
        });
    });

    asyncTest('when the user attempts to find a single record', function () {
        this.storage.findOne(1, function (data) {
            equal(data.id, '1', 'the storage should find a match');
            start();
        });
    });

    asyncTest('when the user attempts to create a new record', function () {
        var self = this;
        this.storage.insert({
            firstName: 'Linus',
            lastName: 'Cadenhead'
        }, function (data) {
            self.storage.findOne(data.id, function (data) {
                equal(data.firstName, 'Linus', 'the storage should have inserted the first name');
                equal(data.lastName, 'Cadenhead', 'the storage should have inserted the last name');
                start();
            });
        });
    });

    asyncTest('when the user attempts to update an existing record', function () {
        var self = this;
        self.storage.insert({
            firstName: 'Linus',
            lastName: 'Cadenhead'
        }, function (data) {
            self.storage.update(data.id, {
                firstName: 'Milo',
                lastName: 'Cadenhead'
            }, function (data) {
                equal(data.firstName, 'Milo', 'the storage should have been updated');
                start();
            });
        });
    });

    asyncTest('when the the user attempts to create a custom find message name', function () {
        new Storage({
            options: {
                name: 'friends',
                storage: 'socket.io',
                port: 8003,
                messageNames: {
                    'find': 'friends-custom-find'
                }
            }
        }).find(function (data) {
            ok(data.custom, 'it should use the custom message name');
            start();
        });
    });

});