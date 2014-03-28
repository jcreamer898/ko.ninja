# socket.io Storage

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