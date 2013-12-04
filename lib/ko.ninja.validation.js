define([
    'knockout',
    'underscore'
], function (ko, _) {

    return {

        validationTypes: {

            _custom: function (value, config) {
                return config.validator(value);
            },

            _min: function (value, config) {
                return value.length > config.value;
            },

            _max: function (value, config) {
                return value.length < config.value;
            },

            _length: function (value, config) {
                return value.length !== config.value;
            },

            _required: function (value) {
                return !value || !value.length;
            },

            _email: function (value) {
                return !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
            },

            _number: function (value) {
                return !(!isNaN(parseFloat(value)) && isFinite(value));
            }

        },

        _validate: function (validations, observable) {
            var value = (this[observable]) ? this[observable]() : null,
                errors = [];
            _.each(validations, function (config, name) {
                if (this.validationTypes['_' + name]) {
                    var inavalid = this.validationTypes['_' + name](value, config);
                    if (inavalid) {
                        if (typeof config === 'string') {
                            config = {
                                message: config
                            };
                        }
                        errors.push({
                            observable: observable,
                            error: config.message
                        });
                    }
                }
            }, this);
            return errors;
        },

        validateOne: function (observable) {
            var invalid = this._validate(this.validation[observable], observable);
            if (invalid.length) {
                return invalid[0].error;
            }
        },

        validateAll: function () {
            var errors = [];
            _.each(this.validation, function (validations, observable) {
                errors = errors.concat(this._validate(validations, observable));
            }, this);
            return errors;
        },

        validate: function () {
            var errors = {};
            this.errors(this.validateAll());
            _.each(this.errors(), function (error) {
                if (!errors[error.observable]) {
                    this[error.observable].error(error.error);
                    errors[error.observable] = true;
                }
            }, this);
            return (this.errors().length) ? this.errors() : null;
        },

        watchValidation: function (observable) {
            if (this[observable]) {
                this[observable].error = ko.observable();
                this[observable].subscribe(function () {
                    this[observable].error(this.validateOne(observable));
                    this.errors(this.validateAll());
                }.bind(this));
            }
        },

        watchValidations: function () {
            this.errors = ko.observableArray();
            _.each(this.validation, function (validation, observable) {
                this.watchValidation(observable);
            }, this);
        }

    };

});