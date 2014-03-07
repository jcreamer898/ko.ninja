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

        /**
        * @mixin PubSub
        */
        PubSub = {

            _subscriptions: {},

            /**
            * Sets up all of the subscriptions passed into the class through the subscriptions object
            *
            * @method _setupSubscriptions
            * @param {Object} options
            */
            _setupSubscriptions: function (options) {
                options = _.extend({}, this, options || {});
                if (options.subscriptions) {
                    _.each(options.subscriptions, function (callback, topic) {
                        this.subscribe(topic, callback);
                    }, this);
                }
            },

            /**
            * Publishes a message
            *
            * @method publish
            * @param {String} topic
            * @param {Object} data
            */
            publish: function (topic, data) {
                subscribable.notifySubscribers(data, topic);
            },

            /**
            * Subscribes to a topic
            *
            * @method subscribe
            * @param {String} topic
            * @param {Function} callback 
            */
            subscribe: function (topic, callback) {
                this._subscriptions[topic] = subscribable.subscribe(callback.bind(this), this, topic);
            },

            /**
            * Unsubsribes a single subscription
            *
            * @method unsubscribe
            * @param {String} topic
            */
            unsubscribe: function (topic) {
                this._subscriptions[topic].dispose();
                delete this._subscriptions[topic];
            },

            /**
            * Unsubscribes all of the subscriptions
            *
            * @method unsubscribeAll
            */
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