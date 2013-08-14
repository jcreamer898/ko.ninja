ko.ninja
========

A framework for building awesome knockout.js apps.

The idea behind `ko.ninja` is that knockout has amazing two way binding functionallity, but not a lot of conventions for how to write ViewModels and such.

`ko.ninja` provides methods to create view models in a clean and reusable fashion that provide some built in helpers.

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

me.firstName("foo"); // "Jonathan"
```

# Future Features
* `ko.Model` for retreiving data from the server
* Resource manager to swap out http vs. websockets
* Built in mocking for models
* ViewModel validation with a `validation` property on ViewModels.