# http Storage

HTTP expects a REST API and can be defined like this:

```js
ko.Model.extend({

  // The name of your model. If the urlRoot is not specified,
  // this will be used to build the urlRoot as well.
  name: 'list'

  options: {

      // The root that all ajax calls are made relative to
      urlRoot: function () {
          return '/list/'
      },

      // If you have a suffix appended to each URL, this can 
      // be used. It defaults to an empty string.
      suffix: '.json',

      // For HTTP, this should always be http
      storage: 'http'

  }

});
```