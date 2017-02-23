/**
 * Created by User on 2/23/2017.
 */

define(["backbone"], function (Backbone) {

	Qwile.popup = {};
	Qwile.popup.View = Backbone.View.extend({

		initialize: function (options) {

			this.options = options;
			this.el = document.createElement("div");
			this.options.model.view = this;
			this.render();

		},

		render: function () {

			var template = _.template($("#popup-view").html());
			this.$el.html(template(this.options.model.toJSON()));

			this.$el.appendTo(".wrapper");
			this.$popup = this.$el.find(".desktop-notification");

		},

		events: {

			"click .close":   "remove",
			"click .content": "goToApp"

		},

		show: function () {

			_.each(Qwile.popup.currentPopups.models, function (model) {

				// destroy all previous popups or shift them up
				model.view.remove();

			}, this);

 			this.$popup.animate({ bottom: 40 }, "slow", _.bind(function () {

				var sound = new Howl({
					src: ["sounds/message.mp3"]
				});
				if (Qwile.settings.sound) sound.play();

				$(this).css("z-index", "1001");

				Qwile.popup.currentPopups.add(this.options.model);
				console.log("CurrentPopups: ", Qwile.popup.currentPopups);

			}, this));

		},

		remove: function () {

			this.$popup.animate({
				transform: "skewX(-85deg) scale(.1)"
			}, _.bind(function () {

				this.$el.remove();
				Qwile.popup.currentPopups.remove(this.options.model);
				console.log("CurrentPopups: ", Qwile.popup.currentPopups);

			}, this));
			
		},

		goToApp: function () {

			this.remove();
			var sound = new Howl({
				src: ["sounds/close.mp3"]
			});
			if (Qwile.settings.sound) sound.play();

		},

		showWithRemove: function (delay) {

			this.show();
			setTimeout(_.bind(function () {
				this.remove();
			}, this), delay);

		},

		showWithBlink: function (interval, delay) {

			this.show();
			setInterval(_.bind(function () {

				var $popup = this.$popup;
				$popup.hide();
				setTimeout(function () {
					$popup.show();
				}, delay);

			}, this), interval);

		}

	});

	_.extend(Qwile.popup, Backbone.Events);

	Qwile.popup.on("push", function (options) {

		var popup = new Qwile.popup.View(options);
		popup[options.method].apply(popup, options.arguments);

	});
	Qwile.popup.Model = Backbone.Model.extend({});
	Qwile.popup.currentPopups = new Backbone.Collection;

	setTimeout(function () {

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

	}, 5000);

});