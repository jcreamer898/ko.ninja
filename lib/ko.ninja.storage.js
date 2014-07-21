/*global define, ko */

(function (root, factory) {

    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'ko.ninja.extend',
            'ko.ninja.localStorage',
            'ko.ninja.httpStorage',
            'ko.ninja.socketStorage'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaExtend, root.ko.ninjaLocalStorage, root.ko.ninjaSocketStorage);
    }

} (this, function (extend, LocalStorageStorage, HttpStorage, SocketStorage) {

    'use strict';

    var Storage = function (options) {
        var storage;
        if (!options || !options.options || !options.options.storage) {
            return {};
        }
        switch (options.options.storage) {
            case 'http':
                storage = new HttpStorage(options);
                break;
            case 'socket.io':
                storage = new SocketStorage(options);
                break;
            case 'localStorage':
                storage = new LocalStorageStorage(options);
                break;
        }
        return storage;
    };

    Storage.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return Storage;
    } else {
        ko.ninjaStorage = Storage;
    }

}));