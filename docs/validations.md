# Model Validation

The Ninja Model can handle all of your client-side validations with the `validation` object. Adding a validation object to your Model will look something like this:

```js
var Person = ko.Model.extend({

  observables: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      answer: ''
  },

  validation: {
      firstName: {
          required: 'Your first name is required',
          minLength: {
              message: 'Please make sure your name is at least 3 characters long.',
              value: 3
          }
      },
      email: {
          required: 'Your email address is required',
          email: 'Please enter a valid email address'
      },
      phone: {
          number: 'Please enter a valid number',
          length: {
              message: 'Please make sure your phone number has 9 digits',
              value: 9
          }
      },
      answer: {
          maxLength: {
              message: 'You have entered more than 2 characters... there is no way you are typing "44"!',
              value: 2
          },
          custom: {
              message: 'Please enter "44"',
              validator: function (value) {
                  return value !== '44';
              }
          }
      }
  },

  submitPerson: function () {
      var errors = this.validate();
      if (!errors) {
          alert('Your form has been submitted. Just kidding!')
      }
  }

});

var tyson = new Person({});
tyson.submitPerson();
```

[Here is a JSFiddle](http://jsfiddle.net/tysoncadenhead/QUPg8/) showing the code above in action.

As your observables are updated, there will also be an observable called [observableName].error that will be populated with errors on the observable.

For example, if you want to watch for errors on the first name, your template would look like this:

```html
<p data-bind="css: { error: firstName.error }">
    <label>First name:</label>
    <input data-bind="value: firstName, valueUpdate:'afterkeydown'" />
</p>
<div class="error-message" data-bind="html: firstName.error"></div>
```

You never need to change the error because ko.ninja will keep track of updates for you and populate the error observable if needed.

Each viewModel also has an `errors` observable array with all of the errors in the viewModel. To show a list of all of the errors in the form, you could do something like this:

```html
<div data-bind="visible: errors().length">
    <p>Here are the fields that have errors:</p>
    <ul data-bind="foreach: errors">
        <li>
            <span data-bind="text: observable"></span> - 
            <span data-bind="text: error"></span>
        </li>
    </ul>
</div>
```

Out of the box, ko.ninja comes with a few validators. You can also use the `custom` validator to create your own validation.

##### required

Checks to see if there is a value for the observable.

```js
{
  required: 'This is required'
},

// Or
{
  required: {
    message: 'This is required'
  }
}
```

##### email

Checks to see if the value is a valid email address.

```js
{
  email: 'This is not an email address'
},

// Or
{
  email: {
    message: 'This is not an email address'
  }
}
```

##### number

Checks to make sure that all of the characters in the observable are numbers.

```js
{
  number: 'This is not a number'
},

// Or
{
  number: {
    message: 'This is not a number'
  }
}
```

##### maxLength

Checks to make sure that the length is not more than the value passed in.

```js
{
  length: {
    message: 'This is more than 5 characters long',
    value: 5
  }
}
```

##### minLength

Checks to make sure that the length is not less than the value passed in.

```js
{
  length: {
    message: 'This is less than 5 characters long',
    value: 5
  }
}
```

##### length

Checks to make sure that the length is the same as the passed in value

```js
{
  length: {
    message: 'This is not 5 characters long',
    value: 5
  }
}
```

##### custom

If you want to create your own validation, use the custom validator. If the method returns a truthy value, the ViewModel will assume that there is an error.

##### maxLength

Checks to make sure that the length is not more than the value passed in.

```js
{
  custom: {
    message: 'Your name is not Tyson',
    validator: function (value) {
      return value !== 'Tyson';
    }
  }
}
```