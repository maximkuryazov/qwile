$(window).ready(function() {

	var scaleAnimateTime 	= 0;  		// 1000
	var loadingAnimateTime 	= 0; 		// 5000
	var logoAnimateTime 	= 0;			// 1800

	var SOUND = true;

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
								$('.desktop-notification').animate({ bottom: 40 }, 'slow', function() {

									var sound = new Howl({
										src: ['sounds/message.mp3']
									});
									if (SOUND) sound.play();

								});
							});

							// here window is already loaded

							// alert($(".window .content").outerHeight());
							$('.window iframe').css({
								// height: "210px",
								height: $(".window .content").outerHeight() - 15 + "px",
								width: "95%"
							});

						});

						/* ************ loading complete, handlers starts *********** */

						var time = 200;
						var hideLeftPanel = _.debounce(function () {
								if ($("#widget_select").is(":hidden")) {
									$(this).stop().animate({left: -$(this).width() + "px"}, 'fast');
								}
						}, time);

						var showLeftPanel = _.debounce(function() {
							$(this).stop().animate({ left: 0 }, 'fast');
						}, time);

						$('#leftpanel').mouseleave(hideLeftPanel).mouseover(showLeftPanel);

						function hideNotification() {
							$('.desktop-notification').animate({
								transform: 'skewX(-85deg) scale(.1)'
							}, function() {
								$(this).hide();
							});
						}

						$('.desktop-notification .close').click(hideNotification);

						$(".desktop-notification .content").click(function() {

							hideNotification();
							var sound = new Howl({
								src: ['sounds/close.mp3']
							});
							if (SOUND) sound.play();

						});

						$('.window .close, .task .close').click(function() {

							var appName = $(this).parents("[data-app-name]").data("app-name");
							$('.window[data-app-name="' + appName + '"]').animate({
								transform: 'skewX(-85deg) scale(0)',
								opacity: 0
							}, function() {
								$(this).hide();
							});
							$('.task[data-app-name="' + appName + '"]').hide('slow');

						});

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

						$('.window').each(function() {
							$(this).prop("cachefull", {
								shown: true
							});
						});

						$('.window .fullscreen').click(function() {

							var $window = $(this).parents(".window");
							var cachefull = $window.prop("cachefull");

							if (cachefull.shown) {

								cachefull.height = $window.height();
								cachefull.width = $window.width();
								cachefull.left = $window.offset().left,
								cachefull.top = $window.offset().top

								$window.animate({
									top: '50px',
									height: ($(document.body).height() - 87 + 'px'),
									width: '100%',
									left: 0
								}, {
									complete: function() {
										$("iframe", $window).height($window.find(".content").outerHeight() - 15);
									},
									duration: 'fast'
								});

								delete cachefull.shown;
								$window.prop('fullscreen', true).draggable('disable').resizable('disable').find("td.title").css("cursor", "default");

							} else {

								$window.animate({

									width: cachefull.width + 'px',
									height: cachefull.height + 'px',
									left: cachefull.left + 'px',
									top: cachefull.top + 'px',
									opacity: 1

								}, {
									complete: function() {
										$("iframe", $window).height($window.find(".content").outerHeight() - 15);
									},
									duration: 'fast'
								});

								cachefull.shown = true;
								$window.prop('fullscreen', false).draggable('enable').resizable('enable').find("td.title").css("cursor", "move");;

							}

						});

						$('.window').each(function() {
							$(this).prop("cache", {
								shown: true
							});
						});

						$('.window .hidedown').click(function() {

							var $window = $(this).parents(".window");
							var cache = $window.prop("cache");

								cache.height = $window.height();
								cache.width = $window.width();
								cache.left = $window.offset().left,
								cache.top = $window.offset().top

							$window.animate({
									width: '0px',
									height: '0px',
									left: $('.task[data-app-name="' + $window.data("app-name") + '"]').offset().left + 'px',
									top: ($(document.body).height() - 0 + 'px'),
									opacity: 0
								}, 'fast');

								delete cache.shown;

						});

						function makeWindowActive () {

							$('.window').not(this).removeClass("active").css({ "z-index": 2, opacity: 0.8 }).find(".window-block").show();
							$(this).addClass("active");
							$(this).find(".window-block").hide();

						}

						$('.window').mousedown(makeWindowActive);

						$('body').mousedown(function(e) {
							if ($(e.target).is(":not(.window *, .task *)") && !$('.window').prop('fullscreen')) {
								$('.window').css('opacity', 0.8).removeClass("active");
								$('.window').find(".window-block").show().css("height", $(".window iframe").outerHeight());
							}
						});

						$('.window').draggable({

							handle: '.title',
							containment: [0, $("#toppanel").height(), $(window).width() - 100, $(window).height() - $("footer").height() - $(".window .top").height()],
							start: function( event, ui ) {
								$(ui.helper).find(".inside .window-block").show();
							},
							stop: function( event, ui ) {
								$(ui.helper).find(".inside .window-block").hide();
							}

						}).resizable({

							handles: "n, e, s, w, se, ne, sw, nw",
							// minWidth: 250,
							// minHeight: 206,
							// верхние по дефолту, но в случае кондуктора это должно настраиваться!
							// резайз лагает если уменьшить величины, из-за того что .block заслонка эта сверху врейма фиксированной высоты
							minWidth: 520,
							minHeight: 265,
							start: function(event, ui) {
								$(ui.helper).find(".inside .window-block").show();
							},
							stop: function(event, ui) {
								$(ui.helper).find(".inside .window-block").hide();
							},
							resize: function(event, ui) {
								var iframe = $("iframe", ui.helper);
								$(ui.helper).find(".inside .window-block").css({
									height: iframe.height() + "px"
								});
								iframe.height($(ui.helper).find(".content").outerHeight() - 15);
							}

						});

						$('.task').click(function() {

							var appName = $(this).data("app-name");
							var $window = $('.window[data-app-name="' + appName + '"]');
							var cache = $window.prop("cache");

							if (cache.shown) {
								if ($window.hasClass("active")) {

									cache.height = $window.height();
									cache.width = $window.width();
									cache.left = $window.offset().left;
									cache.top = $window.offset().top;

									if (!$window.prop("animated")) {
										$window.prop("animated", true).animate({

											width: '0px',
											height: '0px',
											left: $(this).offset().left + "px",
											top: ($(document.body).height() - 0 + 'px'),
											opacity: 0

										}, 'fast', function() {
											$window.prop("animated", false);
										});
										delete cache.shown;
									}

								} else {
									makeWindowActive.call($window);
								}
							} else {

								if (!$window.prop("animated")) {

									$window.prop("animated", true).animate({

										width: cache.width + 'px',
										height: cache.height + 'px',
										left: cache.left + 'px',
										top: cache.top + 'px',
										opacity: 1

									}, 'fast', function() {
										$window.prop("animated", false)
									});

									cache.shown = true;

								}

							}

						}).mousedown(function() {
							$('.window[data-app-name="' + $(this).data("app-name") + '"]').css('opacity', 1);
						}).parent().sortable();

						$('#photo').click(function() {
							var isVisible = $('#profile').css("right") != '-200px';
							$('#profile').animate({ right: isVisible ? -200 : 0 });
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

						$("#profile .profile-photo").on("click tap", function() {
							$("#profile-photo-uploader").click();
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
									if (SOUND) sound.play();
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

						$(".task").each(function() {
							var title = $(this).find('.title').text();
							Tipped.create(this, function(element) {
								return '<span class="tooptip-text">Hide and show ' + title + '</span>';
							}, { position: 'top', skin: 'blue' });
						});

						var $soundTab = $("aside#leftpanel .sound");
						$soundTab.on("click tap", function() {
							$(this).toggleClass("disabled");
							SOUND = !$(this).hasClass("disabled");
						});
						if (!SOUND) $soundTab.addClass("disabled");

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
