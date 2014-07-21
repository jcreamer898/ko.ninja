/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.events',[
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko);
    }

} (this, function (_, ko) {

    

    // Regular expression used to split event strings.
    var eventSplitter = /\s+/,
        Events, eventsApi, listenMethods, triggerEvents;

    // Implement fancy features of the Events API such as multiple event
    // names `"change blur"` and jQuery-style event maps `{change: action}`
    // in terms of the existing API.
    eventsApi = function(obj, action, name, rest) {
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
    triggerEvents = function(events, args) {
        var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
        switch (args.length) {
            case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
            case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
            case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
            case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
            default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
        }
    };

    /**
    * The events manager
    *
    * @class app.events
    */
    Events = {
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
            this._events = this._events || (this._events = {});
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
                if (events === this._events[name]) {
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

    listenMethods = {
        listenTo: 'on',
        listenToOnce: 'once'
    };

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

    if (typeof define === 'function' && define.amd) {
        return Events;
    } else {
        ko.ninjaEvents = Events;
    }

}));
/*global define */

(function (root, factory) {

    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.pubsub',[
            'underscore',
            'knockout'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko);
    }

} (this, function (_, ko) {

    

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
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.extend',[
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko);
    }

} (this, function (_, ko) {

    

    var Extend = function(protoProps, staticProps) {
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

    if (typeof define === 'function' && define.amd) {
        return Extend;
    } else {
        ko.ninjaExtend = Extend;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.viewModel',[
            'knockout',
            'underscore',
            'ko.ninja.events',
            'ko.ninja.pubsub',
            'ko.ninja.extend'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko, root._, root.ko.ninjaEvents, root.ko.ninjaPubSub, root.ko.ninjaExtend, root.ko.ninjaModel);
    }

} (this, function (ko, _, Events, PubSub, extend) {

    

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
                this.trigger('change:' + prop, value);
            }, this);
        }, this);

        // Now process the computedObservables
        _.each(_.pick(this.observables, computedObservables), function(value, prop) {
            this[prop] = ko.computed({
                read: this.observables[prop],
                write: function () {
                    // Keeps it from breaking.
                    // Perhaps we need a way to allow writing to computed observables, though
                },
                owner: this
            }, this);
        }, this);
    };

    var setupModel = function () {
        var model = this.model;

        if (this.options && this.options.autoSync) {
            model.autoSync(this.options.autoSync, true);
        }

        _.each(model.observables, function (observable, name) {
            this[name] = model[name];
        }, this);

    };

    var setupCollections = function () {
        var collections = this.collections;
        for (var collection in collections) {
            if (collections.hasOwnProperty(collection)) {
                if (this.options && this.options.autoSync) {
                    collections[collection].autoSync(this.options.autoSync);
                }
                this[collection] = collections[collection]._models;
            }
        }
    };

    //### ko.ViewModel
    var ViewModel = function ViewModel(options) {

        options = options || {};

        if (this.model) {
            setupModel.call(this, options);
        }

        if (this.collections) {
            setupCollections.call(this, options);
        }

        setupObservables.call(this, options);

        this._setupSubscriptions(options);

        this.initialize.apply(this, arguments);

        options.el = options.el || this.el;

        if (options.el) {
            ko.applyBindings(this, (typeof options.el === 'object') ? options.el : document.querySelector(options.el)[0]);
        }

    };

    _.extend(ViewModel.prototype, Events, PubSub, {
        initialize: function() {}
    });

    ViewModel.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return ViewModel;
    } else {
        ko.ninjaViewModel = ViewModel;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.baseStorage',[
            'underscore',
            'ko.ninja.events',
            'ko.ninja.extend'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko.ninjaEvents, root.ko.ninjaExtend, root.ko);
    }

} (this, function (_, Events, extend, ko) {

    

    //### ko.BaseStorage
    var BaseStorage = function (options) {

        options = options || {};

        if (_.isFunction(this.initialize)) {
            this.initialize(options);
        }
        
        _.extend(this, Events, {

            options: {},

            idAttribute: 'id',

            invalid: function () {
                if (!localStorage) {
                    return {
                        error: true,
                        message: 'There is no localStorage available in this context'
                    };
                }

                if (!this.options.name) {
                    return {
                        error: true,
                        message: 'This storage has no name. Every storage needs a name'
                    };
                }
            },

            save: function (data, done) {

                // If no data is passed in, send all of the observables off to be saved
                if (!data) {
                    data = {};
                    _.each(this.observables, function (value, name) {
                        data[name] = this[name]();
                    }, this);
                }

                if (data[this.idAttribute]) {
                    return this.update(data[this.idAttribute], data, done);
                } else {
                    return this.insert(data, done);
                }
            },

            fetch: function () {
            }
            
        }, options);


    };

    BaseStorage.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return BaseStorage;
    } else {
        ko.ninjaBaseStorage = BaseStorage;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.localStorage',[
            'ko.ninja.baseStorage'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaBaseStorage, root.ko);
    }

} (this, function (BaseStorage, ko) {

    

    var LocalStorageModel = BaseStorage.extend({

        find: function (data, done) {
            var response = [], match;

            done = done || data;

            if (!this.invalid()) {
                for(var key in localStorage) {
                    if (~key.indexOf(this.options.name + '-')) {
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
                done(response);

            } else {
                done(this.invalid(data));
            }
        },

        findOne: function (id, done) {
            if (!this.invalid()) {
                done(JSON.parse(localStorage[this.options.name + '-' + id] || '{}'));
                
            } else {
                done(this.invalid());
            }
        },

        insert: function (data, done) {
            done = done || function () {};
            data[this.idAttribute] = new Date().getTime();
            if (!this.invalid(data)) {
                localStorage[this.options.name + '-' + data.id] = JSON.stringify(data);
                done(data);
            } else {
                done(this.invalid(data));
            }
        },

        remove: function (id, done) {
            done = done || function () {};
            id = id || this.getId();
            if (!this.invalid()) {
                delete localStorage[this.options.name + '-' + id];
                done(null);
            } else {
                done(this.invalid());
            }
        },

        update: function (id, data, done) {
            done = done || function () {};
            if (!this.invalid(data)) {
                data[this.idAttribute] = id;
                localStorage[this.options.name + '-' + id] = JSON.stringify(data);
                done(data);
            } else {
                done(this.invalid(data));
            }
        },

        initialize: function (options) {
            if (options && options.options) {
                this.options = options.options;
            }
        }

    });

    if (typeof define === 'function' && define.amd) {
        return LocalStorageModel;
    } else {
        ko.ninjaLocalStorageModel = LocalStorageModel;
    }

}));
/*global ActiveXObject, define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.ajax',[], factory);

    // Non-AMD
    } else {
        factory(root.ko);
    }

} (this, function (ko) {

    

    var Ajax = function (url, callbackFunction) {
      var self = this,
        uri;
      this.updating = false;

      this.abort = function() {
        if (self.updating) {
          self.updating = false;
          self.AJAX.abort();
          self.AJAX = null;
        }
      };

      this.update = function(passData, postMethod) {
        if (self.updating) {
            return false;
        }

        self.AJAX = null;
        if (window.XMLHttpRequest) {
          self.AJAX = new XMLHttpRequest();

        } else {
          self.AJAX = new ActiveXObject('Microsoft.XMLHTTP');
        }

        if (self.AJAX === null) {
          return false;

        } else {

          self.AJAX.onreadystatechange = function() {
            if (self.AJAX.readyState === 4) {
              self.updating = false;
              self.callback(self.AJAX.responseText,self.AJAX.status,self.AJAX.responseXML);
              self.AJAX = null;
            }
          };

          self.updating = new Date();

          if (/post/i.test(postMethod)) {
            uri = urlCall+'?'+self.updating.getTime();
            self.AJAX.open('POST', uri, true);
            self.AJAX.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            self.AJAX.send(passData);

          } else if (/put/i.test(postMethod)) {
            uri = urlCall+'?'+self.updating.getTime();
            self.AJAX.open('PUT', uri, true);
            self.AJAX.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            self.AJAX.send(passData);

          } else if (/delete/i.test(postMethod)) {
            uri = urlCall+'?'+self.updating.getTime();
            self.AJAX.open('DELETE', uri, true);
            self.AJAX.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            self.AJAX.send(passData);

          } else {
            uri = urlCall + '?' + passData + '&timestamp=' + (self.updating.getTime());
            self.AJAX.open('GET', uri, true);
            self.AJAX.send(null);
          }

          return true;
        }
      };

      var urlCall = url;
      this.callback = callbackFunction || function () {};

    };

    if (typeof define === 'function' && define.amd) {
      return Ajax;
    } else {
      ko.ninjaAjax = Ajax;
    }

}));
/*global define, $ */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.httpStorage',[
            'ko.ninja.baseStorage',
            'ko.ninja.ajax',
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaBaseStorage, root.ko.ninjaAjax, root._, root.ko);
    }

} (this, function (BaseStorage, Ajax, _, ko) {

    

    var HttpStorage = BaseStorage.extend({

        suffix: '',

        urlRoot: function () {
            return ((this.options.name) ? '/' + this.options.name : '') + '/';
        },

        ajax: function (params) {

            var ajax;

            // Use jQuery ajax if we can
            if (typeof $ === 'function' && $.ajax) {

                $.ajax(_.extend({
                    success: function (data) {
                        params.complete(data);
                    }.bind(this),
                    error: function (err) {
                        params.complete({
                            error: true,
                            message: err
                        });
                    }.bind(this)
                }, params));

            // Use our fallback if jQuery isn't available
            } else {

                ajax = new Ajax(params.url, function (data) {
                    if (_.isFunction(params.complete)) {
                        params.complete(JSON.parse(data));
                    }
                });

                ajax.update((JSON.stringify(params.data) || '')
                    .replace(/:/g, '=')
                    .replace(/"/g, '')
                    .replace(/,/g, '&')
                    .replace(/{/g, '')
                    .replace(/}/g, ''),
                    params.method
                );

            }
        },

        find: function (query, done) {
            this.ajax({
                url: this.urlRoot() + this.suffix,
                method: 'GET',
                data: query,
                complete: done || query
            });
        },

        findOne: function (id, done) {
            this.ajax({
                url: this.urlRoot() + id + this.suffix,
                method: 'GET',
                complete: done
            });
        },

        insert: function (data, done) {
            done = done || function () {};
            this.ajax({
                url: this.urlRoot() + this.suffix,
                method: 'POST',
                data: data,
                complete: done
            });
        },

        remove: function (id, done) {
            done = done || function () {};
            if (!id) {
                id = this.getId();
            }
            this.ajax({
                url: this.urlRoot() + id + this.suffix,
                method: 'DELETE',
                complete: done
            });
        },

        update: function (id, data, done) {
            done = done || function () {};
            if (!id) {
                id = this.getId();
            }
            this.ajax({
                url: this.urlRoot() + id + this.suffix,
                method: 'PUT',
                data: data,
                complete: done
            });
        }

    });

    if (typeof define === 'function' && define.amd) {
        return HttpStorage;
    } else {
        ko.ninjaHttpStorage = HttpStorage;
    }

}));
/*global io, define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.socketStorage',[
            'ko.ninja.baseStorage',
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaBaseStorage, root._, root.ko);
    }

} (this, function (BaseStorage, _, ko) {

    

    var SocketStorage = BaseStorage.extend({

        find: function (query, done) {
            if (!done) {
                done = query;
            }
            this.socket.emit(this.messageNames.find, {
                data: query
            }, done);
        },

        findOne: function (id, done) {
            if (!id) {
                id = this.getId();
            }
            this.socket.emit(this.messageNames.findOne, {
                id: id
            }, done);
        },

        insert: function (data, done) {
            this.socket.emit(this.messageNames.insert, {
                data: data
            }, done);
        },

        remove: function (id, done) {
            if (!id) {
                id = this.getId();
            }
            this.socket.emit(this.messageNames.remove, {
                id: id
            }, done);
        },

        update: function (id, data, done) {
            if (!id) {
                id = this.getId();
            }
            this.socket.emit(this.messageNames.update, {
                id: id,
                data: data
            }, done);
        },

        initialize: function (options) {

            options = options || {};

            this.options = _.extend({
                protocol: 'http',
                hostName: 'localhost',
                port: 8080,
                name: 'list'
            }, options.options || {});

            this.socket = io.connect(this.options.protocol + '://' + this.options.hostName + ':' + this.options.port);

            // This lets us override the message names if we want to
            this.messageNames = _.extend({
                'update': this.options.name + '-update',
                'insert': this.options.name + '-insert',
                'find': this.options.name + '-find',
                'findOne': this.options.name + '-findOne',
                'remove': this.options.name + '-remove'
            }, this.options.messageNames || {});
            
        }

    });

    if (typeof define === 'function' && define.amd) {
        return SocketStorage;
    } else {
        ko.ninjaSocketStorage = SocketStorage;
    }

}));
/*global define, ko */

(function (root, factory) {

    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.storage',[
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
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.validation',[
            'knockout',
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko, root._);
    }

} (this, function (ko, _) {

    

    var validation = {

        validationTypes: {

            _custom: function (value, config) {
                return config.validator.call(this, value, config);
            },

            _maxLength: function (value, config) {
                return value.length > config.value;
            },

            _minLength: function (value, config) {
                return value.length < config.value;
            },

            _length: function (value, config) {
                return value.length !== config.value;
            },

            _required: function (value) {
                return !value || !value.length;
            },

            _email: function (value) {
                return !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
            },

            _number: function (value) {
                return !(!isNaN(parseFloat(value)) && isFinite(value));
            }

        },

        _validate: function (validations, observable) {
            var value = (this[observable]) ? this[observable]() : null,
                errors = [];
            _.each(validations, function (config, name) {
                if (this.validationTypes['_' + name]) {
                    var inavalid = this.validationTypes['_' + name].call(this, value, config);
                    if (inavalid) {
                        if (typeof config === 'string') {
                            config = {
                                message: config
                            };
                        }
                        errors.push({
                            observable: observable,
                            error: config.message
                        });
                    }
                }
            }, this);
            return errors;
        },

        validateOne: function (observable) {
            var invalid = this._validate(this.validation[observable], observable);
            if (invalid.length) {
                return invalid[0].error;
            }
        },

        validateAll: function () {
            var errors = [];
            _.each(this.validation, function (validations, observable) {
                errors = errors.concat(this._validate(validations, observable));
            }, this);
            return errors;
        },

        validate: function () {
            var errors = {};
            this.errors(this.validateAll());
            _.each(this.errors(), function (error) {
                if (!errors[error.observable]) {
                    this[error.observable].error(error.error);
                    errors[error.observable] = true;
                }
            }, this);
            return (this.errors().length) ? this.errors() : null;
        },

        watchValidation: function (observable) {
            if (this[observable]) {
                this[observable].error = ko.observable();
                this[observable].subscribe(function () {
                    this[observable].error(this.validateOne(observable));
                    this.errors(this.validateAll());
                }.bind(this));
            }
        },

        watchValidations: function () {
            this.errors = ko.observableArray();
            _.each(this.validation, function (validation, observable) {
                this.watchValidation(observable);
            }, this);
        }

    };

    if (typeof define === 'function' && define.amd) {
        return validation;
    } else {
        ko.ninjaValidation = validation;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.observables',[
            'knockout',
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko, root._);
    }

} (this, function (ko, _) {

    

    var Observables = {

        /**
        * @method _setupObservables
        * @param {Object} options
        */
        _setupObservables: function(options) {

            if (!this.observables || !options) {
                return;
            }

            var computedObservables;

            _.each(options, function (value, name) {
                if (!_.isUndefined(this.observables[name])) {
                    this.observables[name] = value;
                    delete options[name];
                }
            }, this);

            computedObservables = _.functions(this.observables);

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
                    this.trigger('change:' + prop, value);
                }, this);
            }, this);

            // Now process the computedObservables
            _.each(_.pick(this.observables, computedObservables), function(value, prop) {
                this[prop] = ko.computed({
                    read: this.observables[prop],
                    write: function () {
                        // Keeps it from breaking.
                        // Perhaps we need a way to allow writing to computed observables, though
                    },
                    owner: this
                }, this);
            }, this);
        }

    };

    if (typeof define === 'function' && define.amd) {
        return Observables;
    } else {
        ko.ninjaClass = Observables;
    }

}));
/*global define */

(function (root, factory) {

    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.model',[
            'underscore',
            'ko.ninja.extend',
            'ko.ninja.storage',
            'knockout',
            'ko.ninja.validation',
            'ko.ninja.observables',
            'ko.ninja.events',
            'ko.ninja.pubsub'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko.ninjaExtend, root.ko.ninjaStorage, root.ko, root.ko.ninjaValidation, root.ko.ninjaObservables, root.ko.ninjaEvents, root.ko.ninjaPubSub);
    }

} (this, function (_, extend, Storage, ko, Validation, Observables, Events, PubSub) {

    

    var Model = function (options) {

        options = options || {};

        this._setupObservables.call(this, options);
        
        _.extend(this, new Storage(_.extend({}, this, options)));

        if (this.validation) {
            this.watchValidations();
        }

        // Setup Pub / Sub
        this._setupSubscriptions(options);

        this.initialize(options);
    };

    _.extend(Model.prototype, Events, Observables, Validation, PubSub, {

        idAttribute: 'id',

        /**
        * Returns the Id
        * @method getId
        */
        getId: function () {
            return this[this.idAttribute]();
        },

        /**
        * @method get
        * @param {String} name
        */
        get: function (name) {
            if (!this[name]) {
                throw 'get observable not found';
            }
            return this[name]();
        },

        /**
        * @method set
        * @param {String} name
        * @param {Object} value
        */
        set: function (name, value) {

            // Take an entire object and set all of the observables with it
            if (_.isObject(name)) {
                for (var item in name) {
                    if (name.hasOwnProperty(item)) {
                        this.set(item, name[item]);
                    }
                }

            // Set a single observable
            } else if (_.isFunction(this[name]) && this[name]() !== value) {
                this[name](value);
            }
        },

        /**
        * @method has
        * @param {String} name
        */
        has: function (name) {
            if (!this[name]) {
                return;
            }
            return !!this[name]();
        },

        /**
        * @method clear
        */
        clear: function () {
            _.each(this.observables, function (observable, name) {
                this[name](null);
            }, this);
        },

        /**
        * @method toJSON
        */
        toJSON: function () {
            var json = {};
            _.each(this.observables, function (observable, name) {
                json[name] = this[name]();
            }, this);
            return json;
        },

        /**
        * @method autoSync
        * @param {Boolean} autoSync
        * @param {Boolean} fetch Fetch the data right away
        */
        autoSync: function (autoSync, fetch) {

            var self = this;

            if (autoSync) {

                // Grab the data right away
                if (fetch) {
                    this.findOne(this.getId(), function (data) {
                        self.set(data);
                    });
                }

                // Automatically save the data when a change occurs
                _.each(this.observables, function (value, name) {
                    this[name].subscribe(function () {
                        self.save();
                    });
                }, this);
            }
        },

        initialize: function () {}

    });

    Model.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return Model;
    } else {
        ko.ninjaModel = Model;
    }

}));
/*global define */

(function (root, factory) {

    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.collection',[
            'ko.ninja.extend',
            'knockout',
            'underscore',
            'ko.ninja.storage',
            'ko.ninja.events',
            'ko.ninja.pubsub'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaExtend, root.ko, root._, root.ko.ninjaStorage, root.ko.ninjaEvents, root.ko.ninjaPubSub);
    }

} (this, function (extend, ko, _, Storage, Events, PubSub) {

    

    var Collection = function (models) {

        this.options = this.options || {};

        var _conditions = {},
            _autoSync = false,
            Store = Storage.extend({}),
            _storage = new Store({
                options: this.options
            });

        _.extend(this, {

            _models: ko.observableArray([]),

            /**
            * Converts the collection to JSON
            * @method toJSON
            * @returns {Array}
            */
            toJSON: function () {
                var models = this._models(),
                    json = [];
                for (var i = 0; i < models.length; i++) {
                    json.push(models[i].toJSON());
                }
                return json;
            },

            /**
            * Adds a model to the end of the collection
            * @method push
            * @param {Object} data the model data
            * @param {Object} options
            *   @param {Number} options.position The position to insert the model at
            */
            insert: function (data, options) {

                var model;

                // Make sure there is no id getting inserted
                if (!data[this.model.prototype.idAttribute]) {
                    data[this.model.prototype.idAttribute] = null;
                }
                data.options = _.extend(this.options, this.model.prototype.options || {});

                model = new this.model(data);

                if (options && _.isNumber(options.position))     {
                    this._models.splice(options.position, 0, model);
                } else {
                    this._models.push(model);
                }
                if (_autoSync && model.save) {
                    model.save(null, function (data) {
                        model.set(data);
                    });
                }
            },

            /**
            * Removes a model from the collection
            * @method remove
            * @param {String} id
            */
            remove: function (id) {

                var i;
                if (!id) {
                    return;
                }

                if (_.isArray(id)) {
                    for (i = 0; i < id.length; i++) {
                        this.remove(id[i]);
                    }
                } else {
                    for (i = 0; i < this._models().length; i++) {
                        if (this._models()[i].getId() === id) {
                            if (_autoSync && this._models()[i].remove) {
                                this._models()[i].remove();
                            }
                            this._models.splice(i, 1);
                        }
                    }
                }
            },

            /**
            * Returns all of the models
            * @method find
            * @returns {Array} models
            */
            find: function (where) {

                var models = [],
                    match = true;

                _conditions = where || {};

                if (!_conditions) {
                    return this._models();
                } else {
                    for (var i = 0; i < this._models().length; i++) {
                        match = true;
                        for (var condition in _conditions) {
                            if (_conditions.hasOwnProperty(condition)) {
                                if (_conditions[condition] !== this._models()[i][condition]()) {
                                    match = false;
                                }
                            }
                        }
                        if (match) {
                            models.push(this._models()[i]);
                        }
                    }
                    return models;
                }
            },

            /**
            * Gets the data from the backend services
            * @method fetch
            * @param {Object} where Conditions to send to the server
            */
            fetch: function (where) {
                var self = this, models = [];
                where = where || _conditions || {};
                if (_storage.find) {
                    _storage.find(where, function (data) {
                        for (var i = 0; i < data.length; i++) {
                            models.push(new self.model(_.extend(data[i], {
                                options: _.extend(self.options, self.model.prototype.options || {})
                            })));
                        }
                        self._models(models);
                    });
                }
            },

            /**
            * Returns the model that matches the ID that is passed in
            * @method get
            * @param {String} id
            * @returns {Object} model
            */
            get: function (id) {
                var returns;
                for (var i = 0; i < this._models().length; i++) {
                    if (this._models()[i].getId() === id) {
                        returns = this._models()[i];
                    }
                }
                return returns;
            },

            /**
            * Returns the number of models in the collection
            * @method count
            * @returns {Number}
            */
            count: function () {
                return this._models().length;
            },

            /**
            * Returns the sorted version of the array base on the sorting function that is passed in
            * @method sort
            * @param {String} name The observable to sort by
            * @param {Boolean} desc Sort in descending order
            */
            sort: function (name, desc) {
                this._models.sort(function (a, b) {
                    return (desc) ? a[name]() < b[name]() : a[name]() > b[name]();
                });
            },

            /**
            * Makes the collection automatically sync with backend services any time there is a change
            * @method autoSync
            * @param {Boolean} autoSync When this is set to true, we automatically sync the collection, if it is set to false, we don't
            */
            autoSync: function (autoSync) {
                var models = this._models();

                if (autoSync) {
                    this.fetch();
                    _autoSync = true;
                } else if (_autoSync) {
                    _autoSync = false;
                }

                // Update the models to autosync with the collection
                for (var i = 0; i < models.length; i++) {
                    models[i].autoSync(autoSync);
                }

            }

        });

        if (this.model) {
            this.model.prototype.storage = this.storage;
            _.each(models || [{}], this.insert, this);
        }

        this._setupSubscriptions(this);

    };

    _.extend(Collection.prototype, Events, PubSub);

    Collection.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return Collection;
    } else {
        ko.ninjaCollection = Collection;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja',[
            'underscore',
            'knockout',
            'ko.ninja.viewModel',
            'ko.ninja.model',
            'ko.ninja.collection'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko, root.ko.ninjaViewModel, root.ko.ninjaModel, root.ko.ninjaCollection);
    }

} (this, function (_, ko, ViewModel, Model, Collection) {

    

    ko.ViewModel = ViewModel;
    ko.Model = Model;
    ko.Collection = Collection;

    // AMD
    if (typeof define === 'function' && define.amd) {
        return ko;
    }

}));
