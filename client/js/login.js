(function() {

    Waves.attach('.button');
    Waves.init();
    Waves.displayEffect();

	// this file needs serious refactor! :)

	var Blue = '#0287a9';
	var time = 700;

	$.ajaxSetup({
		xhrFields: {
			withCredentials: true
		}
	});

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
	<form id="restore-form"><input name="email" id="restore-input" onclick="event.stopPropagation()" type="text" placeholder="Type your E-Mail address here"></input><button onclick="event.stopPropagation()" class="btn btn-info waves-effect" type="submit" id="restore-button">Restore</button></form></div></div>';
	$('#forgot').tooltip().click(function() {

		$(restoreHTML).appendTo('body').fadeIn();
		$('#restore-input').tooltip().focus(function() {
			$(this).css('text-align', 'left').attr('placeholder', '');
		});

		function showModal (message, color) {

			$('.modal-body').css({ 'font-size': '12px', 'color': color }).html(message);
			$('.modal').modal('show');
			setTimeout(function() {
				$('.modal').modal('hide');
			}, 2500);

		}

		function closeShadow () {

			$('.shadow').fadeOut(function() {
				$(this).remove();
			});
			showModal('Instructions were sent to your E-Mail.', Blue);
			return false;

		}

		$("#restore-form").submit(function() {

			$.ajax({
				url: "/user/restore",
				data: $(this).formSerialize(),
				method: "POST",
				dataType: 'json',
				crossDomain: true,
				success: function (data) {
					if (data.success) {
						closeShadow();
					} else {
						showModal(data.error, "#970101");
					}
				}
			});
			return false;

		});

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
	
	$('form#login').submit(function() {

		$.removeCookie("remember");
		$.ajax({
			url: "/user/login",
			data: $(this).formSerialize(),
			method: "POST",
			dataType: 'json',
			xhrFields: {
				withCredentials: true
			},
			crossDomain: true,
			success: function (data) {
				if(data.success) {

					$('#circle').stop().css("transform", "rotate(0deg)").animate({
						transform: 'rotate(360deg) scale(0)'
					}, time, function() {
						$('.bubble-toggle').click();
						// location.href = '/desktop';
						var state = { state: "" };
						window.history.pushState(state, "Desktop", "desktop", true);
						// no longer need, because now you can type /desktop in URL
						// window.history.back();
					});

					if (data.remember) {
						var credentials = JSON.parse($.cookie("remember"));
						// credentials.email
						// credentials.password - already hashed
					}
					
				} else {

					var message = data.activated ? 'Incorrect password or E-Mail address.' : "Your account hasn't been activated yet."
					$('.modal-body').css({ 'font-size': '12px', 'color': '#970101' }).html(message);
					$('.modal').modal('show');
					setTimeout(function() {
						$('.modal').modal('hide');
					}, 2500);
					
				}
			},
			error: function (xhr, status, error) {
				console.error(error);
			}
		});
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
		//$captcha.attr("src", "http://" + document.domain + ":" + Qwile.serverPort + "/captcha?cache=" + Math.random());
		$captcha.attr("src", "/captcha?cache=" + Math.random());
	}
	initCaptcha();
	$captcha.click(function() {
		initCaptcha();
	});

	$("form#register").submit(function() {

		if ($("#register img[src='img/incorrect.png']:visible").length == 0 && $("#register img[src='img/complete.png']:visible").length == 4) {

			$.ajax({
				url: "/user/new",
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

	$("#email-input").keydown(function(event) {
		if (event.which == 32) {
			event.stopImmediatePropagation();
			return false;
		}
	}).on("change keyup blur", function() {

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

	$("#password-input").keydown(function(event) {
		if (event.which == 32) {
			event.stopImmediatePropagation();
			return false;
		}
	}).on("change keyup blur", function() {

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

	$("#confirm-password-input").keydown(function(event) {
		if (event.which == 32) {
			event.stopImmediatePropagation();
			return false;
		}
	}).on("change keyup blur", function() {

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
	/* They still use waves.js 2 years old. I've finally dropped waves.js from my package and replace it with this code, shorter and stable -
    $(document).on('click', '.waves-effect', function(e){

        var ink, d, x, y;

        if ($(this).find(".ink").length === 0)
        {
            $(this).prepend("<span class='ink'></span>");
        }

        ink = $(this).find(".ink");
        ink.removeClass("animate");

        if (!ink.height() && !ink.width())
        {
            d = Math.max($(this).outerWidth(), $(this).outerHeight());
            ink.css({height: d, width: d});
        }

        x = e.pageX - $(this).offset().left - ink.width()/2;
        y = e.pageY - $(this).offset().top - ink.height()/2;

        ink.css({top: y+'px', left: x+'px'}).addClass("animate");
    });
	*/
})();