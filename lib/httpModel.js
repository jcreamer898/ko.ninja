/*global $ */

define([
    'baseModel',
    'ajax',
    'underscore'
], function (BaseModel, Ajax, _) {

    return BaseModel.extend({

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

});