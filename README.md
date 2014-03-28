![](https://raw.github.com/jcreamer898/ko.ninja/master/ko-ninja.gif)

# ko.ninja
========

A framework for building awesome knockout.js apps.

The idea behind **ko.ninja** is that knockout has amazing two way binding functionallity, but not a lot of conventions for how to write ViewModels, Models, Collections and such.

ko.ninja provides methods to create view models, models and collections in a clean and reusable fashion that provide some built in helpers.

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

If your project isn't using AMD, ko.ninja will also work as a non-AMD script like this:

```html
<script src="bower_components/dist/ko.ninja.min.js"></script>
<script>
  ko.ViewModel.extend({
    ...
  });
</script>
```

# Using ko.Ninja

- [ViewModels](/docs/viewModels.md)
- [Collections](/docs/collections.md)
- [Models](/docs/models.md)
    - [Validations](/docs/validations.md)
    - [HTTP Storage](/docs/httpStorage.md)
    - [Local Storage](/docs/localStorage.md)
    - [Socket IO Storage](/docs/socketIoStorage.md)

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