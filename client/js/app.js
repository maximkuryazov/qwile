define(["backbone"], function (Backbone) {

	(function (window) {

		window.Qwile.AppView = Backbone.View.extend({

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

			},

			events: {

				"click .close": "close",
				"click .fullscreen": "fullscreen",
				"click .hidedown": "hidedown"

			},

			close: function () {

				var $window = this.$el.find(".window");
				var appName = $window.data("app-name");

				$window.animate({

					transform: "skewX(-85deg) scale(0)",
					opacity: 0

				}, _bind(function() {
					this.remove();
				}, this));

				$('.task[data-app-name="' + appName + '"]').hide("slow", function () {
					$(this).remove();
				});

			},

			run: function () {
				this.$el.find(".window").show("slow");
			},
			
			hidedown: function () {
				
			},
			
			showup: function () {
				
			},

			fullscreen: function () {
				if (this.cachefull.shown) {

					this.minimize();
					this.cachefull.shown = false;

				} else {

					this.maximize();
					this.cachefull.shown = true;

				}
			},
			
			maximize: function () {
				alert("maximize")
			},
			
			minimize: function () {
				alert("minimize")
			},
			
			activate: function () {
				this.isActive = true;
			},
			
			deactivate: function () {
				this.isActive = false;
			},

			isActive: false,

			cache: {

				shown: false,

				top: 0,
				left: 0,
				width: 0,
				height: 0

			},

			cachefull: {

				shown: false,

				top: 0,
				left: 0,
				width: 0,
				height: 0

			},

			tab: $(".task[data-app-name]")

		});

		window.Qwile.AppModel = Backbone.Model.extend({});

		var conductor = new Qwile.AppView({

			template: "#default-app-view-template",
			container: ".wrapper",

			model: (new Qwile.AppModel({

				name: "conductor",
				icon: "conductor.png"

			}))

		});
		conductor.run();

	})(window);

});