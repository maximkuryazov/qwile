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

			var kittySchema = mongoose.Schema({
				name: String
			});

			kittySchema.methods.speak = function () {
				var greeting = this.name ? "Meow name is " + this.name : "I don't have a name";
				console.log(greeting);
			};

			var Kitten = mongoose.model('Kitten', kittySchema);
			var fluffy = new Kitten({ name: 'fluffy' });

			fluffy.speak();

			fluffy.save(function (err, fluffy) {
				if (err) return console.error(err);
				fluffy.speak();
			});

			Kitten.find(function (err, kittens) {
				if (err) return console.error(err);
				console.log("Kittens: " + kittens);
				for (var key in kittens) {
					console.log("Name: " + kittens[key].name);
					console.log("ID: " + kittens[key]._id);
				}
			});
			
		}
	};
	return constructor;

})();