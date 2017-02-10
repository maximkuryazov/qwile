(function() {

	// this file needs serious refactor! :)

	var blue = '#0287a9';
	var time = 700;

	$.ajaxSetup({
		xhrFields: {
			withCredentials: true
		}
	});

	$('#circle').animate({ transform: 'scale(1)' }, 1000);
	
	if ((navigator.userAgent.toLowerCase().indexOf('firefox') > -1) || navigator.userAgent.indexOf('.NET') > -1) {
		$('#login input[type="password"]').focus(function() {
			$('#forgot').css({
				border: '1px solid #f90',
				borderLeft: 0
			});
		}).blur(function() {
			$('#forgot').css({
				border: '1px solid #04a0e0',
				borderLeft: 0
			});
		});
	}

	function showModal (color, message, success) {

		$('.modal-body').css({ 'font-size': '12px', 'color': color }).html(message);
		$('.modal').modal('show');
		setTimeout(function() {
			$('.modal').modal('hide');
			if (success) document.location = "/";
		}, 2500);

	}
	
	$('form#update').submit(function() {

		var href = document.location.href;

		var password = $.trim($(this).find('input[name="password"]').val());
		var passwordConfirm = $.trim($(this).find('input[name="confirm-password"]').val());

		if (password !== passwordConfirm) {
			showModal('#970101', "Passwords do not match.", false);
			return false;
		}

		$.ajax({
			url: "/user/updatePassword",
			data: {
				password:password,
				email: href.split("email=")[1],
				code: href.split("code=")[1].replace(/(.*)&(.*)/, "$1")
			},
			method: "POST",
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			},
			crossDomain: true,
			success: function (data) {
				if (data.success) {
					showModal(blue, "Password have been restored.", true);
				} else {
					showModal('#970101', data.error, false);
				}
			},
			error: function (xhr, status, error) {
				console.error(error);
			}
		});
		return false;

	});

	$('input[name="password"], input[name="confirm-password"]').on("change keyup blur", function() {

		// TODO: spell checking, like in registration

	});

	if (window.chrome) {
		$('.bubbles').empty();
		bubbles();
	}

})();