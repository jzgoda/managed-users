ManagedUsers = {
	availablePermissions: function() {
		// Return an object of key/value pairs, like:  {permissionName: "Permission Description", ....}
		// Do this in a file accessible by both the server and client.
		return {};
	},

	// Input Validation
	isAdmin: function() {
		return (Meteor.user() &&  (Meteor.user().username === "admin"));
	},

	checkUsername: function(username, userId) {
		if(!username)
			throw new Meteor.Error(400, "Username can not be blank.");
		var usernamePattern = /^[a-z]+$/g;
		if(!usernamePattern.test(username))
			throw new Meteor.Error(400, "Username format is incorrect.");
		var u = Meteor.users.findOne({username: username});
		if(u && (!userId || (u._id !== userId)))
			throw new Meteor.Error(400, "Username already in use.");
	},

	checkEmailAddress: function(address, userId) {
		if(address) {
			var emailPattern =  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i;
			if(!emailPattern.test(address))
				throw new Meteor.Error(400, "Email Address format is incorrect.");
			var u = Meteor.users.findOne({emails: { $elemMatch: { address: address}}});
			if(u && (!userId || (u._id !== userId)))
				throw new Meteor.Error(400, "Email Address already in use.");
		}
	},

	hasPermission: function(permission) {
		if(Meteor.user() && ((Meteor.user().username === "admin") || (Meteor.user().permissions && Meteor.user().permissions[permission] == true)))
			return true;
	}
}

// Do not allow account creation by just anyone
Accounts.config({forbidClientAccountCreation: true});

if(Meteor.isServer) {
	// Verify that the admin user account exists (should be created on the first run)
	var u = Meteor.users.findOne({username: "admin"}); // find the admin user
	if(!u) {
		Accounts.createUser({username: "admin", password: "abc123", profile: {name: "Administrator"}});
	}


	Meteor.publish("systemUsers", function() {
		if(this.userId)
			return Meteor.users.find({username: {$ne: "admin"}}, {sort: {userId: 1}, fields: {username: 1, profile: 1, emails: 1, permissions: 1}});
	});


	Meteor.methods({
		removeUser: function(userId) {
			if(! ManagedUsers.isAdmin())
				throw new Meteor.Error(401, "Only admin is allowed to do this.");
			if(Meteor.user()._id === userId)
				throw new Meteor.Error(401, "Admin can not be removed.");
			Meteor.users.remove(userId);
			return true;
		},

		updateUser: function(userId, username, name, address, permissions) {
			if(! ManagedUsers.isAdmin())
				throw new Meteor.Error(401, "Only admin is allowed to do this.");
			ManagedUsers.checkUsername(username, userId);
			if(!name)
				throw new Meteor.Error(400, "Name can not be blank.");
			ManagedUsers.checkEmailAddress(address, userId);
			if(Meteor.user()._id === userId) {
				username = "admin";
				name = "Administrator";
			}
			if(address) {
				address = new Array({address: address});
			} else {
				address = null;
			}
			Meteor.users.update(userId, {$set: {
				username: username,
				profile: {name: name},
				emails: address,
				permissions: permissions
			}});
			return userId;
		},

		passwordReset: function(userId) {
			if(! ManagedUsers.isAdmin())
				throw new Meteor.Error(401, "Only admin is allowed to do this.");
			try {
				Accounts.sendResetPasswordEmail(userId);
			} catch(e) {
				throw new Meteor.Error(400, "Can't send email.");
			}
			return userId;
		},

		addUser: function(username, name, address, permissions) {
			if(! ManagedUsers.isAdmin())
				throw new Meteor.Error(401, "Only admin is allowed to do this.");
			ManagedUsers.checkUsername(username);
			if(!name)
				throw new Meteor.Error(400, "Name can not be blank.");
			ManagedUsers.checkEmailAddress(address);
			var newUserId = Accounts.createUser({username: username, email: address, profile: {name: name}});
			if(address)
				Accounts.sendEnrollmentEmail(newUserId);
			Meteor.users.update(newUserId, {$set: {
				permissions: permissions
			}});
			return newUserId;
		}
	});
}

if(Meteor.isClient) {
	Meteor.subscribe("systemUsers");

	// Use username or an optional email adddress for login
	Accounts.ui.config({passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'});

	// A shared Handlebars helper that returns true when the logged in user is "admin"
	Handlebars.registerHelper('isAdmin', function() {
		return ManagedUsers.isAdmin();
	});

	// The current user's full name
	Handlebars.registerHelper('profileName', function() {
		if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.name)
			return Meteor.user().profile.name;
	});

	// Pass a user object, and get the email address
	Handlebars.registerHelper('emailAddress', function(user) {
		if(user && user.emails)
			return user.emails[0].address;
	});

	// Pass the permission name (as a string) to this helper
	Handlebars.registerHelper('hasPermission', function(permission) {
		return ManagedUsers.hasPermission(permission);
	});
}