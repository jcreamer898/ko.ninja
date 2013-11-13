define([
    'underscore',
    'events',
    'extend'
], function (_, Events, extend) {

    //### ko.BaseModel
    var BaseModel = function (options) {

        options = options || {};
        
        _.extend(this, Events, {

            idAttribute: 'id',

            invalid: function () {
                if (!localStorage) {
                    return {
                        error: true,
                        message: 'There is no localStorage available in this context'
                    };
                }

                if (!this.name) {
                    return {
                        error: true,
                        message: 'This model has no name. Every model needs a name'
                    };
                }
            },

            save: function (data, done) {
                if (data[this.idAttribute]) {
                    return this.update(data[this.idAttribute], data, done);
                } else {
                    return this.insert(data, done);
                }
            }
            
        }, options);

    };

    BaseModel.extend = extend;

    return BaseModel;

});