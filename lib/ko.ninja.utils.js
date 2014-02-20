/*global define */

(function (root, factory) {

    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'knockout'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko);
    }

} (this, function (ko) {

    'use strict';

    var utils = {
        guid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };

    if (typeof define === 'function' && define.amd) {
        return utils;
    } else {
        ko.ninjaUtils = utils;
    }

}));