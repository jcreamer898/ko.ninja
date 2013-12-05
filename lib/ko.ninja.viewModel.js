define([
    'knockout',
    'underscore',
    'ko.ninja.events',
    'ko.ninja.extend',
    'ko.ninja.model',
    'ko.ninja.validation'
], function (ko, _, Events, extend, Model, Validation) {

    var setupObservables = function(options) {
        var computedObservables = _.functions(this.observables);

        computedObservables = _.reduce(this.observables, function(memo, value, prop) {
            if (_.isObject(value) && !_.isArray(value) && (value.read || value.write)) {
                memo.push(prop);
            }
            return memo;
        }, computedObservables);

        // Process the observables first
        _.each(_.omit(this.observables, computedObservables), function (value, prop) {
            if (_.isArray(value)) {
                if (ko.isObservable(options[prop])) {
                    this[prop] = options[prop];
                }
                else {
                    this[prop] = ko.observableArray((options[prop] || value).slice(0));
                }
            }
            else {
                if (ko.isObservable(options[prop])) {
                    this[prop] = options[prop];
                }
                else {
                    this[prop] = ko.observable(options[prop] || value);
                }
            }

            this[prop].subscribe(function(value) {
                this.trigger("change:" + prop, value);
            }, this);
        }, this);

        // Now process the computedObservables
        _.each(_.pick(this.observables, computedObservables), function(value, prop) {
            this[prop] = ko.computed(this.observables[prop], this);
        }, this);
    };

    var setupValidation = function() {

    };

    var setupModel = function () {
        var self = this;
        var sync = function () {
            var data = {};
            _.each(self.observables, function (val, name) {
                data[name] = self[name]();
            });
            self.model.save(data, function () {});
        }, debounceSync = _.debounce(sync, 1);

        if (!this.model.status) {
            this.model = new Model(this.model);
        }

        this.autoSync = true,
        this.fetch = function (done) {
            var self = this,
                autoSync = this.autoSync;

            this.autoSync = false;
            this.model.findOne(this[this.idAttribute || 'id'](), function (data) {
                _.each(data, function (value, name) {
                    if (typeof self[name] === 'function') {
                        self[name](value);
                    }
                });
                self.autoSync = autoSync;
                if (_.isFunction(done)) {
                    done();
                }
            });
        };

        _.each(this.observables, function (val, name) {
            self[name].subscribe(function () {
                if (self.autoSync && !self.validateAll().length) {
                    debounceSync();
                }
            });
        });
    };

    //### ko.ViewModel
    var ViewModel = function ViewModel(options) {

        options = options || {};

        setupObservables.call(this, options);

        this.watchValidations();

        if (this.validation) {
            setupValidation.call(this);
        }

        this.initialize.apply(this, arguments);

        if (this.model) {
            setupModel.call(this, options);
        }

        if (this.autoSync) {
            this.fetch();
        }

        if (this.el) {
            ko.applyBindings(this, (typeof this.el === 'object') ? this.el : document.querySelector(this.el)[0]);
        }

    };

    _.extend(ViewModel.prototype, Events, Validation, {
        initialize: function() {}
    });

    ViewModel.extend = extend;

    return ViewModel;

});