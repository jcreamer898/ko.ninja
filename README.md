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

### Validation

The Ninja ViewModel can handle all of your client-side validations with the `validation` object. Adding a validation object to your ViewModel will look something like this:

```js
var Person = ko.ViewModel.extend({

  observables: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      answer: ''
  },

  validation: {
      firstName: {
          required: 'Your first name is required',
          minLength: {
              message: 'Please make sure your name is at least 3 characters long.',
              value: 3
          }
      },
      email: {
          required: 'Your email address is required',
          email: 'Please enter a valid email address'
      },
      phone: {
          number: 'Please enter a valid number',
          length: {
              message: 'Please make sure your phone number has 9 digits',
              value: 9
          }
      },
      answer: {
          maxLength: {
              message: 'You have entered more than 2 characters... there is no way you are typing "44"!',
              value: 2
          },
          custom: {
              message: 'Please enter "44"',
              validator: function (value) {
                  return value !== '44';
              }
          }
      }
  },

  submitPerson: function () {
      var errors = this.validate();
      if (!errors) {
          alert('Your form has been submitted. Just kidding!')
      }
  }

});
```

As your observables are updated, there will also be an observable called [observableName].error that will be populated with errors on the observable.

For example, if you want to watch for errors on the first name, your template would look like this:

```html
<p data-bind="css: { error: firstName.error }">
    <label>First name:</label>
    <input data-bind="value: firstName, valueUpdate:'afterkeydown'" />
</p>
<div class="error-message" data-bind="html: firstName.error"></div>
```

You never need to change the error because ko.ninja will keep track of updates for you and populate the error observable if needed.

Each viewModel also has an `errors` observable array with all of the errors in the viewModel. To show a list of all of the errors in the form, you could do something like this:

```html
<div data-bind="visible: errors().length">
    <p>Here are the fields that have errors:</p>
    <ul data-bind="foreach: errors">
        <li>
            <span data-bind="text: observable"></span> - 
            <span data-bind="text: error"></span>
        </li>
    </ul>
</div>
```

Out of the box, ko.ninja comes with a few validators. You can also use the `custom` validator to create your own validation.

##### required

Checks to see if there is a value for the observable.

```js
{
  required: 'This is required'
},

// Or
{
  required: {
    message: 'This is required'
  }
}
```

##### email

Checks to see if the value is a valid email address.

```js
{
  email: 'This is not an email address'
},

// Or
{
  email: {
    message: 'This is not an email address'
  }
}
```

##### number

Checks to make sure that all of the characters in the observable are numbers.

```js
{
  number: 'This is not a number'
},

// Or
{
  number: {
    message: 'This is not a number'
  }
}
```

##### maxLength

Checks to make sure that the length is not more than the value passed in.

```js
{
  length: {
    message: 'This is more than 5 characters long',
    value: 5
  }
}
```

##### minLength

Checks to make sure that the length is not less than the value passed in.

```js
{
  length: {
    message: 'This is less than 5 characters long',
    value: 5
  }
}
```

##### length

Checks to make sure that the length is the same as the passed in value

```js
{
  length: {
    message: 'This is not 5 characters long',
    value: 5
  }
}
```

##### custom

If you want to create your own validation, use the custom validator. If the method returns a truthy value, the ViewModel will assume that there is an error.

##### maxLength

Checks to make sure that the length is not more than the value passed in.

```js
{
  custom: {
    message: 'Your name is not Tyson',
    validator: function (value) {
      return value !== 'Tyson';
    }
  }
}
```

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
* ~~ko.Model for websockets syncing~~
* Built in mocking for models
* ViewModel validation with a `validation` property on ViewModels.