# Collections

The Collections hold a group of [models](/docs/models.md), which contain the data for the application. The collections are built to be easily updated and manipulated to keep data synced between the client and the server. A simple collection may look something like this:

```js
var Dogs = ko.Collection.extend({
    model: Dog,
    options: {
        name: 'dogs',
        storage: 'localStorage'
    }
});
var dogs = new Dogs([{
    name: 'Sparky'
}, {
    name: 'Arthur'
}]);
```

## Options

#### {String} name

The name of the collection. This is used to automatically build requests for backend storage. For example, if your name is "dogs" and you are using http storage, the fetch request will automatically hit this URL: `/dogs`.

#### {String} storage

The storage type to use. Current options are "localStorage", "http" and "socket.io".

#### {String} port

The port number to use for socket io.

## Methods

#### autoSync ({Boolean} autoSync)

This makes the collection automatically sync with the backend anytime there is a change. To turn autoSync on, pass in `true`:

```js
dogs.autoSync(true);
```

#### count ()

This returns the number of models in the collection.

#### fetch ({Object} where)

Fetches data from the storage. If any conditions are passed in, they will be passed to the server with the request. For example:

```js
dogs.fetch({
    name: 'Spot'
});
```

with an `http` storage type, would make a request to `/dogs?name=Spot`.

#### find ({Object} where)

This searches all of the models that are currently in the collection and returns everything that matches the criteria. If no conditions are passed in, all of the models that are currently in the collection are returned.

#### get ({String} id)

Returns the model in the collection with the id that is passed in:

```js
var spot = dogs.get(123);
```

#### insert ({Object} data, {Object} options - optional)

Adds a model to the end of the collection or to the position that is specified in the options.

```js
// Inserts Spot as the second model in the collection
dogs.insert({
    name: 'Spot'
}, {
    position: 2
});
```

#### remove ({String} id)

Removes a model from the collection.

```js
dogs.remove(123);
```

#### sort ({String} name, {Boolean} desc)

Sorts the collection by the name that is passed in. If the second argument is truthy, the items will be sorted in descending order.

```js
dogs.sort('name', true); // Sorts by name descending
```

#### toJSON ()

Returns an array of all of the models converted to JSON.