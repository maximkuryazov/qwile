define(["backbone"], function (Backbone) {

	(function (Qwile) {

		Qwile.app.View = Backbone.View.extend({

			el: document.createElement("div"),

			initialize: function (options) {

				this.options = options;
				_.bindAll(this, "render");
				this.model.bind("change", this.render);
				this.render();
			},

			render: function () {

				var template = _.template($(this.options.template).html());
				this.$el.html(template(this.model.toJSON()));
				this.$el.appendTo($(this.options.container));
				this.$window = this.$el.find(".window");
				this.uiSet();

				var taskTemplate = _.template($("#task-view").html());
				$("footer").prepend(taskTemplate(this.model.toJSON()));
				this.$tab = $('.task[data-app-name="' + this.model.get("name") + '"]');
				this.$tab.on("click", _.bind(this.switchroll, this));
				this.$tab.find(".close").on("click", _.bind(this.close, this));

			},

			events: {

				"click .close":         "close",
				"click .fullscreen":    "fullscreen",
				"click .hidedown":      "hidedown",
				"mousedown .window":    "activate",
				"dblclick td.title":    "fullscreen"

			},

			uiSet: function () {

				this.$window.draggable({

					handle: '.title',
					containment: [0, $("#toppanel").height(), $(window).width() - 100, $(window).height() - $("footer").height() - this.$window.find(".top").height()],
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
					// ресайз лагает если уменьшить величины, из-за того что .block - заслонка эта сверху фрейма фиксированной высоты
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

			},

			close: function (event) {

				var $window = this.$el.find(".window");
				var appName = $window.data("app-name");

				$window.animate({

					transform: "skewX(-85deg) scale(0)",
					opacity: 0

				}, _.bind(function() {
					this.remove();
				}, this));

				$('.task[data-app-name="' + appName + '"]').hide("slow", function () {
					$(this).remove();
				});

				Qwile.apps.remove(this.model);
				console.log(Qwile.apps.toJSON());

				event.stopPropagation();

			},

			run: function () {

				this.$el.find(".window").animate({

					transform: "scale(1)",
					opacity: 1

				}, "slow");

				this.$tab.show("slow");
				Qwile.apps.add(this.model);
				this.cache.shown = true;

				console.log(Qwile.apps.toJSON());
				console.log(this.model.view);

			},
			
			hidedown: function () {

				var $window = this.$window;
				var cache = this.cache;

				cache.height = $window.height();
				cache.width = $window.width();
				cache.left = $window.offset().left;
				cache.top = $window.offset().top

				$window.animate({

					width: 0,
					height: 0,
					left: $('.task[data-app-name="' + $window.data("app-name") + '"]').offset().left + 'px',
					top: ($(document.body).height() - 0 + "px"),
					opacity: 0

				}, "fast");

				delete cache.shown;
				
			},

			showup: function () {

				var $window = this.$window;
				var cache = this.cache;
				if (!$window.prop("animated")) {

					$window.prop("animated", true).animate({

						width: cache.width + "px",
						height: cache.height + "px",
						left: cache.left + "px",
						top: cache.top + "px",
						opacity: 1

					}, "fast", function () {
						$window.prop("animated", false)
					});
					cache.shown = true;

				}
				
			},

			switchroll: function (event) {
				
				if (this.cache.shown) {

					this.hidedown();
					this.cache.shown = false;

				} else {

					this.showup();
					this.cache.shown = true;

				}
				event.stopImmediatePropagation();
				event.stopPropagation();
				
			},

			fullscreen: function () {
				if (this.fullScreenCache.shown) {

					this.minimize();
					this.fullScreenCache.shown = false;

				} else {

					this.maximize();
					this.fullScreenCache.shown = true;

				}
			},
			
			maximize: function () {

				var $window = this.$window;
				var cachefull = this.fullScreenCache;

				cachefull.height = $window.height();
				cachefull.width = $window.width();
				cachefull.left = $window.offset().left;
				cachefull.top = $window.offset().top;

				$window.animate({

					top: "50px",
					height: ($(document.body).height() - 87 + "px"),
					width: "100%",
					left: 0

				}, {

					complete: function () {
						$("iframe", $window).height($window.find(".content").outerHeight() - 15);
					},
					duration: "fast"

				});

				delete cachefull.shown;
				$window.draggable("disable").resizable("disable").find("td.title").css("cursor", "default");

			},
			
			minimize: function () {

				var $window = this.$window;
				var cachefull = this.fullScreenCache;

				$window.animate({

					width: cachefull.width + "px",
					height: cachefull.height + "px",
					left: cachefull.left + "px",
					top: cachefull.top + "px",
					opacity: 1

				}, {

					complete: function() {
						$("iframe", $window).height($window.find(".content").outerHeight() - 15);
					},
					duration: "fast"

				});

				cachefull.shown = true;
				$window.draggable("enable").resizable("enable").find("td.title").css("cursor", "move");

			},
			
			activate: function () {
				
				this.isActive = true;
				this.$window.addClass("active").find(".window-block").hide();
				
			},
			
			deactivate: function () {
				
				this.isActive = false;
				this.$window.removeClass("active").find(".window-block").show();
				
			},

			isActive: false,

			cache: {

				shown: false,

				top: 0,
				left: 0,
				width: 0,
				height: 0

			},

			fullScreenCache: {

				shown: false,

				top: 0,
				left: 0,
				width: 0,
				height: 0

			}

		});

		Qwile.app.Model = Backbone.Model.extend({});
		Qwile.apps = new Backbone.Collection;

		window.conductor = {};
		conductor.model = new Qwile.app.Model({

			id: 0,
			name: "Conductor",
			icon: "conductor.png",
			description: "Easy file manager developed for Qwile OS.",
			developer: "Qwile Inc.",
			rating: 5,
			iframe: true

		});

		conductor.view = new Qwile.app.View({

			template: "#default-app-view-template",
			container: ".wrapper",
			model: conductor.model

		});
		conductor.model.view = conductor.view;
		conductor.view.run();

	})(window.Qwile);

});