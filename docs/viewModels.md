# ViewModels

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

me.firstName("foo");
```