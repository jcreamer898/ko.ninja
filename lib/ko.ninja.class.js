/*global define */

(function (root, factory) {
    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'knockout',
            'underscore',
            'ko.ninja.events',
            'ko.ninja.extend'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko, root._, root.ko.ninjaEvents, root.ko.ninjaExtend);
    }

} (this, function (ko, _, Events, extend) {

    'use strict';

    //### ko.Class
    var Class = function Class (options) {
        options = options || {};
        this._setupObservables.call(this, options);
        if (this._setup) {
            this._setup(options);
        }
        this.initialize(options);
    };

    _.extend(Class.prototype, Events, {

        _setupObservables: function(options) {

            if (!this.observables || !options) {
                return;
            }

            var computedObservables;

            _.each(options, function (value, name) {
                if (!_.isUndefined(this.observables[name])) {
                    this.observables[name] = value;
                    delete options[name];
                }
            }, this);

            computedObservables = _.functions(this.observables);

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
        },

        initialize: function() {}
    });

    Class.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return Class;
    } else {
        ko.ninjaClass = Class;
    }

}));