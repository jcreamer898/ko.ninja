# local Storage

This saves your collections or models to localStorage. Here is an example in the model:

```js
ko.Model.extend({
    name: 'myModelName',
    options: {
        storage: 'localStorage'
    }
})
```

This is how to set it up in a collection:

```js
ko.Collection.extend({
    name: 'myCollectionName',
    options: {
        storage: 'localStorage'
    } 
});
```