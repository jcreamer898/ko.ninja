/*global define */

(function (root, factory) {

    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'underscore',
            'knockout'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko);
    }

} (this, function (_, ko) {

    'use strict';

    var subscribable = new ko.subscribable(),

        PubSub = {

            _subscriptions: {},

            _setupSubscriptions: function (options) {
                options = _.extend({}, this, options || {});
                if (options.subscriptions) {
                    _.each(options.subscriptions, function (callback, topic) {
                        this.subscribe(topic, callback);
                    }, this);
                }
            },

            publish: function (topic, data) {
                subscribable.notifySubscribers(data, topic);
            },

            subscribe: function (topic, callback) {
                this._subscriptions[topic] = subscribable.subscribe(callback, this, topic);
            },

            unsubscribe: function (topic) {
                console.log('unsubscribe', topic, this._subscriptions[topic]);
                this._subscriptions[topic].dispose();
                delete this._subscriptions[topic];
            },

            unsubscribeAll: function () {
                _.each(this._subscriptions, function (value, topic) {
                    this.unsubscribe(topic);
                }, this);
            }

        };

    if (typeof define === 'function' && define.amd) {
        return PubSub;
    } else {
        ko.ninjaPubSub = PubSub;
    }

}));