/*global define, $ */

(function (root, factory) {
    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'ko.ninja.baseStorage',
            'ko.ninja.ajax',
            'underscore'
        ], factory);

    // Non-AMD
    } else {
        factory(root.ko.ninjaBaseStorage, root.ko.ninjaAjax, root._, root.ko);
    }

} (this, function (BaseStorage, Ajax, _, ko) {

    'use strict';

    var HttpStorage = BaseStorage.extend({

        suffix: '',

        urlRoot: function () {
            return ((this.options.name) ? '/' + this.options.name : '') + '/';
        },

        ajax: function (params) {

            var ajax;

            // Use jQuery ajax if we can
            if (typeof $ === 'function' && $.ajax) {

                $.ajax(_.extend(params));

            // Use our fallback if jQuery isn't available
            } else {

                ajax = new Ajax(params.url, function (data) {
                    if (_.isFunction(params.success)) {
                        params.success(JSON.parse(data));
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
                success: done || query,
                error: done || query
            });
        },

        findOne: function (id, done) {
            this.ajax({
                url: this.urlRoot() + id + this.suffix,
                method: 'GET',
                success: done,
                error: done
            });
        },

        insert: function (data, done) {
            done = done || function () {};
            this.ajax({
                url: this.urlRoot() + this.suffix,
                method: 'POST',
                data: data,
                success: done,
                error: done
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
                success: done,
                error: done
            });
        },

        update: function (id, data, done) {
            done = done || function () {};
            if (!id) {
                id = this.getId();
            }
            delete data[this.idAttribute];
            this.ajax({
                url: this.urlRoot() + id + this.suffix,
                method: 'PUT',
                data: data,
                success: done,
                error: done
            });
        }

    });

    if (typeof define === 'function' && define.amd) {
        return HttpStorage;
    } else {
        ko.ninjaHttpStorage = HttpStorage;
    }

}));