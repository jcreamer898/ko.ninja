# Pub / Sub

The ViewModels, Models and Collections have the ability to publish and subscribe to messages. The API looks like this:

```js
var MyViewModel = ko.ViewModel.extend({
    
    subscriptions: {
        'my-topic': function (data) {
            alert(data);
        }
    }

});

var myViewModel = new MyViewModel();

myViewModel.publish('my-topic', 'hello world');
```

## Options

#### subscriptions

You can pass an object called "subscriptions" into any viewModel, Model or Collection. The name will be the topic that is listened for and the argument will be the callback function when the topic is published.

## Methods

#### subscribe ({String} topic, {Function} callback)

Subscribes the ViewModel, Model or Collection to a topic.

```js
this.subscribe('my-topic', function () {
    ...
});
```

#### publish ({String} topic, {Object} data)

Publishes the data to everywhere that is subscribed to the topic.

```js
this.publish('my-topic', {
    ...
});
```

#### unsubscribe({String} topic)

Unsubscribes the ViewModel, Model or Collection from the topic that is passed in.

```js
this.unsubscribe('my-topic');
```

#### unsubscribeAll()

Removes all of the subscriptions on the ViewModel, Model or Collection.

```js
this.unsubscribeAll();
```