$(window).ready(function() {

	var scaleAnimateTime 	= 0;  		// 1000
	var loadingAnimateTime 	= 0; 		// 5000
	var logoAnimateTime 	= 0;		// 1800

	Qwile.settings.sound = true;

	var inithtml = $('div#digits').html();
	var interval;

	$('.logo').animate({ transform: 'scale(1)' }, scaleAnimateTime, function() {

		$("#logo-stereo").animate({ height: "366px" }, {
			duration: loadingAnimateTime,
			easing: "swing",
			start: function() {

				interval = setInterval(function() {
					var html = $('div#digits').html();
					$('div#digits').html(html != 'Loading...' ? html + '.' : inithtml);
				}, 500);

			},

			complete: function() {

				clearInterval(interval);
				$('div#digits').remove();
				$('#untitled').animate({ opacity: 1 }, logoAnimateTime, function() {

					$("#logo-stereo").animate({ opacity: 0.5 }, 0, 1200);
					$("#untitled").animate({ opacity: 0.7 }, 0, 1200, function() {

						$('#toppanel').animate({ top: '0px' }, 'slow');
						$('footer').animate({ bottom: '0px' }, 'slow', function() {

							$('.window, .widget').fadeIn('slow');
							$('#leftpanel').animate({ left: 0 }, 'slow');
							$('#profile').animate({ right: 0 }, 'slow', function() {

								var options = {

									model: new Qwile.popup.Model({

										picture: "image.jpg",
										title: "Alina Solopova",
										message: "had shared a private folder with you."

									}),
									method: "showWithBlink",
									arguments: [3000, 800]

								};
								Qwile.popup.trigger("push", options);

							});

						});

						/* ************ loading complete, handlers starts *********** */

						var time = 200;
						var hideLeftPanel = _.debounce(function () {
							if ($("#widget_select").is(":hidden")) {
								$(this).stop().animate({ left: -$(this).width() + "px"}, 'fast');
							}
						}, time);

						var showLeftPanel = _.debounce(function() {
							$(this).stop().animate({ left: 0 }, 'fast');
						}, time);

						$('#leftpanel').mouseleave(hideLeftPanel).mouseover(showLeftPanel);

						$('.widget .close').click(function() {
							$(this).parents('.widget').fadeOut();
						});

						$('.widget').draggable({
							containment: "parent",
							handle: ".content"
						}).on("tap mouseover", function() {
							if ($(".buttons", this).css("opacity") == 0) {
								$(".buttons", this).stop().css("visibility", "visible").animate({ opacity: 1 }, 'slow');
							}
						}).mouseleave(function() {
							$(".buttons", this).animate({ opacity: 0 }, 'fast', function() {
								$(this).css("visibility", "hidden");
							});
						});

						$('#quit').click(function() {
							$('#cover').show();
						});

						$('#photo').click(function() {
							var isVisible = $('#profile').css("right") == '0px';
							$('#profile').css("left", "auto").animate({
								right: isVisible ? -$('#profile').width() : 0
							});
						});

						$("#profile .header").each(function(i) {
							$(this).click(function() {
								if (!$(this).hasClass("profile-opened-header")) {
									$("#profile .header").removeClass("profile-opened-header");
									$(this).addClass("profile-opened-header");
									$("#profile .area.open").slideUp(0, function () {
										$(this).removeClass("open");
									});
									$("#profile .area").eq(i).slideDown(0, function () {
										$(this).addClass("open").find("div").hide().slideDown("slow");
									});
								}
							});
						});

						$("#profile .area td:not(.photo)").delegate("div", "click", function () {
							var value = prompt("Enter a new value: ");
							$(".value", this).text(value);
						});

						$("#profile .profile-photo").on("click tap", function() {
							$("#profile-photo-uploader").click();
						});

						$("#profile").resizable({
							
							handles: "w",
							minWidth: 200,
							maxWidth: 400
							
						});

						$('body').mousedown(function(e) {
							if ($(e.target).is(":not(.window *, .task, .task *)")) {

								_.each(Qwile.processes.models, function (model) {

									var view = model.view;
									if (view.isActive && !view.fullScreenCache.shown) {
										view.deactivate();
									}

								}, this);

							}
						});

						/* Exit modal */

						$('#quit').click(function() {
							$('#shadow').fadeIn('fast');
						});

						$('#shadow').click(function(e) {
							$(this).fadeOut('fast');
							e.stopImmediatePropagation();
						});

						$(".dialog-content").click(function(e) {
							e.stopPropagation();
						});

						$(".dialog-content .dialog-close, .dialog-content .cancel, .dialog-content .exit").click(function() {
							$('#shadow').fadeOut('fast');
						});

						$(".dialog-content .exit").click(function() {
							$.ajax({
								method: "GET",
								url: "/user/logout",
								crossDomain: true,
								dataType: "json"
							}).done(function(data) {
								if (data.success) {

									var sound = new Howl({
										src: ['sounds/logout.mp3']
									});
									if (Qwile.settings.sound) sound.play();
									$(document.body).fadeOut(1000, function() {
										window.location.href = '/';
									});

								}
							});
						});

						/* Exit modal ends */

						Tipped.create('#quit', function(element) {
							return '<span class="tooptip-text">Quit</span>';
						}, { position: 'bottom' });

						Tipped.create('#announce', function(element) {
							return '<span class="tooptip-text">Announcements</span>';
						}, { position: 'bottom' });

						Tipped.create('#photo', function(element) {
							return '<span class="tooptip-text">View profile</span>';
						}, { position: 'bottom' });

						Tipped.create('#settings', function(element) {
							return '<span class="tooptip-text">Open settings</span>';
						}, { position: 'bottom' });

						Tipped.create('#start', function(element) {
							return '<span class="tooptip-text">Qwile basic menu is here</span>';
						}, { position: 'bottom' });
						
						setTimeout(function(){
							$('#start').mouseover();
						}, 1000);

						$("#leftpanel tr").each(function() {
							
							var title = $(this).attr('title');
							Tipped.create(this, function(element) {
								return '<span class="tooptip-text">' + title + '</span>';
							}, { position: 'right', skin: 'blue', showDelay: 1000 });
							
						});

						var $soundTab = $("aside#leftpanel .sound");
						$soundTab.on("click tap", function() {

							$(this).toggleClass("disabled");
							Qwile.settings.sound = !$(this).hasClass("disabled");
							if (Qwile.settings.sound) {
								var soundsOnSound = new Howl({
									src: ['sounds/unmute.mp3']
								});
								soundsOnSound.play();
							}

						});
						if (!Qwile.settings.sound) $soundTab.addClass("disabled");

					});

				});
			}
		});
	});

	/*************** test.js *********************** */

	var bool = true;

	function hideStartMenu() {
		$("#menu").animate({
			top: '-100%',
			left: '-100%',
			opacity: 0
		}, "slow");
		document.getElementById('widget_select').style.display = 'none';
		bool = true;
	}

	document.getElementById('start').onclick = function(e) {
		e.stopPropagation();
		if(bool) {
			$("#menu").animate({
				top: '50px',
				left: 0,
				opacity: 1
			}, "slow");
			document.getElementById('widget_select').style.display = 'none';
			bool = false;
		} else {
			hideStartMenu();
		}
	}

	$("#toppanel, footer").click(hideStartMenu);

	document.getElementsByClassName('add-widget')[0].onclick = function() {
		if (!$("#widget_select").is(":hidden")) {
			$("#widget_select").fadeOut("slow");
		} else {
			$("#widget_select").fadeIn("slow");
			document.getElementById('widget_select').style.display = 'table';
		}
	}

	$("#widget_select").click(function() {
		$(this).fadeOut("slow", function() {
			$('#leftpanel').mouseleave();
		});
	});
	$("#widget_select_inside").click(function(e) { e.stopPropagation(); });

	// NEED REFACTOR!!!!!!!!!!

	$(".widgets_list div.img").click(function() {
		$('.widget.' + $(this).data("name")).show();
	});

	/* *********************** test.js end ********************** */

});