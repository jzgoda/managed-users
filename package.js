Package.describe({
	summary: "A managed user extension to the base Meteor user system, with a default Admin user, and ability to add various permissions to all users."
});

Package.on_use(function(api) {
	api.use(['minimongo', 'mongo-livedata', 'templating', 'accounts-password', 'accounts-ui-bootstrap-dropdown', 'email'], ['client', 'server']);
	api.add_files(['managedUsers.js'], ['client', 'server']);
	api.add_files(['managedUsersTemplates.html', 'managedUsersTemplates.js'], 'client');
});

Package.on_test(function(api) {
	api.use(['managedUsers', 'tinytest', 'test-helpers'], ['client', 'server']);
	api.add_files('managedUsers_tests.js', ['client', 'server']);
});