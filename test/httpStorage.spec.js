define([
    'ko.ninja.httpStorage'
], function (Storage) {

    module('ko.httpStorage', {
        setup: function () {
            this.storage = new Storage({
                options: {
                    name: 'friends',
                    storage: 'http'
                },
                urlRoot: function () {
                    return '/friends/';
                }
            });
        },
        teardown: function () {
            localStorage.clear();
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

});