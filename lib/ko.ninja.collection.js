/*global define */

(function (root, factory) {

    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'ko.ninja.extend',
            'knockout',
            'underscore',
            'ko.ninja.storage'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaExtend, root.ko, root._, root.ko.ninjaStorage);
    }

} (this, function (extend, ko, _, Storage) {

    'use strict';

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

    };

    Collection.extend = extend;

    if (typeof define === 'function' && define.amd) {
        return Collection;
    } else {
        ko.ninjaCollection = Collection;
    }

}));