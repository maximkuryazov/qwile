define(["backbone", "socketio"], function (Backbone, io) {

	(function (Qwile) {

		// TODO: check if we on HTTP or HTTPS mode to change the link!

		var socket = io(location.protocol + "//" + document.domain, { secure: true });
		socket.on("connect", function () {
			console.log("Socket connected.");
		});

		Qwile.app.View = Backbone.View.extend({

			initialize: function (options) {

				this.options = options;
				this.el = document.createElement("div");
				this.cache = {

					shown: false,

					top: 0,
					left: 0,
					width: 0,
					height: 0

				};

				this.fullScreenCache = {

					shown: false,

					top: 0,
					left: 0,
					width: 0,
					height: 0

				};

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

				var self = this;
				var taskTemplate = _.template($("#task-view").html());
				$("footer").prepend(taskTemplate(this.model.toJSON()));
				this.$tab = $('.task[data-app-name="' + this.model.get("name") + '"]');
				this.$tab.on("click", _.bind(_.throttle(self.switchroll, 500), self));
				this.$tab.on("dblclick", function (event) {
					event.stopImmediatePropagation();
				});
                this.$tab.find(".close").on({

                    click: _.bind(this.close, this),
                    mousedown: function (event) {
                        event.stopPropagation();
                    }

                });

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
						iframe.height($(ui.helper).find(".content").outerHeight() - 6);

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

				Qwile.processes.remove(this.model);
				console.log(Qwile.processes.toJSON());

				event.stopPropagation();

			},

			run: function (properties) {

				var $window = this.$window;
				$window.animate({

					transform: "scale(1)",
					opacity: 1

				}, "slow", function () {
					$("iframe", $window).height($window.find(".content").outerHeight() - 6);
				}).css({
					
					top:    properties.top + "px",
					left:   properties.left + "px",
					width:  properties.width ? properties.width + "px" : undefined,
					height: properties.height ? properties.height + "px" : undefined,
					minWidth: (properties.minWidth || 0) + "px",
					minHeight: (properties.minHeight || 0) + "px"

				});

				var tabTitle = this.model.get("name");
				Tipped.create(this.$tab, function(element) {
					return '<span class="tooptip-text">Hide and show ' +  tabTitle + '</span>';
				}, {
					position: "top"
				});

				this.$tab.show("slow").parent().sortable({
					stop: _.bind(function () {
						this.$tab.beingSortable = true;
					}, this)
				});

				Qwile.processes.add(this.model);
				this.cache.shown = true;
				this.activate();

				console.log(Qwile.processes.toJSON());
				console.log(this.model.view);

			},
			
			hidedown: function () {

				// this.sendPopup();

				var $window = this.$window;
				var cache = this.cache;

				if (!$window.prop("animated")) {

					cache.height = $window.height();
					cache.width = $window.width();
					cache.left = $window.offset().left;
					cache.top = $window.offset().top

					$window.prop("animated", true).animate({

						width: 0,
						height: 0,
						left: $('.task[data-app-name="' + $window.data("app-name") + '"]').offset().left + 'px',
						top: ($(document.body).height() - 0 + "px"),
						opacity: 0

					}, "fast", function () {
						$window.prop("animated", false)
					});

					delete cache.shown;

				}
				
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
					this.activate();

				}
				
			},

			switchroll: function (event) {

				if (this.$tab.beingSortable) {

					delete this.$tab.beingSortable;
					return false;

				}

				if (this.cache.shown) {

					if (this.isActive) {

						this.hidedown();
						this.cache.shown = false;

					} else {
						this.activate();
					}

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

				function changeIdrameHeight () {
					$("iframe", $window).height($window.find(".content").outerHeight() - 6);
				}

				$window.animate({

					top: "50px",
					height: ($(document.body).height() - 87 + "px"),
					width: "100%",
					left: 0

				}, {

					complete: changeIdrameHeight,
					progress: changeIdrameHeight,
					duration: "fast"

				});

				delete cachefull.shown;
				$window.draggable("disable").resizable("disable").find("td.title").css("cursor", "default");

			},
			
			minimize: function () {

				var $window = this.$window;
				var cachefull = this.fullScreenCache;

				function changeIframeHeight () {
					$("iframe", $window).height($window.find(".content").outerHeight() - 6);
				}

				$window.animate({

					width: cachefull.width + "px",
					height: cachefull.height + "px",
					left: cachefull.left + "px",
					top: cachefull.top + "px",
					opacity: 1

				}, {

					complete: changeIframeHeight,
					progress: changeIframeHeight,
					duration: "fast"

				});

				cachefull.shown = true;
				$window.draggable("enable").resizable("enable").find("td.title").css("cursor", "move");

			},
			
			activate: function () {

				_.each(Qwile.processes.models, function (model) {

					var view = model.view;
					if (view.isActive) view.deactivate();

				}, this);
				
				this.isActive = true;
				this.$window.addClass("active").removeClass("inactive").find(".window-block").hide();
				this.$tab.addClass("active");
				
			},
			
			deactivate: function () {
				
				this.isActive = false;
				var $frame = this.$window.find("iframe");
				this.$window.removeClass("active").addClass("inactive");
				this.$window.find(".window-block").show().css("height", $frame.outerHeight());
				this.$tab.removeClass("active");

			},

			isActive: false,

			sendPopup: function () {

				// EXAMPLE.

				this.model.trigger("push", {

					model: new Qwile.popup.Model({

						picture: "image.jpg",
						title: this.model.get("name"),
						message: "You hide the app."

					}),
					method: "showWithBlink",
					arguments: [3000, 800]

				});

			}

		});

		Qwile.app.Model = Backbone.Model.extend({});
		Qwile.processes = new Backbone.Collection;
		Qwile.app.instances = {};

		Qwile.createApp = function (name, model, position) {

			var instances = Qwile.app.instances;
			instances[name] = {};
			instances[name].model = new Qwile.app.Model(model);

			instances[name].view = new Qwile.app.View({

				template: "#default-app-view-template",
				container: ".wrapper",
				model: instances[name].model

			});
			instances[name].model.view = instances[name].view;
			instances[name].view.run(position);

		};

		Qwile.openApp = function (name, id, options) {
			$.get("/app/get", "id=" + id, function (response) {
				if (response.success) {

					var model = response.data;
					model.id = model._id;
					Qwile.createApp(name, model, options);

				}
			});
		}

	})(window.Qwile);

});