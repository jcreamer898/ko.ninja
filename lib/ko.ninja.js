define([
    'underscore',
    'knockout',
    'ko.ninja.viewModel',
    'ko.ninja.model'
], function (_, ko, ViewModel, Model) {
    ko.ViewModel = ViewModel;
    ko.Model = Model;
    return ko;
});