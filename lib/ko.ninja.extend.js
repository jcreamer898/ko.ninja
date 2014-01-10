/*global define */

(function (root, factory) {
    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko);
    }

} (this, function (_, ko) {

    'use strict';

    var Extend = function(protoProps, staticProps) {
        var parent = this,
            Surrogate,
            child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function() { return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) {
            _.extend(child.prototype, protoProps);
        }

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        if (protoProps.name) {
            child.prototype.toString = function() {
                return protoProps.name;
            };
        }

        return child;
    };

    if (typeof define === 'function' && define.amd) {
        return Extend;
    } else {
        ko.ninjaExtend = Extend;
    }

}));