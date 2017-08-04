$(window).ready(function() {

	var debugMode = false;

	if (debugMode) {

		var scaleAnimateTime 	= 0;  		// 1000
		var loadingAnimateTime 	= 0; 		// 5000
		var logoAnimateTime 	= 0;		// 1800

	} else {

		var scaleAnimateTime 	= 1000;
		var loadingAnimateTime 	= 5000;
		var logoAnimateTime 	= 1800;

	}

	Qwile.settings.sound = checkSound();

	function checkSound () {

		var sound = false;
		$.ajax({

			url: "/user/settings/sound",
			async: false,
			success: function (data) {
				sound = data.sound;
			}

		});
		return sound;

	}

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
							$('#profile').animate({ left: $(document.body).width()  - $('#profile').width() }, 'slow', function() {

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

								Qwile.openApp("Player", "58ab1532d3c4b878ce485a31", {

									left: 480,
									top: 200,
									minWidth: 520,
									minHeight: 329

								});

								Qwile.openApp("Conductor", "58ab1513d3c4b878ce485a22", {

									left: 180,
									top: 100,
									width: 800

								});

								Qwile.initInstalledWidgets();

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

						$('#quit').click(function() {
							$('#cover').show();
						});

						var isProfileVisible = true;
						$('#photo').click(function() {
							$('#profile').animate({
								left: isProfileVisible ? $(document.body).width() : $(document.body).width() - $('#profile').width()
							});
							isProfileVisible = !isProfileVisible;
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
										$(this).find("td.photo").hide().slideDown("slow");
									});
								}
							});
						});

						$("#profile .area td:not(.photo)").delegate(".profile-row", "click", function () {
							
							var self = this;
							$("#shadow").fadeIn("fast", function() {
								
								var value = prompt("Enter a new value: ", $(self).find(".value").text());
								if (value) {
									$.post("/user/set", { 
										
										field: $("span.name", self).text().replace(/:/g, "").toLowerCase(),
										value: value
										
									}, function (data) {
										
										if (data.success) {
											$(".value", self).text(value);
										} else {
											console.log("Error: ", data.error);
										}
										$("#shadow").fadeOut("fast");

									});
								}
								
							});
						});

						$("#profile .profile-photo").on("click tap", function() {
							$("#profile-photo-uploader").click();
						});
						$("#profile-photo-uploader").change(function() {
							$("form#upload-photo").ajaxSubmit({
								success: function (json) {

									json = JSON.parse(json);
									if (json.success) {
										$("aside#profile .photo .profile-photo")
											//.css("background", "url('/user/getPhoto?cache=" + Math.random() + "') no-repeat");
											.attr("src", "/user/getPhoto?cache=" + Math.random());
										$("#photo div").css("background-image", "url('/user/getPhotoIcon?cache=" + Math.random() + "')");
									}

								},
								error: function (xhr, error) {

									console.error("Error: ", error);
									try {

										var json = JSON.parse(xhr.responseText);
										alert(json.error);

									} catch (error) {
										console.error("Error: ", error);
									}

								}
							});
						});

						$("#profile").resizable({
							
							handles: "w",
							minWidth: 215,
							maxWidth: 400
							
						}).on("resize", function(event, ui) {
							$("aside#profile .area td .value").css("max-width", $(ui.helper).width() - 120 + "px");
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
							$("#shadow .dialog-content").show();
						});

						$('#shadow').click(function(e) {
							$(this).fadeOut('fast');
							$("#shadow .dialog-content").hide();
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

						$('#settings').click(function() {
							$('#shadow').fadeIn('fast');
						});

						$('#announce .glyphicon').click(function() {
							$('#shadow').fadeIn('fast');
							$(this).parent().find("span.new").hide();
						});

						Tipped.create('#quit', function(element) {
							return '<span class="tooptip-text">Quit</span>';
						}, { position: 'bottom' });

						Tipped.create('#announce', function(element) {
							return '<span class="tooptip-text">Announcements</span>';
						}, { position: 'bottom' });

						Tipped.create('#friends', function(element) {
							return '<span class="tooptip-text">Friends</span>';
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

						$("tr.area .profile-row").each(function() {

							Tipped.create(this, function() {
								return '<span class="tooptip-text">Click to edit your information</span>';
							}, { position: "left" });

						});

						var $soundTab = $("aside#leftpanel .sound");
						$soundTab.on("click tap", function() {

							$(this).toggleClass("disabled");

							Qwile.settings.sound = !$(this).hasClass("disabled");
							$.get("/user/settings/sound", { set: Qwile.settings.sound });

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

	/*************** menu ajax *********************** */

	$.get("/app/get/all", function (data) {

		$("ul#apps-list").html(data);

			var switcher = true;
			$("ul#apps-list").delegate("li.added .rating", "mousedown", function () {
				$(this).css("opacity", .7);
			}).delegate("li.added .rating", "mouseup", function () {
				$(this).css("opacity", 1);
			}).delegate("li.added .rating", "click", function (event) {

				if (switcher) {

					$(this).delegate(".star", "mouseover", function () {

						var self = this;
						$(this).parent().find(".star").each(function (index) {
							if (index < $(self).index()) {
								$(this).removeClass("blank").addClass("rated filled");

							} else {
								$(this).addClass("blank").removeClass("rated filled");
							}
						});
						$(this).removeClass("blank").addClass("rated");

					});
					switcher = false;

				} else {

					switcher = true;
					$(this).undelegate(".star", "mouseover");
					$.get("/app/rate", {

						mark: $(event.target).index() + 1,
						id: $(this).parents("li").data("app-id")

					}, function (data) {
						console.log(data.rating);
					});

				}

			});

	});

	$("#menu").delegate(".switcher", "click", function () {

		var self = this;
		$.ajax({
			
			url: "/app/add",
			method: "PUT",
			data: "id=" + $(this).parents("li").data("app-id"),
			success: function(data) {
				if (data.success) {
					$(self).parents("li").addClass("added");
				}
			},
			error: function (request, status, error) {

				try {

					var data = JSON.parse(request.responseText);
					if (!data.success) {
						console.log("Error message: " + data.error);
					}

				} catch (error) {
					console.log("Error", error);
				}
			}

		});

	}).delegate("li.application", "dblclick", function () {

		Qwile.openApp($(this).find(".name").text(), $(this).data("app-id"), {

			left: 480,
			top: 200

		});
	});

	$(".regular").slick({

		dots: false,
		infinite: true,
		slidesToShow: 4,
		slidesToScroll: 1

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
			$(window).resize();	// Styles init for slick
		}
	}

	$("#widget_select").click(function() {
		$(this).fadeOut("slow", function() {
			$('#leftpanel').mouseleave();
		});
	});
	$("#widget_select_inside").click(function(e) { e.stopPropagation(); });

	// NEED REFACTOR!!!!!!!!!!

	$(".widgets_list div.img").click(function(event) {
		$.ajax({

			url: "/widget/install",
			method: "PUT",
			data: { id: $(this).parent().data("id") },

			success: _.bind(function (response) {
				if (response.success) {

					var mark = document.createElement("div");
					mark.className = "mark";
					mark.style.display = "none";
					$(this).append(mark);
					$(this).find(".mark").show("slow");

					Qwile.renderInstalledWidget(response.widget);

				}
			}, event.target),

			error: function (xhr, status, error) {

			}

		});
	});

	/* *********************** test.js end ********************** */

});