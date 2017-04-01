/**
 * Created by User on 3/29/2017.
 */

define(["backbone"], function (Backbone) {

	var AbstractDialogView = Backbone.View.extend({

		initialize: function (options) {

			this.options = options;
			this.render();

		},

		render: function () {
/*
			var template = _.template($(this.options.template).html(), {

				icon: this.options.icon,
				title: this.options.title,
				text: this.options.text

			});
			this.$el.html(template);
*/
		},

		events: {

			"click .close": "close"

		},

		open: function () {
			this.$el.fadeIn("fast");
		},

		close: function () {
			this.$el.fadeOut("fast");
		}

	});

	var ConfirmDialogView = AbstractDialogView.extend({

		OK: function (callback) {
			callback.call(this);
		},

		cancel: function () {
			this.close();
		}

	});

	var confirmDialogView = new ConfirmDialogView({

		el: $("#confirm-dialog-view"),
		template: "#confirm_template",
		icon: "img/confirm.png",
		title: "Confirm dialog",
		text: "Are you sure you want to exit?"

	});

	confirmDialogView.open();

	confirmDialogView.OK(function() {
		console.log("OK");
	});

	var PromptDialogView = AbstractDialogView.extend({ });
	var ContentDialogView = AbstractDialogView.extend({ });
	var AlertDialogView = AbstractDialogView.extend({ });

});