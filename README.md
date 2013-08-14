ko.ninja
========

A framework for building awesome knockout.js apps.

The idea behind `ko.ninja` is that knockout has amazing two way binding functionallity, but not a lot of conventions for how to write ViewModels and such.

`ko.ninja` provides methods to create view models in a clean and reusable fashion that provide some built in helpers.

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
}))
```
