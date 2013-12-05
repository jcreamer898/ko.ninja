define([
    'ko.ninja.viewModel'
], function (ViewModel) {

    module('ko.Validation', {
        setup: function () {
            this.ViewModel = ViewModel.extend({
                observables: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: null
                },
                validation: {
                    firstName: {
                        required: 'The first name is required'
                    },
                    email: {
                        email: 'Please enter a valid email address'
                    },
                    phone: {
                        number: 'Please enter a valid number'
                    }
                }
            });
            this.viewModel = new this.ViewModel();
        }
    });

    test('when validating a required field', function () {
        ok(this.viewModel.validationTypes._required(), 'it should return true if the content is null');
        ok(this.viewModel.validationTypes._required(''), 'it should return true if there is no content');
        ok(!this.viewModel.validationTypes._required('hi!'), 'it should return null if there is content');
    });

    test('when validating an email field', function () {
        ok(this.viewModel.validationTypes._email(), 'it should return true if the email is null');
        ok(this.viewModel.validationTypes._email('hi!'), 'it should return true if the content is not an email address');
        ok(!this.viewModel.validationTypes._email('hi@hello.com'), 'it should return null if it is a valid email address');
        ok(!this.viewModel.validationTypes._email('coolperson123@hello.com'), 'it should allow numbers');
    });

    test('when validating a number', function () {
        ok(this.viewModel.validationTypes._number(), 'it should not allow null');
        ok(this.viewModel.validationTypes._number('hi'), 'it should not allow strings');
        ok(!this.viewModel.validationTypes._number(123), 'it should allow numbers');
        ok(!this.viewModel.validationTypes._number('77'), 'it should allow numbers in strings');
        ok(!this.viewModel.validationTypes._number('12.2'), 'it should allow decimals');
    });

    test('when validating max length', function () {
        ok(!this.viewModel.validationTypes._maxLength('test', {
            value: 4
        }), 'it should be null because it is the correct length');
        ok(!this.viewModel.validationTypes._maxLength('test', {
            value: 5
        }), 'it should be null because it is higher than the max');
        ok(this.viewModel.validationTypes._maxLength('test', {
            value: 3
        }), 'it should return an error because it is less than the max');
    });

    test('when validating min length', function () {
        ok(!this.viewModel.validationTypes._minLength('test', {
            value: 4
        }), 'it should be null because it is the correct length');
        ok(!this.viewModel.validationTypes._minLength('test', {
            value: 3
        }), 'it should be null because it is lower than the min');
        ok(this.viewModel.validationTypes._minLength('test', {
            value: 5
        }), 'it should return an error because it is more than the min');
    });

    test('when validating a length', function () {
        ok(!this.viewModel.validationTypes._length('test', {
            value: 4
        }), 'it should be null because it is the correct length');
        ok(this.viewModel.validationTypes._length('test', {
            value: 3
        }), 'it should return an error because there are not enough characters');
        ok(this.viewModel.validationTypes._length('test', {
            value: 5
        }), 'it should return an error because there are too many characters');
    });

    test('when validating a custom validator', function () {
        ok(this.viewModel.validationTypes._custom('Jonathan', {
            validator: function (value) {
                return value !== 'Tyson';
            }
        }), 'it should return an error because Jonathan is not Tyson');
        ok(!this.viewModel.validationTypes._custom('Jonathan', {
            validator: function (value) {
                return value !== 'Jonathan';
            }
        }), 'it should return null because Jonathan is himself');
    });

    test('when validating a single field in a viewModel', function () {
        ok(this.viewModel.validateOne('firstName').length, 'The first name should be invalid because it has no data');
        equal(this.viewModel.validateOne('firstName'), 'The first name is required', 'it should report the correct error');
        this.viewModel.firstName('Tyson');
        ok(!this.viewModel.validateOne('firstName'), 'The first name should no longer be invalid');
    });

    test('when validating all of the observables in the viewModel', function () {
        equal(this.viewModel.validate().length, 3, 'it should return 3 errors');
        this.viewModel = new ViewModel({
            firstName: 'Tyson',
            email: 'tyson@tyson.com',
            phone: '5555555555'
        });
        ok(!this.viewModel.validate(), 'it should pass the validation');
    });

});