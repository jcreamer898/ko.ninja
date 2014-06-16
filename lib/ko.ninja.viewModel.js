/*global define */

(function (root, factory) {
    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'knockout',
            'underscore',
            'ko.ninja.events',
            'ko.ninja.pubsub',
            'ko.ninja.extend'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko, root._, root.ko.ninjaEvents, root.ko.ninjaPubSub, root.ko.ninjaExtend, root.ko.ninjaModel);
    }

} (this, function (ko, _, Events, PubSub, extend) {

    'use strict';

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
                this.trigger('change:' + prop, value);
            }, this);
        }, this);

        // Now process the computedObservables
        _.each(_.pick(this.observables, computedObservables), function(value, prop) {
            this[prop] = ko.computed({
                read: this.observables[prop],
                write: function () {
                    // Keeps it from breaking.
                    // Perhaps we need a way to allow writing to computed observables, though
                },
                owner: this
            }, this);
        }, this);
    };

    var setupModel = function () {
        var model = this.model;

        if (this.options && this.options.autoSync) {
            model.autoSync(this.options.autoSync, true);
        }

        _.each(model.observables, function (observable, name) {
            this[name] = model[name];
        }, this);

    };

    var setupCollections = function () {
        var collections = this.collections;
        for (var collection in collections) {
            if (collections.hasOwnProperty(collection)) {
                if (this.options && this.options.autoSync) {
                    collections[collection].autoSync(this.options.autoSync);
                }
                this[collection] = collections[collection]._models;
            }
        }
    };

    //### ko.ViewModel
    var ViewModel = function ViewModel(options) {

        options = options || {};

        if (this.model) {
            setupModel.call(this, options);
        }

        if (this.collections) {
            setupCollections.call(this, options);
        }

        setupObservables.call(this, options);

        this._setupSubscriptions(options);

        this.initialize.apply(this, arguments);

        options.el = options.el || this.el;

        if (options.el) {
            ko.applyBindings(this, (typeof options.el === 'object') ? options.el : document.querySelector(options.el)[0]);
        }

    };

    _.extend(ViewModel.prototype, Events, PubSub, {
        initialize: function() {}
    });

    ViewModel.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return ViewModel;
    } else {
        ko.ninjaViewModel = ViewModel;
    }

}));