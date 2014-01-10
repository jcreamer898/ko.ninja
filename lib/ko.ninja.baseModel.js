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

    //### ko.BaseModel
    var BaseModel = function (options) {

        options = options || {};

        if (_.isFunction(this.initialize)) {
            this.initialize(options);
        }
        
        _.extend(this, Events, {

            idAttribute: 'id',

            invalid: function () {
                if (!localStorage) {
                    return {
                        error: true,
                        message: 'There is no localStorage available in this context'
                    };
                }

                if (!this.name) {
                    return {
                        error: true,
                        message: 'This model has no name. Every model needs a name'
                    };
                }
            },

            save: function (data, done) {
                if (data[this.idAttribute]) {
                    return this.update(data[this.idAttribute], data, done);
                } else {
                    return this.insert(data, done);
                }
            }
            
        }, options);


    };

    BaseModel.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return BaseModel;
    } else {
        ko.ninjaBaseModel = BaseModel;
    }

}));