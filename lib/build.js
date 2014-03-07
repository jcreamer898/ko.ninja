require.config({
    paths: {
        'underscore': '../bower_components/underscore/underscore',
        'knockout': '../bower_components/knockout.js/knockout'
    },
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

define([
    'underscore',
    'knockout',
    'ko.ninja.viewModel',
    'ko.ninja.model',
    'ko.ninja.collection'
], function (_, ko, ViewModel, Model, Collection) {
    ko.ViewModel = ViewModel;
    ko.Model = Model;
    ko.Collection = Collection;
    return ko;
});