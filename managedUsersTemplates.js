// newUserForm
Template.newUserForm.helpers({
	newManagedUserError: function() {
		return Session.get("newManagedUserError");
	}
});

Template.newUserForm.clearForm = function() {
	$(".username").val("");
	$(".fullName").val("");
	$(".email").val("");
	$(".permission").prop('checked', false);
};

Template.newUserForm.events({
	'click #submit' : function () {
		var self = this;
		var permissions = {};
		_.keys(ManagedUsers.availablePermissions()).forEach(function(k) {
			permissions[k] = $("#newUser .permissions ."+k).prop('checked');
		});
		Meteor.call('addUser',
			$("#newUser .username").val(),
			$("#newUser .fullName").val(),
			$("#newUser .email").val(),
			permissions,
			function(error, result) {
				if(error) {
					Session.set("newManagedUserError", error.reason);
					Meteor.setTimeout(function() {
						Session.set("newManagedUserError", null);
					}, 3000);
				}
				if(result) {
					Session.set("newManagedUserError", null);
					Template.newUserForm.clearForm();
				}
			}
		);
	},

	'click #cancel': function () {
		Template.newUserForm.clearForm();
	}
});


// managedUsersTable
Template.managedUsersTable.helpers({
	systemUsers: function() {
		return Meteor.users.find({}, {sort: {username: 1}});
	}
});

Template.managedUsersTable.events({
	'click .remove-user': function() {
		var self = this;
		bootbox.userId = self._id;
		bootbox.confirm("Are you sure?", function(confirmed) {
			if(confirmed) {
				Meteor.call('removeUser', bootbox.userId,
					function(error, result) {
						if(error) {
							Session.set("managedUserError", error.reason);
							Meteor.setTimeout(function() {
								Session.set("managedUserError", null);
							}, 3000);
						}
						if(result) {
							Session.set("managedUserError", null);
						}
					}
				);
			}
		});
	},

	'click .editUser': function() {
		var self = this;
		$("#"+self._id+"_edit .username").val(self.username);
		$("#"+self._id+"_edit .fullName").val(self.profile.name);
		if(self.emails && self.emails[0]) {
			$("#"+self._id+"_edit .email").val(self.emails[0].address);
		}
		if(self.permissions) {
			_.keys(self.permissions).forEach(function(k) {
				$("#"+self._id+"_edit .permissions ."+k).prop('checked', self.permissions[k]);
			});
		}
	}
});


// managedUsersMessage
Template.managedUsersMessage.helpers({
	managedUserError: function() {
		return Session.get("managedUserError");
	}
});


// managedUserForm
Template.managedUserForm.permissions = function() {
	var permissions = new Array();
	_.keys(ManagedUsers.availablePermissions()).forEach(function(k) {
		permissions.push({name: k, description: ManagedUsers.availablePermissions()[k]});
	});
	return permissions;
};


// managedUserEditModal
Template.managedUserEditModal.helpers({
	editManagedUserError: function() {
		return Session.get("editManagedUserError");
	}
});

Template.managedUserEditModal.events({
	'click .editSave': function() {
		var self = this;
		var permissions = {};
		_.keys(ManagedUsers.availablePermissions()).forEach(function(k) {
			permissions[k] = $("#"+self._id+"_edit .permissions ."+k).prop('checked');
		});
		Meteor.call('updateUser', self._id,
			$("#"+self._id+"_edit .username").val(),
			$("#"+self._id+"_edit .fullName").val(),
			$("#"+self._id+"_edit .email").val(),
			permissions,
			function(error, result) {
				if(error) {
					Session.set("editManagedUserError", error.reason);
					Meteor.setTimeout(function() {
						Session.set("editManagedUserError", null);
					}, 3000);
				}
				if(result) {
					Session.set("editManagedUserError", null);
					$("#"+result+"_edit").modal('hide');
				}
			}
		);
	},

	'click .passwordReset': function() {
		var self = this;
		Meteor.call('passwordReset', self._id,
			function(error, result) {
				if(error) {
					Session.set("editManagedUserError", error.reason);
					Meteor.setTimeout(function() {
						Session.set("editManagedUserError", null);
					}, 3000);
				}
				if(result) {
					Session.set("editManagedUserError", null);
					$("#"+result+"_edit").modal('hide');
				}
			}
		);
	}
});