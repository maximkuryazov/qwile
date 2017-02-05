(function() {

	// this file needs serious refactor! :)

	var Blue = '#0287a9';
	var time = 700;

	$('#circle').animate({ transform: 'scale(1)' }, 1000);
	$('.reglink').click(function() {
		$('#circle').stop().css('transform', 'rotate(0deg)').animate({
			marginLeft: '-1200px',
			transform: 'rotate(-280deg)'
		}, time, function() {
			$('#login').hide();
			$('#register').show().find('input:first').focus();
			$('#circle').css('margin-left', '1200px').css('transform', 'rotate(0deg)').animate({
				marginLeft: '0px',
				transform: 'rotate(-360deg)'
			}, time);
		});
	});
	
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

	var restoreHTML = '<div onclick="$(this).remove();" class="shadow"><div class="inner-shadow"> \
	<form id="restore-form"><input id="restore-input" onclick="event.stopPropagation()" type="text" placeholder="Type your E-Mail address here"></input><button onclick="event.stopPropagation()" class="btn btn-primary" id="restore-button">Restore</button></form></div></div>';
	$('#forgot').tooltip().click(function() {

		$(restoreHTML).appendTo('body').fadeIn();
		$('#restore-input').tooltip().focus(function() {
			$(this).css('text-align', 'left').attr('placeholder', '');
		});
		function closeShadow() {
			$('.shadow').fadeOut(function() {
				$(this).remove();
			});
			$('.modal-body').css({ 'font-size': '12px', 'color': Blue }).html('Instructions were sent to your E-Mail.');
			$('.modal').modal('show');
			setTimeout(function() {
				$('.modal').modal('hide');
			}, 2500);
			return false;
		}
		$('#restore-button').click(closeShadow);
		$("#restore-form").submit(closeShadow);

	});

	$('#back').click(function() {
		$('#circle').stop().css('transform', 'rotate(0deg)').animate({
			marginLeft: '1200px',
			transform: 'rotate(280deg)'
		}, time, function() {
			$('#login, #register').toggle();
			$('#circle').css({
				transform: 'rotate(0deg)',
				'margin-left': '-1200px'
			}).animate({
				marginLeft: '0px',
				transform: 'rotate(360deg)'
			}, time);
		});
		return false;
	});

	$('#enter').click(function() {
		if ($('#login input[type="text"]:first').val() == 'test@test.com' && $('#login input[type="password"]').val() == 'test') {
			$('#circle').stop().css("transform", "rotate(0deg)").animate({
  				transform: 'rotate(360deg) scale(0)'
			}, time, function() {
				$('.bubble-toggle').click();
				//location.href = '/desktop';
				var state = { foo: "bar" };
				window.history.pushState(state, "Desktop", "desktop");
				// no longer need, because now you can type /desktop in URL
				// window.history.back();
			});
		} else {
			$('.modal-body').css({ 'font-size': '12px', 'color': '#970101' }).html('Incorrect password or E-Mail address.');
			$('.modal').modal('show');
			setTimeout(function() {
				$('.modal').modal('hide');
			}, 2500);
		}
		return false;
	});

	if (window.chrome) {
		$('.bubbles').empty();
		bubbles();
	}

	// registration

	function showErrorModal(message) {

		$('.modal-body').html(message).css({
			'color': '#970101',
			'font-size': '13px'
		});
		$('.modal').modal('show');
		setTimeout(function() {
			$('.modal').modal('hide');
		}, 3000);

	}
	
	// captcha
	
	var $captcha = $("#captcha");
	function initCaptcha() {
		$captcha.attr("src", "http://" + document.domain + ":" + Qwile.serverPort + "/captcha?cache=" + Math.random());
	}
	initCaptcha();
	$captcha.click(function() {
		initCaptcha();
	});

	$("form#register").submit(function(event) {

		if ($("#register img[src='img/incorrect.png']:visible").length == 0 && $("#register img[src='img/complete.png']:visible").length == 4) {

			$.ajax({
				url: Qwile.baseURL + ":" + Qwile.serverPort + "/user/new",
				data: $(this).formSerialize(),
				method: "POST",
				dataType:  'json',
				// we need to send cookie, and that's why we use these cross-domain stuff and Credentials,
				// 'cuz stupid XHR thinks that when we send to different port (3000) - it is a different domain!
				xhrFields: {
					withCredentials: true
				},
				crossDomain: true,
				success: function(data) {

					if(data.success) {

						$('.modal-body').html('Your new account was created! <br /> Now you can log in.').css({
							'color': Blue,
							'font-size': '13px'
						});
						$('.modal').modal('show');
						setTimeout(function() {
							$('.modal').modal('hide');
						}, 3000);
						setTimeout(function() {
							$('#back').click();
						}, 2000);

					} else {

						var errorText = "";
						if (data.occupied) {
							errorText = "This E-Mail address already exists.";
						} else if (data.wrongCaptcha) {
							errorText = "Text from picture is incorrect.";
						} else {

							data.errors.forEach(function(error, i) {
								errorText += "Field <b>" + error + "</b> contains inappropriate symbols.<br />";
								$('input[name="' + error + '"]')
									.addClass("wrong")
									.parent().parent().find("td.check img").attr('src', 'img/incorrect.png');
							});
						}
						showErrorModal(errorText);

					}

				},
				error: function(xhr, status, error) {
					console.error(error);
				}
			});

		} else {
			showErrorModal("Some fields contain errors or weren\'t complete.");
		}
		return false;
	});

	function validateEmail(email) {
   	 	var re = /\S+@\S+\.\S+/;
   	 	return re.test(email);
	}

	$("#email-input").on("change keyup blur", function() {
		var $img = $(".check img", this.parentNode.parentNode);
		if (validateEmail($.trim(this.value))) {
			$img.css("display", "block").attr('src', 'img/complete.png')
			$(this).removeClass("wrong");
		} else {
			$img.css("display", "block").attr('src', 'img/incorrect.png');
			$(this).addClass("wrong");
		}
	});

	var userPassword = new String();

	$("#password-input").on("change keyup blur", function() {
		var $img = $(".check img", this.parentNode.parentNode);
		var confirm = $("#confirm-password-input").val();
		if (this.value.length > 5) {
			$img.css("display", "block").attr('src', 'img/complete.png');
			$(this).removeClass("wrong");
		} else {
			$img.css("display", "block").attr('src', 'img/incorrect.png');
			$(this).addClass("wrong");
		}
		var confirmField = document.getElementById("confirm-password-input").parentNode.parentNode;
		if ((confirm && confirm !== this.value) || !confirm) {
			$(".check img", confirmField).css("display", "block").attr('src', 'img/incorrect.png');
			$(this).addClass("wrong");
		} else {
			$(".check img", confirmField).css("display", "block").attr('src', 'img/complete.png');
			$(this).removeClass("wrong");
		}
		userPassword = this.value;
	});

	$("#confirm-password-input").on("change keyup blur", function() {
		var $img = $(".check img", this.parentNode.parentNode);
		if (this.value === userPassword) {
			$img.css("display", "block").attr('src', 'img/complete.png');
			$(this).removeClass("wrong");
		} else {
			$img.css("display", "block").attr('src', 'img/incorrect.png');
			$(this).addClass("wrong");
		}
	});

	$("#capture-input").on("change keyup blur", function() {
		var $img = $(".check img", this.parentNode.parentNode);
		if (this.value.length > 3) {
			$img.css("display", "block").attr('src', 'img/complete.png');
			$(this).removeClass("wrong");
		} else {
			$img.css("display", "block").attr('src', 'img/incorrect.png');
			$(this).addClass("wrong");
		}
	});

	$('#register input').bind('keydown', function(e) {
   		 if (e.keyCode == 13) {
			 e.preventDefault();
		 }
	});

})();