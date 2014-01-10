/*global define */

(function (root, factory) {
    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'underscore',
            'knockout',
            'ko.ninja.viewModel',
            'ko.ninja.model'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko, root.ko.ninjaViewModel, root.ko.ninjaModel);
    }

} (this, function (_, ko, ViewModel, Model) {

    'use strict';

    ko.ViewModel = ViewModel;
    ko.Model = Model;

    // AMD
    if (typeof define === 'function' && define.amd) {
        return ko;

    // Non-AMD
    } else {
        ko.ViewModel = ViewModel;
        ko.Model = Model;
    }

}));