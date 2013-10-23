/*global start, asyncTest */

QUnit.start();

module('ko.ViewModel');

test('creating a ViewModel', function() {
	ok(ko.ViewModel, 'should have a ViewModel constructor');

	var Person = ko.ViewModel.extend({
		observables: {
			firstName: '',
			lastName: '',
			fullName: function() {
				return this.firstName() + ' ' + this.lastName();
			}
		}
	});

	var me = new Person({
		firstName: 'Jonathan',
		lastName: 'Creamer'
	});

	ok(ko.isObservable(me.firstName), 'firstName should be a ko.observable');
	equal(me.firstName(), 'Jonathan', 'should set up observables');
	equal(me.fullName(), 'Jonathan Creamer', 'should set up computed observables');

});

test('changing property values', function() {
	var Person = ko.ViewModel.extend({
		observables: {
			firstName: '',
			lastName: '',
			fullName: function() {
				return this.firstName() + ' ' + this.lastName();
			}
		}
	});

	var me = new Person({
		firstName: 'Jonathan',
		lastName: 'Creamer'
	});

	ok(me.on, 'ViewModel should extend events');

	var called = false;
	me.on('change:firstName', function() {
		called = true;
	});
	me.firstName('foo');

	ok(called, 'should call the change event');
});

module('ko.Model', {
	setup: function () {
		this.model = new ko.Model({
			name: 'friends'
		});
	},
	teardown: function () {
		localStorage.clear();
	}
});

asyncTest('when inserting data', function () {
	this.model.insert({
		firstName: 'Jonathan',
		lastName: 'Creamer'
	}).done(function (data) {
		var record = JSON.parse(localStorage['friends-' + data.id]);
		ok(data.id, 'it should create an id');
		equal(record.firstName, 'Jonathan', 'it should set the firstName');
		equal(record.lastName, 'Creamer', 'it should set the lastName');
		start();
	});
});

asyncTest('when updating data', function () {
	localStorage['friends-1'] = JSON.stringify({ id: 1, firstName: 'Jonathan', lastName: 'Creamer' });
	this.model.update('1', {
		id: 1,
		firstName: 'Tyson',
		lastName: 'Cadenhead'
	}).done(function () {
		var record = JSON.parse(localStorage['friends-1']);
		equal(record.firstName, 'Tyson', 'it should change the firstName');
		start();
	});
});

asyncTest('when using the save shortcut', function () {
	this.model.save({
		firstName: 'Jonathan'
	}).done(function (data) {
		var record = JSON.parse(localStorage['friends-' + data.id]);
		equal(record.firstName, 'Jonathan', 'it should save the friend');
		this.save({
			id: data.id,
			firstName: 'Tyson'
		}).done(function (updatedData) {
			var record = JSON.parse(localStorage['friends-' + data.id]);
			equal(record.firstName, 'Tyson', 'it should update the friend');
			equal(updatedData.id, data.id, 'it should have the same id');
			start();
		});
	});
});

asyncTest('when removing data', function () {
	localStorage['friends-1'] = JSON.stringify({ id: 1, firstName: 'Jonathan', lastName: 'Creamer' });
	this.model.remove('1').done(function () {
		ok(!localStorage['friends-1'], 'it should remove the record');
		start();
	});
});

asyncTest('when finding a single record', function () {
	localStorage['friends-1'] = JSON.stringify({ id: 1, firstName: 'Jonathan', lastName: 'Creamer' });
	this.model.findOne('1').done(function (data) {
		equal(data.firstName, 'Jonathan', 'it should find the record');
		start();
	});
});

asyncTest('when we find multiple records', function () {
	localStorage['friends-1'] = JSON.stringify({ id: 1, firstName: 'Jonathan', lastName: 'Creamer' });
	localStorage['friends-2'] = JSON.stringify({ id: 2, firstName: 'Tyson', lastName: 'Cadenhead' });
	localStorage['friends-3'] = JSON.stringify({ id: 3, firstName: 'Trae', lastName: 'Cadenhead' });

	this.model.find({
		lastName: 'Cadenhead'
	}).done(function (data) {
		equal(data.length, 2, 'it should get both records with the lastName of Cadenhead');
		equal(data[0].lastName, 'Cadenhead', 'it should have Cadenhead as the lastName of the first record');
		equal(data[0].lastName, 'Cadenhead', 'it should have Cadenhead as the lastName of the second record');
		start();
	});
});

module('ko.ViewModel with a ko.Model', {
	setup: function () {
		var Person = ko.ViewModel.extend({
			observables: {
				firstName: 'Jonathan',
				lastName: 'Creamer',
				id: 1
			},
			model: new ko.Model({
				name: 'person'
			})
		});

		this.person = new Person();

	},
	teardown: function () {
		localStorage.clear();
	}
});

asyncTest('when we add a model to a ViewModel and then update the data', function () {

	var self = this;

	this.person.firstName('Tyson');
	this.person.lastName('Cadenhead');

	setTimeout(function () {
		self.person.model.findOne(1).done(function (data) {
			equal(data.firstName, 'Tyson', 'it should set the first name to Tyson and save it automatically');
			equal(data.lastName, 'Cadenhead', 'it should set the last name to Cadenhead and save it automatically');
			start();
		});
	}, 400);

});

asyncTest('when we add a model to a ViewModel and then fetch the data', function () {
	var self = this;
	localStorage['person-1'] = JSON.stringify({ id: 1, firstName: 'Tyson', lastName: 'Cadenhead' });
	this.person.fetch(function () {
		equal(self.person.firstName(), 'Tyson', 'the ViewModel is updated with data from the model');
		ok(self.person.autoSync, 'it should reset autoSync to be on');
		start();
	});
});