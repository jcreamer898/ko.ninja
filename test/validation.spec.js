define([
    'ko.ninja.model'
], function (Model) {

    module('ko.Validation', {
        setup: function () {
            this.Model = Model.extend({
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
            this.model = new this.Model();
        }
    });

    test('when validating a required field', function () {
        ok(this.model.validationTypes._required(), 'it should return true if the content is null');
        ok(this.model.validationTypes._required(''), 'it should return true if there is no content');
        ok(!this.model.validationTypes._required('hi!'), 'it should return null if there is content');
    });

    test('when validating an email field', function () {
        ok(this.model.validationTypes._email(), 'it should return true if the email is null');
        ok(this.model.validationTypes._email('hi!'), 'it should return true if the content is not an email address');
        ok(!this.model.validationTypes._email('hi@hello.com'), 'it should return null if it is a valid email address');
        ok(!this.model.validationTypes._email('coolperson123@hello.com'), 'it should allow numbers');
    });

    test('when validating a number', function () {
        ok(this.model.validationTypes._number(), 'it should not allow null');
        ok(this.model.validationTypes._number('hi'), 'it should not allow strings');
        ok(!this.model.validationTypes._number(123), 'it should allow numbers');
        ok(!this.model.validationTypes._number('77'), 'it should allow numbers in strings');
        ok(!this.model.validationTypes._number('12.2'), 'it should allow decimals');
    });

    test('when validating max length', function () {
        ok(!this.model.validationTypes._maxLength('test', {
            value: 4
        }), 'it should be null because it is the correct length');
        ok(!this.model.validationTypes._maxLength('test', {
            value: 5
        }), 'it should be null because it is higher than the max');
        ok(this.model.validationTypes._maxLength('test', {
            value: 3
        }), 'it should return an error because it is less than the max');
    });

    test('when validating min length', function () {
        ok(!this.model.validationTypes._minLength('test', {
            value: 4
        }), 'it should be null because it is the correct length');
        ok(!this.model.validationTypes._minLength('test', {
            value: 3
        }), 'it should be null because it is lower than the min');
        ok(this.model.validationTypes._minLength('test', {
            value: 5
        }), 'it should return an error because it is more than the min');
    });

    test('when validating a length', function () {
        ok(!this.model.validationTypes._length('test', {
            value: 4
        }), 'it should be null because it is the correct length');
        ok(this.model.validationTypes._length('test', {
            value: 3
        }), 'it should return an error because there are not enough characters');
        ok(this.model.validationTypes._length('test', {
            value: 5
        }), 'it should return an error because there are too many characters');
    });

    test('when validating a custom validator', function () {
        ok(this.model.validationTypes._custom('Jonathan', {
            validator: function (value) {
                return value !== 'Tyson';
            }
        }), 'it should return an error because Jonathan is not Tyson');
        ok(!this.model.validationTypes._custom('Jonathan', {
            validator: function (value) {
                return value !== 'Jonathan';
            }
        }), 'it should return null because Jonathan is himself');
    });

    test('when validating a single field in a model', function () {
        ok(this.model.validateOne('firstName').length, 'The first name should be invalid because it has no data');
        equal(this.model.validateOne('firstName'), 'The first name is required', 'it should report the correct error');
        this.model.firstName('Tyson');
        ok(!this.model.validateOne('firstName'), 'The first name should no longer be invalid');
    });

    test('when validating all of the observables in the model', function () {
        equal(this.model.validate().length, 3, 'it should return 3 errors');
        this.model.firstName('Tyson');
        this.model.email('tyson@tyson.com');
        this.model.phone('5555555555');
        ok(!this.model.validate(), 'it should pass the validation');
    });

});