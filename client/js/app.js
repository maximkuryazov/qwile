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

				}, _.bind(function() {
					this.remove();
				}, this));

				$('.task[data-app-name="' + appName + '"]').hide("slow", function () {
					$(this).remove();
				});

				Qwile.apps.remove(this.model);
				console.log(Qwile.apps.toJSON());

			},

			run: function () {

				this.$el.find(".window").animate({

					transform: "scale(1)",
					opacity: 1

				}, "slow");

				Qwile.apps.add(this.model);
				console.log(Qwile.apps.toJSON());
				console.log(this.model.view);

			},
			
			hidedown: function () {
				
			},
			
			showup: function () {
				
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

			fullScreenCache: {

				shown: false,

				top: 0,
				left: 0,
				width: 0,
				height: 0

			},

			tab: $(".task[data-app-name]")

		});

		Qwile.app.Model = Backbone.Model.extend({});
		Qwile.apps = new Backbone.Collection;

		var conductor = {};
		conductor.model = new Qwile.app.Model({

			id: 0,
			name: "conductor",
			icon: "conductor.png",
			description: "",
			developer: "",
			rating: 5

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