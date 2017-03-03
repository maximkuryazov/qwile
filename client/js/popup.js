/**
 * Created by User on 2/23/2017.
 */

define(["backbone", "app"], function (Backbone) {

	Qwile.popup = {};
	Qwile.popup.View = Backbone.View.extend({

		initialize: function (options) {

			this.options = options;
			this.el = document.createElement("div");
			this.options.model.view = this;
			this.sound = new Howl({
				src: [options.sound || "sounds/message.mp3"]
			});
			this.render();
			console.log("Popup view options: ", options);

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

				if (Qwile.settings.sound) this.sound.play();
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
				this.options.model.off("push");
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
			if (this.options.boundAppModel) {
				this.options.boundAppModel.view.activate();
			}

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

	Qwile.popup.Model = Backbone.Model.extend({});
	Qwile.popup.currentPopups = new Backbone.Collection;

	_.extend(Qwile.popup, Backbone.Events);
	Qwile.popup.on("push", function (options) {

		var popup = new Qwile.popup.View(options);
		popup[options.method].apply(popup, options.arguments);

	});

	Qwile.popup.resetAppListeners = function () {
		_.each(Qwile.processes.models, function (model) {

			_.extend(model, Backbone.Events);
			model.off("push").on("push", function (options) {

				options.boundAppModel = this;
				var popup = new Qwile.popup.View(options);
				popup[options.method].apply(popup, options.arguments);

			});

		});
	};
	Qwile.processes.bind("add", Qwile.popup.resetAppListeners, this);
	
});