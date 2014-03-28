/*global define, module, test, equal, ok */

define([
    'ko.ninja.collection',
    'ko.ninja.model'
], function (Collection, Model) {

    'use strict';

    module('ko.model', {
        setup: function () {
            var Dog = Model.extend({
                observables: {
                    id: 0,
                    name: '',
                    fullBreed: false
                }
            });

            this.Dogs = Collection.extend({
                model: Dog,
                options: {
                    name: 'dogs',
                    storage: 'localStorage'
                }
            });
        },
        teardown: function () {
            localStorage.clear();
        }
    });

    test('when we create a new collection and pass in data', function () {
        var dogs = new this.Dogs([{
            id: 1, name: 'Arthur'
        }]);
        equal(dogs.get(1).name(), 'Arthur');
    });

    test('when we insert a new model', function () {
        var dogs = new this.Dogs([{
            id: 1, name: 'Arthur'
        }]);
        dogs.insert({
            id: 2,
            name: 'Midnight'
        });
        equal(dogs.get(2).name(), 'Midnight', 'it should push the new model into the collection');
    });

    test('when we count the number of models in the collection', function () {
        var dogs = new this.Dogs([{
            id: 1, name: 'Arthur'
        }, {
            id: 2, name: 'Midnight'
        }]);
        equal(dogs.count(), 2, 'there should be 2 dogs');
        dogs.insert({
            id: 3,
            name: 'Sparky'
        });
        equal(dogs.count(), 3, 'there should be 3 dogs');
    });

    test('when we remove a model from the collection', function () {
        var dogs = new this.Dogs([{
            id: 1, name: 'Arthur'
        }, {
            id: 2, name: 'Midnight'
        }]);
        equal(dogs.count(), 2, 'there should be 2 dogs');
        dogs.remove(1);
        equal(dogs.count(), 1, 'there should be 1 dog');
    });

    test('when removing multiple items from the collections', function () {
        var dogs = new this.Dogs([{
            id: 1, name: 'Arthur'
        }, {
            id: 2, name: 'Midnight'
        }]);
        equal(dogs.count(), 2, 'there should be 2 dogs');
        dogs.remove([1,2]);
        equal(dogs.count(), 0, 'there should be no dogs');
    });

    test('when we find the models without passing in a condition', function () {
        var dogs = new this.Dogs([{
            id: 1, name: 'Arthur'
        }, {
            id: 2, name: 'Midnight'
        }]);
        var midnight = dogs.find()[1];
        equal(midnight.name(), 'Midnight');
    });

    test('when we find the models without passing in a condition', function () {
        var dogs = new this.Dogs([{
            id: 1, name: 'Arthur', fullBreed: false
        }, {
            id: 2, name: 'Midnight', fullBreed: false
        }, {
            id: 3, name: 'Sparky', fullBreed: true
        }]);
        var mutts = dogs.find({
            fullBreed: false
        });
        equal(mutts.length, 2);
    });

    test('when we add a model at a specific position', function () {
        var dogs = new this.Dogs([{
            id: 1, name: 'Arthur', fullBreed: false
        }, {
            id: 3, name: 'Sparky', fullBreed: true
        }]);
        dogs.insert({
            id: 2, name: 'Midnight', fullBreed: false
        }, {
            position: 1
        });
        equal(dogs._models()[1].name(), 'Midnight');
    });

    test('when we convert the collection to JSON', function () {
        var dogs = new this.Dogs([{
            id: 1, name: 'Arthur', fullBreed: false
        }, {
            id: 3, name: 'Sparky', fullBreed: true
        }]), json;
        json = dogs.toJSON();
        equal(json[0].name, 'Arthur');
        equal(json[1].name, 'Sparky');
        ok(json[1].fullBreed);
        ok(!json[0].fullBreed);
    });

});