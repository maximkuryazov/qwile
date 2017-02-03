/**
 * Created by User on 2/3/2017.
 */

module.exports = (function() {

	const private = {
		mongoose: {}
	};

	function constructor(firstName, lastName, mongoose) {

		private.mongoose = mongoose;

		this.firstName = firstName;
		this.lastName = lastName;
		this.fullName = function () {
			return this.firstName + ' ' + this.lastName;
		}

	}

	constructor.prototype = {

		remove: function() {
			console.log("Remove this user from database.");
		},

		create: function() {

			var mongoose = private.mongoose;

			var userSchema = mongoose.Schema({
				email: String,
				password: String,
				firstname: String,
				lastname: String,
				middlename: String,
				age: Number,
				birthday: Date,
				sound: Boolean,
				animations: Boolean,
				visible: Boolean
			});

			userSchema.methods.showData = function () {
				console.log("Email: " + this.email);
			};

			var User = mongoose.model('User', userSchema);

			var currentUser = new User({
				email: "maximkuryazov@gmail.com",
				password: "322538631",
				age: 27,
				birthday: new Date()
			});

			currentUser.save(function (error, currentUser) {
				if (error) return console.error(error);
				currentUser.showData();
			});

			User.find(function (error, users) {
				if (error) return console.error(error);
				console.log("Users: " + users);
				for (var key in users) {
					console.log("Email: " + users[key].email);
					console.log("ID: " + users[key]._id);
				}
			});

		}
	};
	return constructor;

})();