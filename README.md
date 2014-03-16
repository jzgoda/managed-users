ManagedUsers for Meteor
========================

This is a simple package for making Meteor's default Accounts system more managed.
With it, you will get:
* A single "admin" account (default password is "abc123"...obviously change this).
* A permissions system, which by default has no permissions (so, it's optional).
* Templates for adding, updating, and deleting user accounts.
* This package will prevent users from creating their own accounts.

----------------------

This README will certainly need more details, but for now, I'll just go over the basics to get the system up and running.

----------------------

Install using Meteorite:
-------------------------
``` sh
mrt add managedUsers
```	
Meteor Package Requirements: accounts-password, email

*The 'bootstrap-3' and 'accounts-ui-bootstrap-3' from Atmosphere are included as dependencies in smart.json.*
*A minified version of Bootbox.js (http://bootboxjs.com/), is also included. (v4.2.0)*

Then just add the ` {{> managedUsers}} ` template wherever you want the management interface to be.


Handlebars Helpers
-------------------
There are a few helpers to make life easier:

* isAdmin: Will return true when the currently logged in user is "admin". I would suggest wrapping the managedUsers template in a ` {{#if isAdmin}}...{{/if}} ` block. (But the server-side methods also check that the user is "admin".)
* profileName: Just displays the name of the currently logged in user.
* emailAddress: Returns the email address of the passed user, like: ` {{emailAddress user}} `
* hasPermission: Returns true if the currently logged in user has the passed permission, like: ` {{hasPermission 'permissionName'}} ` (It will also return true if the logged in user is "admin".)


Adding Permissions
-------------------
Just add the below function somewhere where both the server and client have access to it, and then return an object of key/value pairs.

```javascript
ManagedUsers.availablePermissions = function() {
	// Return an object of key/value pairs, like:  {permissionName: "Permission Description", ....}
	// Do this in a file accessible by both the server and client.
	return {};
},
```

Testing for Permissions
------------------------
` ManagedUsers.hasPermission(permissionName) ` accepts a string of the permission's name, and then returns a boolean if the current user has that permission.


To Do
-------
* Incorporate a better Error pattern (like the one in the Discover Meteor book)
* Implement Roles
