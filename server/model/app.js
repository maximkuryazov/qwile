/**
 * Created by User on 2/21/2017.
 */

module.exports = (function() {

	const private = {
		
		mongoose: {},
		db: {}
		
	};

	function constructor (mongoose, db) {

		private.mongoose = mongoose;
		private.db = db;

		var appSchema = mongoose.Schema({

			name: String,
			icon: String,
			description: String,
			developer: String,
			rating: Number,
			iframe: Boolean,
			scroll: Boolean
			
		});
		
		private.AppModel = mongoose.model("App", appSchema);

	}

	constructor.prototype = {

		getAppById: function (id, callback) {
			private.AppModel.findOne({ _id: id }, function (error, document) {

				if (!error) callback.call(this, document);
				else {

					console.log("Error " + error + " occurred.");
					callback.call(this, document, error);

				}

			});
		}

	}
	return constructor;
		
})();