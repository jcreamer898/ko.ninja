/*global define, ko */

(function (root, factory) {

    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'ko.ninja.extend',
            'ko.ninja.localStorageModel',
            'ko.ninja.httpModel',
            'ko.ninja.socketModel'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaExtend, root.ko.ninjaLocalStorageModel, root.ko.ninjaSocketModel);
    }

} (this, function (extend, LocalStorageModel, HttpModel, SocketModel) {

    'use strict';

    var Model = function (options) {
        var model;
        switch (options.storage) {
            case 'http':
                model = new HttpModel(options);
                break;
            case 'socket.io':
                model = new SocketModel(options);
                break;
            default:
                model = new LocalStorageModel(options);
                break;
        }
        return model;
    };

    Model.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return Model;
    } else {
        ko.ninjaModel = Model;
    }

}));