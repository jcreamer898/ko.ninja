define([
    'extend',
    'localStorageModel',
    'httpModel'
], function (extend, LocalStorageModel, HttpModel) {
    var Model = function (options) {
        var model;
        switch (options.storage) {
            case 'http':
                model = new HttpModel(options);
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