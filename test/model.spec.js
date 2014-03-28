/*global define, module, test, equal */

define([
    'ko.ninja.model'
], function (Model) {

    'use strict';

    module('ko.model', {
        setup: function () {
            this.Friend = Model.extend({
                observables: {
                    id: null,
                    firstName: 'Tyson',
                    lastName: 'Cadenhead'
                },
                options: {
                    autoSync: false,
                    name: 'friend'
                }
            });
            this.friend = new this.Friend({
                id: 1,
                firstName: 'Linus'
            });
        },
        teardown: function () {
            localStorage.clear();
        }
    });

    test('when initializing a model', function () {
        equal(this.friend.options.name, 'friend', 'it should pass in parameters');
        equal(this.friend.options.autoSync, false);
        equal(typeof this.friend.initialize, 'function', 'it should inherit the baseClass');
    });

    test('when initializing with observables', function () {
        equal(this.friend.firstName(), 'Linus');
        this.friend.firstName('Milo');
        equal(this.friend.firstName(), 'Milo');
    });

    test('when we set something on the model', function () {
        this.friend.set('lastName', 'Creamer');
        equal(this.friend.get('lastName'), 'Creamer');
    });

    test('when we check to see if the model contains something', function () {
        this.friend.firstName('Tyson');
        ok(this.friend.has('firstName'));
        this.friend.firstName(null);
        ok(!this.friend.has('firstName'));
    });

    test('when we clear the items in the model', function () {
        this.friend.clear();
        ok(!this.friend.has('firstName'));
        ok(!this.friend.has('id'));
    });

    test('when we convert the data to JSON', function () {
        this.friend.firstName('Heather');
        this.friend.lastName('Cadenhead');
        equal(this.friend.toJSON().firstName, 'Heather');
        equal(this.friend.toJSON().lastName, 'Cadenhead');
    });

    test('when we get the id', function () {
        this.friend.id(123);
        equal(this.friend.getId(), 123);
    });

});