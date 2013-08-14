QUnit.start();

module("ko.ViewModel");

test("creating a ViewModel", function() {
	ok(ko.ViewModel, "should have a ViewModel constructor");

	var Person = ko.ViewModel.extend({
		observables: {
			firstName: "",
			lastName: "",
			fullName: function() {
				return this.firstName() + " " + this.lastName();
			}
		}
	});

	var me = new Person({
		firstName: "Jonathan",
		lastName: "Creamer"
	});

	ok(ko.isObservable(me.firstName), "firstName should be a ko.observable");
	equal(me.firstName(), "Jonathan", "should set up observables");
	equal(me.fullName(), "Jonathan Creamer", "should set up computed observables");

	console.log(me);
});