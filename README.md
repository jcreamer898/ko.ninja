![](https://raw.github.com/jcreamer898/ko.ninja/master/ko-ninja.gif)

#ko.ninja
========

A framework for building awesome knockout.js apps.

The idea behind **ko.ninja** is that knockout has amazing two way binding functionallity, but not a lot of conventions for how to write ViewModels and such.

ko.ninja provides methods to create view models in a clean and reusable fashion that provide some built in helpers.

# Installation
ko.ninja can be used by downloading the `dist/ko.ninja.min.js` file or using bower:

```bash
bower install ko.ninja
```

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

The ko.Model syncs data from the ko.ViewModel with a back-end service or with localStorage. It can be added to the ko.ViewModel like this:

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

#### storage {String}
The type of storage to use on the viewModel. Currently, `localStorage` and `http` are both supported. 

#### http

HTTP expects a REST API and can be defined like this:

```js
ko.ViewModel.extend({
  model: {

      // The root that all ajax calls are made relative to
      urlRoot: function () {
          return '/list/'
      },

      // If you have a suffix appended to each URL, this can 
      // be used. It defaults to an empty string.
      suffix: '.json',

      // For HTTP, this should always be http
      storage: 'http',

      // The name of your model. If the urlRoot is not specified,
      // this will be used to build the urlRoot as well.
      name: 'list'

  },
  ...
});
```

#### socket.io

The socket.io storage expects a few different parameters. A socket.io setup might look something like this:

```js
ko.ViewModel.extend({
  model: {

    // For socket.io, the storage should always be set to socket.io
    storage: 'socket.io',

    // The name of the model. If message names are not specified, this will be used to generate the message names. This is required.
    name: 'list',

    // The http protocol to use for socket.io messages. This is set to "http" by default
    protocol: 'http',

    // The domain name to use for socket.io messages. This is set to "localhost" by default
    domainName: 'localhost',

    // The port number to use for socket.io messages. This is set to 8080 by default
    port: 3000,

    // The message names can be updated to be anything you want. These are all defaulted and not required.
    messageNames: {
      'update': 'update-myList',        // Defaults to {{name}}-update
      'insert': 'insert-intoMyList',    // Defaults to {{name}}-insert
      'find': 'find-stuffInMyList',     // Defaults to {{name}}-find
      'findOne': 'find-aThing',         // Defaults to {{name}}-findOne
      'remove': 'remove-aThing'         // Defaults to {{name}}-remove
    }

  },
  ....
});
```

It also important to note that ko.ninja does not require the socket.io JavaScript file. You will need to add it to your document like this:

```html
<script src="/socket.io/socket.io.js"></script>
```

For more information on Socket.io and getting it set up, checkout out the [Socket.io documentation](http://socket.io/#how-to-use).

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

model.insert({ firstName: 'Milo', lastName: 'Cadenhead' }, function (data) {
   console.log(data);
   // { firstName: 'Milo', lastName: 'Cadenhead', id: 1382539084406 }
});
```

#### update (id, data)
Updates the data in the database.

```js
var model = new ko.Model({ name: 'friends' });

model.update(1382539084406, { firstName: 'Linus' }, function () {
   model.findOne(1382539084406, function (data) {
      console.log(data);
      // { firstName: 'Linus', lastName: 'Cadenhead', id: 1382539084406 }
   });
}); 
```

#### save (data)
Instead of using update and insert, you can use save. If there is an id attribute, save will do an update, otherwise, it will do an insert.

```js
var model = new ko.Model({ name: 'friends' });

model.save({ firstName: 'Jonathan', lastName: 'Creamer', id: 1 }, function () {
   console.log('Saved him!');
});
```

#### remove (id)
Removes a record from the database.

```js
var model = new ko.Model({ name: 'friends' });

model.remove(1382539084406, function () {
   console.log('1382539084406 was removed');
});
```

#### findOne (id)
Returns a single viewModel with the matching id.

```js
var model = new ko.Model({ name: 'friends' });

model.save({ firstName: 'Jonathan', lastName: 'Creamer', id: 1 }, function () {
   models.findOne(1, function (data) {
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
}, function (data) {
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
grunt server # to run the tests in your browser at localhost:8003/qunit.html
```

There is also a built in server to run the provided examples...

```bash
grunt server # localhost:8003
```

# Future Features
* ~~base `ko.Model` for saving and retrieving data~~
* ~~ko.Model for REST http syncing~~
* ko.Model for websockets syncing
* Built in mocking for models
* ViewModel validation with a `validation` property on ViewModels.