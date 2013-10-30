ko.ninja
========

A framework for building awesome knockout.js apps.

The idea behind **ko.ninja** is that knockout has amazing two way binding functionallity, but not a lot of conventions for how to write ViewModels and such.

ko.ninja provides methods to create view models in a clean and reusable fashion that provide some built in helpers.

# Installation
ko.ninja is available as an AMD module, so just require it and you are good to go. Something like this will do just fine:

```js
define(['ko.ninja'], function (ko) {
  ko.ViewModel.extend({
    ...
  });
});
```

### ko.ViewModel
The `ko.ViewModel` is a constructor to define ViewModels.

```js
var Person = ko.ViewModel.extend({
    observables: {
        firstName: "",
        lastName: "",
        fullName: function() {
            return this.firstName() + " " + this.lastName());            
        },
        friends: []
    }
});

var me = new Person({
	firstName: "Jonathan",
	lastName: "Creamer"
});

me.firstName(); // "Jonathan"
me.fullName(); // "Jonathan Creamer"

me.friends.push(new Person({
	firstName: "Tyson",
	lastName: "Cadenhead"
}));
```

Some of the advantages are, you don't have to type `ko.observable()` all the time, and if you define a function in your `observables` property, it will create a `ko.computed` that is automatically scoped correctly so `this` points to the right place.

### ko.Model

The ko.Model syncs data from the ko.ViewModel with a backend service or with localStorage. It can be added to the ko.ViewModel like this:

```js
ko.ViewModel.extend({
    observables: {
        ...
    },
    model: {
        name: 'myModelName',
        storage: 'localStorage'
    }
});
```

With that in place, anytime any of your observables change, the observables will be sent to your database and saved. Each time you initialize your viewModel, if there is an id attribute defined on the viewModel, it will be fetched from the data source.

By default, if you include a model on your viewModel, it will automatically fetch and save data. If you want to turn off the automatic syncing, you can do so by specifying `autoSync: false` on your viewModel like this:

```js
ko.ViewModel.extend({
    autoSync: false,
    ...
});
```

You can also access the model anywhere in your viewModel using `this.model`. Now, let's take a look at the ko.Model api. It is designed to use the same basic API regardless of your storage type.

#### idAttribute {Property}
The id attribute on the viewModel. This is used for syncing with databases. Defaults to `id`.

```js
ko.ViewModel.extend({
    observables: {
        _id: '123',
        firstName: 'Heather',
        lastName: 'Cadenhead'
    },
    model: {
        name: 'friends',
        storage: 'localStorage',
        idAttribute: '_id'
    }
});
```

#### insert (data)
Inserts new data into the database.

```js
var model = new ko.Model({ name: 'friends' });

model.insert({ firstName: 'Milo', lastName: 'Cadenhead' }).done(function (data) {
   console.log(data);
   // { firstName: 'Milo', lastName: 'Cadenhead', id: 1382539084406 }
});
```

#### update (id, data)
Updates the data in the database.

```js
var model = new ko.Model({ name: 'friends' });

model.update(1382539084406, { firstName: 'Linus' }).done(function () {
   model.findOne(1382539084406).done(function (data) {
      console.log(data);
      // { firstName: 'Linus', lastName: 'Cadenhead', id: 1382539084406 }
   });
}); 
```

#### save (data)
Instead of using update and insert, you can use save. If there is an id attribute, save will do an update, otherwise, it will do an insert.

```js
var model = new ko.Model({ name: 'friends' });

model.save({ firstName: 'Jonathan', lastName: 'Creamer', id: 1 }).done(function () {
   console.log('Saved him!');
});
```

#### remove (id)
Removes a record from the database.

```js
var model = new ko.Model({ name: 'friends' });

model.remove(1382539084406).done(function () {
   console.log('1382539084406 was removed');
});
```

#### findOne (id)
Returns a single viewModel with the matching id.

```js
var model = new ko.Model({ name: 'friends' });

model.save({ firstName: 'Jonathan', lastName: 'Creamer', id: 1 }).done(function () {
   models.findOne(1).done(function (data) {
      console.log(data);
      // { firstName: 'Jonathan', lastName: 'Creamer', id: 1 }
   });
});
```

#### find (query)
Search the data for any matches. All matches are returned in the promise.

```js
var model = new ko.Model({ name: 'friends' });

model.save({ firstName: 'Jonathan', lastName: 'Creamer', id: 1 });
model.save({ firstName: 'Tyson', lastName: 'Cadenhead', id: 2 });
model.save({ firstName: 'Linus', lastName: 'Cadenhead', id: 3 });

model.find({
   lastName: 'Cadenhead'   
}).done(function (data) {
   console.log(data); 
   // [{ firstName: 'Tyson', lastName: 'Cadenhead', id: 2 }, { firstName: 'Linus', lastName: 'Cadenhead', id: 3 }]
});
```

### Events
Changing properties also trigger's events on the ViewModels.

```js
var me = new Person({
	firstName: "Jonathan",
	lastName: "Creamer"
});

me.on("change:firstName", function(value) {
	// value === "foo"
});

me.firstName("foo");
```

# Development
ko.ninja is built using grunt and bower. To run the build...

```bash
npm install && bower install
```

To run the tests...

```bash
grunt test
# or
grunt connect:test # to run the tests in your browser at localhost:8002
```

There is also a built in server to run the provided examples...

```bash
grunt connect:server # localhost:8000
```

# Future Features
* ~base `ko.Model` for saving and retrieving data~
* ko.Model for REST http syncing
* ko.Model for websockets syncing
* Built in mocking for models
* ViewModel validation with a `validation` property on ViewModels.