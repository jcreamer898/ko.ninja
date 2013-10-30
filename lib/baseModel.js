define([
    'underscore',
    'events',
    'extend'
], function (_, Events, extend) {

    //### ko.BaseModel
    var BaseModel = function (options) {

        options = options || {};
        
        _.extend(this, Events, {

            status: 'processing',
            idAttribute: 'id',

            setTransaction: function (name, id) {
                this._transaction = name;
                this._transactionId = id;
            },

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

            done: function (fn) {
                var self = this;
                if (this.status !== 'processing') {

                    if (this._transaction) {
                        this.trigger(this._transaction + '-done');
                        if (this._transactionId) {
                            this.trigger(this._transaction + '-' + this._transactionId + '-done');
                        }
                        this.setTransaction();
                    }

                    if (this.status && this.status.error) {
                        fn.call(this, null, this.status);
                    } else {
                        fn.call(this, this.status);
                    }
                    this.status = 'processing';
                    
                } else {
                    setTimeout(function () {
                        self.done(fn);
                    }, 100);
                }
            }

        }, options);

    };

    BaseModel.extend = extend;

    return BaseModel;

});