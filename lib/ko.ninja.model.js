/*global define */

(function (root, factory) {

    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'underscore',
            'ko.ninja.extend',
            'ko.ninja.storage',
            'knockout',
            'ko.ninja.validation',
            'ko.ninja.observables',
            'ko.ninja.events',
            'ko.ninja.pubsub'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko.ninjaExtend, root.ko.ninjaStorage, root.ko, root.ko.ninjaValidation, root.ko.ninjaObservables, root.ko.ninjaEvents, root.ko.ninjaPubSub);
    }

} (this, function (_, extend, Storage, ko, Validation, Observables, Events, PubSub) {

    'use strict';

    var Model = function (options) {

        options = options || {};

        this._setupObservables.call(this, options);
        
        _.extend(this, new Storage(_.extend({}, this, options)));

        if (this.validation) {
            this.watchValidations();
        }

        // Setup Pub / Sub
        this._setupSubscriptions(options);

        this.initialize(options);
    };

    _.extend(Model.prototype, Events, Observables, Validation, PubSub, {

        idAttribute: 'id',

        /**
        * Returns the Id
        * @method getId
        */
        getId: function () {
            return this[this.idAttribute]();
        },

        /**
        * @method get
        * @param {String} name
        */
        get: function (name) {
            if (!this[name]) {
                throw 'get observable not found';
            }
            return this[name]();
        },

        /**
        * @method set
        * @param {String} name
        * @param {Object} value
        */
        set: function (name, value) {

            // Take an entire object and set all of the observables with it
            if (_.isObject(name)) {
                for (var item in name) {
                    if (name.hasOwnProperty(item)) {
                        this.set(item, name[item]);
                    }
                }

            // Set a single observable
            } else if (_.isFunction(this[name]) && this[name]() !== value) {
                this[name](value);
            }
        },

        /**
        * @method has
        * @param {String} name
        */
        has: function (name) {
            if (!this[name]) {
                return;
            }
            return !!this[name]();
        },

        /**
        * @method clear
        */
        clear: function () {
            _.each(this.observables, function (observable, name) {
                this[name](null);
            }, this);
        },

        /**
        * @method toJSON
        */
        toJSON: function () {
            var json = {};
            _.each(this.observables, function (observable, name) {
                json[name] = this[name]();
            }, this);
            return json;
        },

        /**
        * @method autoSync
        * @param {Boolean} autoSync
        * @param {Boolean} fetch Fetch the data right away
        */
        autoSync: function (autoSync, fetch) {

            var self = this;

            if (autoSync) {

                // Grab the data right away
                if (fetch) {
                    this.findOne(this.getId(), function (data) {
                        self.set(data);
                    });
                }

                // Automatically save the data when a change occurs
                _.each(this.observables, function (value, name) {
                    this[name].subscribe(function () {
                        self.save();
                    });
                }, this);
            }
        },

        initialize: function () {}

    });

    Model.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return Model;
    } else {
        ko.ninjaModel = Model;
    }

}));