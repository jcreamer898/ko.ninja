define([
    'ko.ninja.storage'
], function (Storage) {

    module('ko.Storage', {
        setup: function () {
            this.storage = new Storage({
                options: {
                    name: 'friends',
                    storage: 'localStorage'
                }
            });
        },
        teardown: function () {
            localStorage.clear();
        }
    });

    asyncTest('when inserting data', function () {
        this.storage.insert({
            firstName: 'Jonathan',
            lastName: 'Creamer'
        }, function (data) {
            var record = JSON.parse(localStorage['friends-' + data.id]);
            ok(data.id, 'it should create an id');
            equal(record.firstName, 'Jonathan', 'it should set the firstName');
            equal(record.lastName, 'Creamer', 'it should set the lastName');
            start();
        });
    });

    asyncTest('when updating data', function () {
        localStorage['friends-1'] = JSON.stringify({ id: 1, firstName: 'Jonathan', lastName: 'Creamer' });
        this.storage.update('1', {
            id: 1,
            firstName: 'Tyson',
            lastName: 'Cadenhead'
        }, function () {
            var record = JSON.parse(localStorage['friends-1']);
            equal(record.firstName, 'Tyson', 'it should change the firstName');
            start();
        });
    });

    asyncTest('when using the save shortcut', function () {
        var self = this;
        this.storage.save({
            firstName: 'Jonathan'
        }, function (data) {
            var record = JSON.parse(localStorage['friends-' + data.id]);
            equal(record.firstName, 'Jonathan', 'it should save the friend');
            self.storage.save({
                id: data.id,
                firstName: 'Tyson'
            }, function (updatedData) {
                var record = JSON.parse(localStorage['friends-' + data.id]);
                equal(record.firstName, 'Tyson', 'it should update the friend');
                equal(updatedData.id, data.id, 'it should have the same id');
                start();
            });
        });
    });

    asyncTest('when removing data', function () {
        localStorage['friends-1'] = JSON.stringify({ id: 1, firstName: 'Jonathan', lastName: 'Creamer' });
        this.storage.remove('1', function () {
            ok(!localStorage['friends-1'], 'it should remove the record');
            start();
        });
    });

    asyncTest('when finding a single record', function () {
        localStorage['friends-1'] = JSON.stringify({ id: 1, firstName: 'Jonathan', lastName: 'Creamer' });
        this.storage.findOne('1', function (data) {
            equal(data.firstName, 'Jonathan', 'it should find the record');
            start();
        });
    });

    asyncTest('when we find multiple records', function () {
        localStorage['friends-1'] = JSON.stringify({ id: 1, firstName: 'Jonathan', lastName: 'Creamer' });
        localStorage['friends-2'] = JSON.stringify({ id: 2, firstName: 'Tyson', lastName: 'Cadenhead' });
        localStorage['friends-3'] = JSON.stringify({ id: 3, firstName: 'Trae', lastName: 'Cadenhead' });

        this.storage.find({
            lastName: 'Cadenhead'
        }, function (data) {
            equal(data.length, 2, 'it should get both records with the lastName of Cadenhead');
            equal(data[0].lastName, 'Cadenhead', 'it should have Cadenhead as the lastName of the first record');
            equal(data[0].lastName, 'Cadenhead', 'it should have Cadenhead as the lastName of the second record');
            start();
        });
    });

});