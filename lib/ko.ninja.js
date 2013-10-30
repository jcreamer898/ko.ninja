/*(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['knockout', 'underscore'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('knockout'), require('underscore'));
    } else {
        root.ko = factory(root.ko, root._);
    }
}(this, function (ko, _) {

    return ko;

}));*/

define([
    'underscore',
    'knockout',
    'viewModel',
    'model'
], function (_, ko, ViewModel, Model) {
    ko.ViewModel = ViewModel;
    ko.Model = Model;
    return ko;
});