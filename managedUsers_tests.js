// More testing probably needs to be done, but the most important functionality is being tested.
// I heavily borrowed from meteor/packages/accounts-password/password_tests.js to figure out how to test an account.

Tinytest.add("ManagedUsers - No Permissions Found", function(test) {
	// I added this to "reset" the function to it's default, so re-runs of testing isn't broken.
	// There should be a cleaner way to reset the testing state back to the default, as opposed to restarting the server
	Meteor.ManagedUsers.availablePermissions = function() {
		return {};
	}

	test.equal(_.toArray(Meteor.ManagedUsers.availablePermissions()).length, 0, "There should be no permissions at this point.");
});

Tinytest.add("ManagedUsers - 2 Permissions Found", function(test) {
	// Set the permissions 
	Meteor.ManagedUsers.availablePermissions = function() {
		var permissions = {
			allowThis: "Allow the user to do this",
			allowThat: "Allow the user to do that"
		};
		return permissions;
	}
	test.equal(_.toArray(Meteor.ManagedUsers.availablePermissions()).length, 2, "There should be 2 permissions, this & that.");
});

if(Meteor.isClient) {
	Accounts._isolateLoginTokenForTest();
	
	var logoutStep = function (test, expect) {
		Meteor.logout(expect(function (error) {
			test.equal(error, undefined);
			test.equal(Meteor.user(), null);
		}));
	};

	var loggedInAs = function (someUsername, test, expect) {
		return expect(function (error) {
			test.equal(error, undefined);
			test.equal(Meteor.user().username, someUsername);
		});
	};

	testAsyncMulti("ManagedUsers - Account manipulation", [
		logoutStep,
		function(test, expect) {
			test.isFalse(Meteor.ManagedUsers.isAdmin());

			Accounts.createUser({username: "someone", password: "abc123", profile: {name: "Some One"}}, function(error) {
				test.equal(error.reason, "Signups forbidden");
			});
			
			Meteor.call('addUser', "someone", "Some One", "some@one.com", {}, expect(function(error, result) {
				test.instanceOf(error, Meteor.Error);
				test.equal(error.reason, "Only admin is allowed to do this.");
			}));

		},
		
		logoutStep,
		function(test, expect) {
			Meteor.loginWithPassword("admin", "abc123", expect(function(error) {
				test.equal(error, undefined);
				test.equal(Meteor.user().username, "admin");
				test.isTrue(Meteor.ManagedUsers.isAdmin());
			}));
		},

		function(test, expect) {
			Meteor.call('addUser', "someone", "Some One", "some@one.com", {}, expect(function(error, result) {
				test.equal(error, undefined);
			}));
		},
		
		function(test, expect) {
			var someone = Meteor.users.findOne({username: "someone"});
			Meteor.call('passwordReset', someone._id, expect(function(error, result) {
				test.equal(error, undefined);
				test.equal(result, someone._id);
			}));
		},

		function(test, expect) {
			var someone = Meteor.users.findOne({username: "someone"});
			test.equal("Some One", someone.profile.name);
			Meteor.call('updateUser', someone._id, someone.username, someone.profile.name, null, {}, expect(function(error, result) {
				test.equal(error, undefined);
				test.equal(result, someone._id);
			}));
		},

		function(test, expect) {
			var someone = Meteor.users.findOne({username: "someone"});
			Meteor.call('passwordReset', someone._id, expect(function(error, result) {
				test.instanceOf(error, Meteor.Error);
				test.equal(error.reason, "Can't send email.");
			}));
		},

		function(test, expect) {
			var someone = Meteor.users.findOne({username: "someone"});
			Meteor.call('removeUser', someone._id, expect(function(error, result) {
				test.equal(error, undefined);
				test.isTrue(result);
			}));
		},

		logoutStep,
	]);
}