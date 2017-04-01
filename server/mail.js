/**
 * Created by User on 2/4/2017.
 */

module.exports = (function() {

	const fs = require("fs");
	
	return {
		send: function (options, successCallback, errorCallback) {

			const nodeMailer = require("nodemailer");
			var credentials = JSON.parse(fs.readFileSync("./server/credentials.json", "utf8"));

			var transporter = nodeMailer.createTransport({
				service: "Gmail",
				auth: {

					user: credentials.mail,
					pass: credentials.pass

				}
			});

			transporter.sendMail(options, function(error, info) {
				if (error) {

					console.log(error);
					errorCallback(error);

				} else {

					console.log("Message sent: " + info.response);
					successCallback(info);

				}
			});

		}
	};

})();