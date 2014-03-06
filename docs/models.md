# Models

## Options

#### idAttribute {String}
The id attribute on the viewModel. This is used for syncing with databases. Defaults to `id`.

```js
ko.Model.extend({
  name: 'friend',
  options: {
    idAttribute: '_id'
  }
});
```

#### storage {String}

The storage type to use with the model. If the model is inside a collection, the model will inherit the storage type from the collection.

```js
ko.Model.extend({
  name: 'friend',
  options: {
    storage: 'localStorage'
  }
});
```
Current storage types include:

- [HTTP Storage](httpStorage.md)
- [Local Storage](localStorage.md)
- [Socket IO Storage](socketIoStorage.md)

## Methods

#### autoSync ({Boolean} autoSync)

This makes the model automatically sync with the backend anytime there is a change. To turn autoSync on, pass in `true`:

```js
dog.autoSync(true);
```

#### clear ()

Removes all of the data from the observables in the model:

```js
dog.clear();
```

#### get ({String} name)

Returns one of the observable in the model:

```js
dog.get('firstName'); // Fido
```

#### getId ()

Returns the id attribute of the observables. By default, the ID attribute is an observable named "id", but this can be overridden using the "idAttribute" option.

```js
var Dog = ko.Model.extend({
  observables: {
    id: 111
  }
});
var fido = new Dog();
console.log(fido.getId()); // 111
```

#### has ({String} name)

If the requested observable returns a truthy value, this will be true:

```js
fido.set('firstName', 'Fido');
console.log(fido.has('firstName')); // true
fido.set('firstName', null);
console.log(fido.has('firstName')); // false
```

#### toJSON ()

Returns the JSON values for the observables in the model.

#### insert (data)
Inserts new data into the database.

```js
var Model = ko.Model.extend({
  name: 'friend',
  observables: {
    firstName: '',
    lastName: '',
    id: null
  }
});
var model = new Model();

model.insert({ firstName: 'Milo', lastName: 'Cadenhead' }, function (data) {
   console.log(data);
   // { firstName: 'Milo', lastName: 'Cadenhead', id: 1382539084406 }
});
```

#### update (id, data)
Updates the data in the database.

```js
var Model = ko.Model.extend({
  name: 'friend',
  observables: {
    firstName: '',
    lastName: '',
    id: null
  }
});
var model = new Model();

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
var Model = ko.Model.extend({
  name: 'friend',
  observables: {
    firstName: '',
    lastName: '',
    id: null
  }
});
var model = new Model();

model.save({ firstName: 'Jonathan', lastName: 'Creamer', id: 1 }, function () {
   console.log('Saved him!');
});
```

#### remove (id)
Removes a record from the database.

```js
var Model = ko.Model.extend({
  name: 'friend',
  observables: {
    firstName: '',
    lastName: '',
    id: null
  }
});
var model = new Model();

model.remove(1382539084406, function () {
   console.log('1382539084406 was removed');
});
```

#### findOne (id)
Returns a single viewModel with the matching id.

```js
var Model = ko.Model.extend({
  name: 'friend',
  observables: {
    firstName: '',
    lastName: '',
    id: null
  }
});
var model = new Model();

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
var Model = ko.Model.extend({
  name: 'friends',
  observables: {
    firstName: '',
    lastName: '',
    id: null
  }
});
var model = new Model();

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

## [Validations](validations.md)

There are a ton of validations you can do on the model before it is allowed to save to a backend service.