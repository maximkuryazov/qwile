/**
 * Created by User on 3/7/2017.
 */

define(["backbone"], function (Backbone) {

	Qwile.widget.View = Backbone.View.extend({

		initialize: function (options) {

			this.options = options;
			this.el = document.createElement("div");
			_.bindAll(this, "render");
			this.model.bind("change", this.render);
			this.render();

		},

		render: function () {

			var template = _.template($("#widget-view").html());
			this.$el.html(template()).addClass(this.options.className).addClass("widget");
			this.$el.appendTo(".wrapper");
			this.$el.show();
			this.setUI();

		},
		
		events: {

			"click .close": "remove",
			"mouseover": 	"showButtons",
			"tap": 			"showButtons",
			"mouseleave": 	"hideButtons"
		
		},

		remove: function () {

			this.$el.fadeOut("slow", _.bind(function () {
				this.$el.remove();
			}, this));
			this.model.destroy({

				urlRoot: "/widget/uninstall",
				wait: true,
				success: function (model, response) {
					alert(response);
				}

			});

		},

		setUI: function () {
			this.$el.draggable({

				containment: "parent",
				handle: ".content"

			});
		},

		showButtons: function () {
			if (this.$el.find(".buttons").css("opacity") == 0) {
				this.$el.find(".buttons").stop().css("visibility", "visible").animate({ opacity: 1 }, "slow");
			}
		},

		hideButtons: function () {
			this.$el.find(".buttons").animate({ opacity: 0 }, "fast", function () {
				$(this).css("visibility", "hidden");
			});
		}

	});

	Qwile.widget.Model = Backbone.Model.extend({

		urlRoot: "/widget/",
		idAttribute: "_id",

		defaults: {
			_id: "widget_id"	// here should be real widget._id from MongoDB
		},

		uninstall: function () {
			alert("Uninstall");
		}

	});
	
	var clockView = new Qwile.widget.View({

		model: new Qwile.widget.Model(),
		className: "clock"

	});

	var calcView = new Qwile.widget.View({

		model: new Qwile.widget.Model(),
		className: "calc"

	});

	$.get("/widget/getInstalled", function (data) {
		console.log("Widgets: ", data);
	});
	
});