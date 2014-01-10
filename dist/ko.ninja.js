
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
        define('ko.ninja.baseModel',[
            'underscore',
            'ko.ninja.events',
            'ko.ninja.extend'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko.ninjaEvents, root.ko.ninjaExtend, root.ko);
    }

} (this, function (_, Events, extend, ko) {

    

    //### ko.BaseModel
    var BaseModel = function (options) {

        options = options || {};

        if (_.isFunction(this.initialize)) {
            this.initialize(options);
        }
        
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

    if (typeof define === 'function' && define.amd) {
        return BaseModel;
    } else {
        ko.ninjaBaseModel = BaseModel;
    }

}));
/*global define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.localStorageModel',[
            'ko.ninja.baseModel'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaBaseModel, root.ko);
    }

} (this, function (BaseModel, ko) {

    

    var LocalStorageModel = BaseModel.extend({

        find: function (data, done) {
            var response = [], match;

            done = done || data;

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
                done(response);

            } else {
                done(this.invalid(data));
            }
        },

        findOne: function (id, done) {
            if (!this.invalid()) {
                done(JSON.parse(localStorage[this.name + '-' + id] || '{}'));
                
            } else {
                done(this.invalid());
            }
        },

        insert: function (data, done) {
            done = done || function () {};
            data[this.idAttribute] = new Date().getTime();
            if (!this.invalid(data)) {
                localStorage[this.name + '-' + data.id] = JSON.stringify(data);
                done(data);
            } else {
                done(this.invalid(data));
            }
        },

        remove: function (id, done) {
            done = done || function () {};
            if (!this.invalid()) {
                delete localStorage[this.name + '-' + id];
                done(null);
            } else {
                done(this.invalid());
            }
        },

        update: function (id, data, done) {
            done = done || function () {};
            if (!this.invalid(data)) {
                data[this.idAttribute] = id;
                localStorage[this.name + '-' + id] = JSON.stringify(data);
                done(data);
            } else {
                done(this.invalid(data));
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
        define('ko.ninja.httpModel',[
            'ko.ninja.baseModel',
            'ko.ninja.ajax',
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaBaseModel, root.ko.ninjaAjax, root._, root.ko);
    }

} (this, function (BaseModel, Ajax, _, ko) {

    

    var HttpModel = BaseModel.extend({

        suffix: '',

        urlRoot: function () {
            return ((this.name) ? '/' + this.name : '') + '/';
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
            this.ajax({
                url: this.urlRoot() + id + this.suffix,
                method: 'DELETE',
                complete: done
            });
        },

        update: function (id, data, done) {
            done = done || function () {};
            this.ajax({
                url: this.urlRoot() + id + this.suffix,
                method: 'PUT',
                data: data,
                complete: done
            });
        }

    });

    if (typeof define === 'function' && define.amd) {
        return HttpModel;
    } else {
        ko.ninjaHttpModel = HttpModel;
    }

}));
/*global io, define */

(function (root, factory) {
    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.socketModel',[
            'ko.ninja.baseModel',
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaBaseModel, root._, root.ko);
    }

} (this, function (BaseModel, _, ko) {

    

    var SocketModel = BaseModel.extend({

        find: function (query, done) {
            if (!done) {
                done = query;
            }
            this.socket.emit(this.messageNames.find, {
                data: query
            }, done);
        },

        findOne: function (id, done) {
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
            this.socket.emit(this.messageNames.remove, {
                id: id
            }, done);
        },

        update: function (id, data, done) {
            this.socket.emit(this.messageNames.update, {
                id: id,
                data: data
            }, done);
        },

        initialize: function (options) {

            this.socket = io.connect((options.protocol || 'http')+ '://' + (options.hostName || 'localhost') + ':' + (options.port || '8080'));

            // This lets us override the message names if we want to
            this.messageNames = _.extend({
                'update': options.name + '-update',
                'insert': options.name + '-insert',
                'find': options.name + '-find',
                'findOne': options.name + '-findOne',
                'remove': options.name + '-remove'
            }, options.messageNames || {});
            
        }

    });

    if (typeof define === 'function' && define.amd) {
        return SocketModel;
    } else {
        ko.ninjaSocketModel = SocketModel;
    }

}));
/*global define, ko */

(function (root, factory) {

    

    // AMD
    if (typeof define === 'function' && define.amd) {
        define('ko.ninja.model',[
            'ko.ninja.extend',
            'ko.ninja.localStorageModel',
            'ko.ninja.httpModel',
            'ko.ninja.socketModel'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaExtend, root.ko.ninjaLocalStorageModel, root.ko.ninjaSocketModel);
    }

} (this, function (extend, LocalStorageModel, HttpModel, SocketModel) {

    

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
        define('ko.ninja.viewModel',[
            'knockout',
            'underscore',
            'ko.ninja.events',
            'ko.ninja.extend',
            'ko.ninja.model',
            'ko.ninja.validation'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko, root._, root.ko.ninjaEvents, root.ko.ninjaExtend, root.ko.ninjaModel, root.ko.ninjaValidation);
    }

} (this, function (ko, _, Events, extend, Model, Validation) {

    

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

    var setupValidation = function() {

    };

    var setupModel = function () {
        var self = this,
            sync = function () {
                var data = {};
                _.each(self.observables, function (val, name) {
                    data[name] = self[name]();
                });
                self.model.save(data, function () {});
            }, debounceSync = _.debounce(sync, 1);

        if (!this.model.status) {
            this.model = new Model(this.model);
        }

        // This keeps the model from autoSyncing if the viewModel has autoSync: false
        // defined on it.
        if (this.autoSync !== false) {
            this.autoSync = true;
        }

        this.fetch = function (done) {
            var self = this,
                autoSync = this.autoSync;

            this.autoSync = false;
            this.model.findOne(this[this.idAttribute || 'id'](), function (data) {
                _.each(data, function (value, name) {
                    if (typeof self[name] === 'function') {
                        self[name](value);
                    }
                });
                self.autoSync = autoSync;
                if (_.isFunction(done)) {
                    done();
                }
            });
        };

        _.each(this.observables, function (val, name) {
            self[name].subscribe(function () {
                if (self.autoSync && !self.validateAll().length) {
                    debounceSync();
                }
            });
        });
    };

    //### ko.ViewModel
    var ViewModel = function ViewModel(options) {

        options = options || {};

        setupObservables.call(this, options);

        this.watchValidations();

        if (this.validation) {
            setupValidation.call(this);
        }

        this.initialize.apply(this, arguments);

        if (this.model) {
            setupModel.call(this, options);
        }

        if (this.autoSync) {
            this.fetch();
        }

        if (this.el) {
            ko.applyBindings(this, (typeof this.el === 'object') ? this.el : document.querySelector(this.el)[0]);
        }

    };

    _.extend(ViewModel.prototype, Events, Validation, {
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
        define('ko.ninja',[
            'underscore',
            'knockout',
            'ko.ninja.viewModel',
            'ko.ninja.model'
        ], factory);

    // Non-AMD
    } else {
        factory(root._, root.ko, root.ko.ninjaViewModel, root.ko.ninjaModel);
    }

} (this, function (_, ko, ViewModel, Model) {

    

    ko.ViewModel = ViewModel;
    ko.Model = Model;

    // AMD
    if (typeof define === 'function' && define.amd) {
        return ko;

    // Non-AMD
    } else {
        ko.ViewModel = ViewModel;
        ko.Model = Model;
    }

}));