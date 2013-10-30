define([
    'baseModel'
], function (BaseModel) {

    return BaseModel.extend({

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
                this.status = JSON.parse(localStorage[this.name + '-' + id] || '{}');
                
            } else {
                this.status = this.invalid();
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

    });

});