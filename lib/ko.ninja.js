(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['knockout', 'underscore'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('knockout'), require('underscore'));
    } else {
        root.ko = factory(root.ko, root._, root.$);
    }
}(this, function (ko, _) {

var extend = function(protoProps, staticProps) {
    var parent = this,
        Surrogate,
        child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function() { return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
        _.extend(child.prototype, protoProps);
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    if (protoProps.name) {
        child.prototype.toString = function() {
            return protoProps.name;
        };
    }        

    return child;
};

/**
* The events manager
*
* @class app.events
*/
var Events = {
    /**
     * Bind an event to a `callback` function. Passing `"all"` will bind
     * the callback to all events fired.
     * @method on
     * @param  {String} name Name of the event to subscribe to
     * @param  {Function} callback Callback to fire when the event fires
     * @param  {[type]} context Sets the context of the callback
     * @return Returns `this`
     */
    on: function(name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({callback: callback, context: context, ctx: context || this});
        return this;
    },

    /**
     * Bind an event to only be triggered a single time. After the first time
     * the callback is invoked, it will be removed.
     * @method once
     * @param  {String} name Name of the event to subscribe to
     * @param  {Function} callback Callback to fire when the event fires
     * @param  {[type]} context Sets the context of the callback
     * @return Returns `this`
     */
    once: function(name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
        var self = this;
        var once = _.once(function() {
            self.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    },

    
    /**
     * Remove one or many callbacks. If `context` is null, removes all
     * callbacks with that function. If `callback` is null, removes all
     * callbacks for the event. If `name` is null, removes all bound
     * callbacks for all events.
     * @method off
     * @param  {String} name Name of the event to turn off
     * @param  {Function} callback Callback to turn off
     * @param  {[type]} context Sets the context of the callback
     * @return Returns `this`
     */
    off: function(name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
            this._events = {};
            return this;
        }

        names = name ? [name] : _.keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
            name = names[i];
            if (events = this._events[name]) {
                this._events[name] = retain = [];
                if (callback || context) {
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                            (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) delete this._events[name];
            }
        }

        return this;
    },

    /**
     * Trigger one or many events, firing all bound callbacks. Callbacks are
     * passed the same arguments as `trigger` is, apart from the event name
     * (unless you're listening on `"all"`, which will cause your callback to
     * receive the true name of the event as the first argument).
     * @method trigger
     * @param  {String} name The name of the event to trigger
     * @return Returns `this`
     */
    trigger: function(name) {
        if (!this._events) return this;
        var args = Array.prototype.slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) return this;
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) triggerEvents(events, args);
        if (allEvents) triggerEvents(allEvents, arguments);
        return this;
    },

    /**
     * Tell this object to stop listening to either specific events ... or
     * to every object it's currently listening to.
     * @method stopListening
     * @param  {Object} obj Object to stop listening to events on
     * @param  {String} name Name of the event to stop listening for
     * @param  {Function} callback
     * @return Returns `this`
     */
    stopListening: function(obj, name, callback) {
        var listeners = this._listeners;
        if (!listeners) return this;
        var deleteListener = !name && !callback;
        if (typeof name === 'object') callback = this;
        if (obj) (listeners = {})[obj._listenerId] = obj;
        for (var id in listeners) {
            listeners[id].off(name, callback, this);
            if (deleteListener) delete this._listeners[id];
        }
        return this;
    }
};

// Regular expression used to split event strings.
var eventSplitter = /\s+/;

// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
        for (var key in name) {
            obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
            obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
    }

    return true;
};

// A difficult-to-believe, but optimized internal dispatch function for
// triggering events. Tries to keep the usual cases speedy (most internal
// Backbone events have 3 arguments).
var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
};

var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

// Inversion-of-control versions of `on` and `once`. Tell *this* object to
// listen to an event in another object ... keeping track of what it's
// listening to.
_.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
        var listeners = this._listeners || (this._listeners = {});
        var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
        listeners[id] = obj;
        if (typeof name === 'object') callback = this;
        obj[implementation](name, callback, this);
        return this;
    };
});

//### ko.ViewModel
var ViewModel = function ViewModel(options) {  
    var self = this;

    options = options || {};

    setupObservables.call(this, options);

    if (this.validation) {
        setupValidation.call(this);
    }

    this.initialize.call(this, options);

    if (this.model) {
        setupModel.call(this, options);
    }

};

_.extend(ViewModel.prototype, Events, {
    autoSync: true,
    fetch: function (done) {
        var self = this,
            autoSync = this.autoSync;

        this.autoSync = false;
        return this.model.findOne(this[this.idAttribute || 'id']()).done(function (data) {
            _.each(data, function (value, name) {
                self[name](value);
            });
            self.autoSync = autoSync;
            if (_.isFunction(done)) {
                done();
            }
        });
    },
    initialize: function() {}
});

//### ko.Model
var Model = function (options) {

    options = options || {};
    
    _.extend(this, Events, {

        status: 'processing',
        idAttribute: 'id',

        setTransaction: function (name, id) {
            this._transaction = name;
            this._transactionId = id;
        },

        invalid: function (data) {
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
        },

        find: function (data) {
            var response = [], match;

            this.setTransaction('find');

            if (!this.invalid()) {
                for(var key in localStorage) {
                    if (~key.indexOf(this.name + '-')) {
                        match = true;
                        for (var value in data) {
                            if (data[value] !== JSON.parse(localStorage[key])[value]) {
                                match = false;
                            }
                        }
                        if (match) {
                            response.push(JSON.parse(localStorage.getItem(key)));
                        }
                    }
                }
                this.status = response;

            } else {
                this.status = this.invalid(data);
            }

            return this;
        },

        findOne: function (id) {
            this.setTransaction('findOne', id);
            if (!this.invalid()) {
                this.status = JSON.parse(localStorage[this.name + '-' + id]);
            } else {
                this.status = this.invalid(data);
            }
            return this;
        },

        insert: function (data) {
            this.setTransaction('insert');
            data[this.idAttribute] = new Date().getTime();
            if (!this.invalid(data)) {
                localStorage[this.name + '-' + data.id] = JSON.stringify(data);
                this.status = data;
            } else {
                this.status = this.invalid(data);
            }
            return this;
        },

        remove: function (id) {
            this.setTransaction('remove', id);
            if (!this.invalid()) {
                delete localStorage[this.name + '-' + id];
                this.status = null;
            } else {
                this.status = this.invalid();
            }
            return this;
        },

        save: function (data) {
            if (data[this.idAttribute]) {
                return this.update(data[this.idAttribute], data);
            } else {
                return this.insert(data);
            }
        },

        update: function (id, data) {
            this.setTransaction('update', id);
            if (!this.invalid(data)) {
                data[this.idAttribute] = id;
                localStorage[this.name + '-' + id] = JSON.stringify(data);
                this.status = data;
            } else {
                this.status = this.invalid(data);
            }
            return this;
        }

    }, options);

};

var setupModel = function (options) {
    var self = this;
    var sync = function () {
        var data = {};
        _.each(self.observables, function (val, name) {
            data[name] = self[name]();
        });
        self.model.save(data);
    }, debounceSync = _.debounce(sync, 1);

    _.each(this.observables, function (val, name) {
        self[name].subscribe(function () {
            if (self.autoSync) {
                debounceSync();
            }
        });
    });
};

var setupObservables = function(options) {
    var computedObservables = _.functions(this.observables);

    computedObservables = _.reduce(this.observables, function(memo, value, prop) {
        if (_.isObject(value) && !_.isArray(value) && (value.read || value.write)) {
            memo.push(prop);
        }
        return memo;
    }, computedObservables);

    // Process the observables first
    _.each(_.omit(this.observables, computedObservables), function (value, prop) {
        if (_.isArray(value)) {
            if (ko.isObservable(options[prop])) {
                this[prop] = options[prop];
            }
            else {
                this[prop] = ko.observableArray((options[prop] || value).slice(0));
            }
        }
        else {
            if (ko.isObservable(options[prop])) {
                this[prop] = options[prop];
            }
            else {
                this[prop] = ko.observable(options[prop] || value);
            }
        }

        this[prop].subscribe(function(value) {
            this.trigger("change:" + prop, value);
        }, this);
    }, this);

    // Now process the computedObservables
    _.each(_.pick(this.observables, computedObservables), function(value, prop) {
        this[prop] = ko.computed(this.observables[prop], this);
    }, this);
};

var setupValidation = function() {

};

ko.Model = Model;
ko.ViewModel = ViewModel;

ko.Model.extend = ko.ViewModel.extend = extend;

return ko;

}));