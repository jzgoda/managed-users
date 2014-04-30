Package.describe({
	summary: "A managed user extension to the base Meteor user system, with a default Admin user, and ability to add various permissions to all users."
});

Package.on_use(function(api, where) {
	api.use(['minimongo', 'mongo-livedata', 'templating', 'accounts-password', 'email', 'bootstrap-3', 'accounts-ui-bs3-and-blaze'], ['client', 'server']);
	api.use(['handlebars'], 'client');
	api.add_files(['managedUsers.js'], ['client', 'server']);
	api.add_files(['managedUsersTemplates.html', 'managedUsersTemplates.js', 'bootbox.min.js'], 'client');
	if(api.export)
		api.export("ManagedUsers");
});

Package.on_test(function(api) {
	api.use(['managedUsers', 'tinytest', 'test-helpers', 'accounts-password'], ['client', 'server']);
	api.add_files('managedUsers_tests.js', ['client', 'server']);
});
