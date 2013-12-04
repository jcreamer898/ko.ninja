define([
    'knockout',
    'ko.ninja.viewModel'
], function (ko, ViewModel) {


    module('ko.ViewModel', {
        setup: function () {
            var Person = ViewModel.extend({
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

        this.person.firstName('Tyson');
        this.person.lastName('Cadenhead');

        setTimeout(function () {
            self.person.model.findOne(1, function (data) {
                equal(data.firstName, 'Tyson', 'it should set the first name to Tyson and save it automatically');
                equal(data.lastName, 'Cadenhead', 'it should set the last name to Cadenhead and save it automatically');
                start();
            });
        }, 400);

    });

    asyncTest('when we add a model to a ViewModel and then fetch the data', function () {
        var self = this;
        localStorage['person-1'] = JSON.stringify({ id: 1, firstName: 'Tyson', lastName: 'Cadenhead' });
        this.person.fetch(function () {
            equal(self.person.firstName(), 'Tyson', 'the ViewModel is updated with data from the model');
            ok(self.person.autoSync, 'it should reset autoSync to be on');
            start();
        });
    });

});