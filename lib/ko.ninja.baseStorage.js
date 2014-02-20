/*global define */

(function (root, factory) {
    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'underscore',
            'ko.ninja.events',
            'ko.ninja.extend'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko.ninjaEvents, root.ko.ninjaExtend, root.ko);
    }

} (this, function (_, Events, extend, ko) {

    'use strict';

    //### ko.BaseStorage
    var BaseStorage = function (options) {

        options = options || {};

        if (_.isFunction(this.initialize)) {
            this.initialize(options);
        }
        
        _.extend(this, Events, {

            options: {},

            idAttribute: 'id',

            invalid: function () {
                if (!localStorage) {
                    return {
                        error: true,
                        message: 'There is no localStorage available in this context'
                    };
                }

                if (!this.options.name) {
                    return {
                        error: true,
                        message: 'This storage has no name. Every storage needs a name'
                    };
                }
            },

            save: function (data, done) {

                // If no data is passed in, send all of the observables off to be saved
                if (!data) {
                    data = {};
                    _.each(this.observables, function (value, name) {
                        data[name] = this[name]();
                    }, this);
                }

                if (data[this.idAttribute]) {
                    return this.update(data[this.idAttribute], data, done);
                } else {
                    return this.insert(data, done);
                }
            },

            fetch: function () {
            }
            
        }, options);


    };

    BaseStorage.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return BaseStorage;
    } else {
        ko.ninjaBaseStorage = BaseStorage;
    }

}));