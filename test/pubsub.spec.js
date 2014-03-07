/*global define, module, asyncTest, start, equal */

define([
    'underscore',
    'ko.ninja.pubsub'
], function (_, PubSub) {

    'use strict';

    module('ko.pubsub', {
        teardown: function () {
            localStorage.clear();
        }
    });

    asyncTest('when we set a subscription on the class object', function () {
        var Class = function (options) {
            this._setupSubscriptions(options);
        };
        _.extend(Class.prototype, PubSub);
        var myClass = new Class({
            subscriptions: {
                'my-subscription': function (data) {
                    equal(data, 'hi');
                    start();
                }
            }
        });
        myClass.publish('my-subscription', 'hi');
        myClass.unsubscribeAll();
    });

    asyncTest('when we set a subscription after instantiating the class', function () {
        var Class = function () {};
        _.extend(Class.prototype, PubSub);
        var myClass = new Class({});
        myClass.subscribe('new-subscription', function (data) {
            equal(data, 'hello');
            start();
        });
        myClass.publish('new-subscription', 'hello');
        myClass.unsubscribeAll();
    });
    
});