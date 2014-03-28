define([
    'knockout',
    'ko.ninja.viewModel',
    'ko.ninja.model'
], function (ko, ViewModel, Model) {


    module('ko.ViewModel', {
        setup: function () {
            var Person = Model.extend({
                observables: {
                    firstName: '',
                    lastName: '',
                    id: 0
                },
                options: {
                    name: 'person',
                    storage: 'localStorage'
                }
            });
            var PersonViewModel = ViewModel.extend({
                options: {
                    autoSync: true
                },
                model: new Person({
                    firstName: 'Jonathan',
                    lastName: 'Creamer',
                    id: 1
                })
            });

            this.person = new PersonViewModel();

        },
        teardown: function () {
            localStorage.clear();
        }
    });

    test('creating a ViewModel', function() {
        ok(ViewModel, 'should have a ViewModel constructor');

        var Person = ViewModel.extend({
            observables: {
                firstName: '',
                lastName: '',
                fullName: function() {
                    return this.firstName() + ' ' + this.lastName();
                }
            }
        });

        var me = new Person({
            firstName: 'Jonathan',
            lastName: 'Creamer'
        });

        ok(ko.isObservable(me.firstName), 'firstName should be a ko.observable');
        equal(me.firstName(), 'Jonathan', 'should set up observables');
        equal(me.fullName(), 'Jonathan Creamer', 'should set up computed observables');

    });

    test('changing property values', function() {
        var Person = ViewModel.extend({
            observables: {
                firstName: '',
                lastName: '',
                fullName: function() {
                    return this.firstName() + ' ' + this.lastName();
                }
            }
        });

        var me = new Person({
            firstName: 'Jonathan',
            lastName: 'Creamer'
        });

        ok(me.on, 'ViewModel should extend events');

        var called = false;
        me.on('change:firstName', function() {
            called = true;
        });
        me.firstName('foo');

        ok(called, 'should call the change event');
    });

    asyncTest('when we add a model to a ViewModel and then update the data', function () {

        var self = this;

        this.person.model.firstName('Tyson');
        this.person.model.lastName('Cadenhead');
        this.person.model.save();

        setTimeout(function () {
            self.person.model.findOne(1, function (data) {
                equal(data.firstName, 'Tyson', 'it should set the first name to Tyson and save it automatically');
                equal(data.lastName, 'Cadenhead', 'it should set the last name to Cadenhead and save it automatically');
                start();
            });
        }, 400);

    });

    // TODO: Move this to a collection
    /*asyncTest('when we add a model to a ViewModel and then fetch the data', function () {
        var self = this;
        localStorage['person-1'] = JSON.stringify({ id: 1, firstName: 'Tyson', lastName: 'Cadenhead' });
        this.person.fetch(function () {
            equal(self.person.firstName(), 'Tyson', 'the ViewModel is updated with data from the model');
            ok(self.person.autoSync, 'it should reset autoSync to be on');
            start();
        });
    });*/

    asyncTest('when the model is set to autoSync and the data changes', function () {
        this.person.model.save = function () {
            ok(1, 'it should automatically save the data that changed');
            start();
        };
        this.person.firstName('Linusaur');
    });

    asyncTest('when the model is set to autoSync false and the data changes', function () {
        var Person = ViewModel.extend({
            autoSync: false,
            observables: {
                firstName: 'Jonathan',
                lastName: 'Creamer',
                id: 1
            },
            model: {
                name: 'person'
            }
        });

        this.person = new Person();

        this.person.model.save = function () {
            ok(0, 'it should not automatically save the data that changed');
        };
        this.person.firstName('Linusaur');

        ok(1, 'it should skip the saving and get to this');
        start();

    });

});