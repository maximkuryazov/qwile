/**
 * Created by User on 2/4/2017.
 */

module.exports = (function() {

	const fs = require('fs');
	
	return {
		send: function (options, successCallback, errorCallback) {

			const nodeMailer = require('nodemailer');

			var transporter = nodeMailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'maximkuryazov@gmail.com',
					pass: '322538631'
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
	}

})();
