/**
 * Created by User on 2/23/2017.
 */

define(["backbone"], function (Backbone) {

	Qwile.popup = Backbone.View.extend({

		initialize: function (options) {

			this.options = options;
			this.el = document.createElement("div");
			this.render();

		},

		render: function () {

			var template = _.template($("#popup-view").html());
			this.$el.html(template(this.options));

			this.$el.appendTo(".wrapper");
			this.$popup = this.$el.find(".desktop-notification");

		},

		events: {

			"click .close":   "remove",
			"click .content": "gotToApp"

		},

		show: function () {

 			this.$popup.animate({ bottom: 40 }, "slow", function () {

				var sound = new Howl({
					src: ["sounds/message.mp3"]
				});
				if (Qwile.settings.sound) sound.play();
				$(this).css("z-index", "1001");

			});

		},

		remove: function () {

			this.$popup.animate({
				transform: 'skewX(-85deg) scale(.1)'
			}, _.bind(function () {
				this.$el.remove();
			}, this));
			
		},

		gotToApp: function () {

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

		},

	});

	var settings = {

		picture: "image.jpg",
		title: "Alina Solopova",
		message: "had shared a private folder with you."

	};

	setTimeout(function () {

		// everything is loaded on desktop

		var popup = new Qwile.popup(settings);
		popup.show(3000, 800);

	}, 5000);

});