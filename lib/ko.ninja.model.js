define([
    'ko.ninja.extend',
    'ko.ninja.localStorageModel',
    'ko.ninja.httpModel',
    'ko.ninja.socketModel'
], function (extend, LocalStorageModel, HttpModel, SocketModel) {
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
    return Model;
});