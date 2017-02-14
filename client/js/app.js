define(["jquery-ui", "underscore", "backbone", "jquery-transform"], function ($, _, Backbone) {

	(function (window) {

		window.Qwile.AppView = Backbone.View.extend({

			el: document.createElement("div"),

			initialize: function (options) {

				this.options = options;
				_.bindAll(this, this.render);
				this.model.bind("change", this.render);
				this.render();

			},

			render: function () {

				var template = _.template($(this.options.template).html(), this.model.toJSON());
				this.$el.html(template);
				this.$el.appendTo(this.options.container);

			},

			events: {

				"click .close": "close"

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

			}

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

	})(window);

});