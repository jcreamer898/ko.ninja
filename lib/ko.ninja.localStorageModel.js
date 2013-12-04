define([
    'ko.ninja.baseModel'
], function (BaseModel) {

    return BaseModel.extend({

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

});