/**
 * Created by User on 3/7/2017.
 */

define(["backbone"], function (Backbone) {

	Qwile.widget.View = Backbone.View.extend({

		initialize: function (options) {

			this.options = options;
			this.el = document.createElement("div");
			_.bindAll(this, "render");
			this.model.bind("change:content", _.bind(this.setContent, this));
			this.model.bind("save", this.model.save);
			this.render();

		},

		render: function () {

			var template = _.template($("#widget-view").html());
			this.$el.html(template()).addClass(this.options.className)
				.attr("data-id", this.model.get("_id")).addClass("widget");
			this.$el.appendTo(".wrapper");
			this.setUI();

		},
		
		events: {

			"click .close": "remove",
			"mouseover": 	"showButtons",
			"tap": 			"showButtons",
			"mouseleave": 	"hideButtons"
		
		},

		remove: function () {
			this.model.destroy({

				url: _.bind(function () { return "/widget/uninstall/" + this.get("_id"); }, this.model)(),
				contentType: "application/json",
				data: JSON.stringify({ 
					id: _.bind(function () { return this.get("_id") }, this.model)()
				}),
				wait: true,
				success: _.bind(function (model, response) {

					console.log(response);
					this.$el.fadeOut("slow", _.bind(function () {

						this.$el.remove();
						$("#widget_select").find("[data-id='" + this.model.get("_id") + "'] .mark").remove();

					}, this));

				}, this)

			});
		},

		setUI: function () {
			this.$el.draggable({

				containment: "parent",
				handle: ".content"

			}, {
				stop: _.bind(function (event, ui) {

					this.model.set({

						x: $(ui.helper).offset().left,
						y: $(ui.helper).offset().top

					}, { silent: true });
					this.model.trigger("save");

				}, this)
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
		},

		setContent: function () {

			this.$el.find("content").html(this.model.get("content"));
			this.$el.show("slow");

		}

	});

	Qwile.widget.Model = Backbone.Model.extend({

		url: "/widget/",
		urlRoot: "/widget/",
		idAttribute: "_id",

		initialize : function() {
			$.get("/widget/getContent", { path: this.get("path") }, _.bind(function (data) {
				this.set({ content: data }, { silent: false });
			}, this));
		}
		
	});

	Qwile.installedWidgets = new Backbone.Collection;
	
	Qwile.renderInstalledWidget = function (widget) {

		var widgetModel = new Qwile.widget.Model({

			_id: widget._id,
			path: widget.path,
			x: widget.x,
			y: widget.y,

			sync: function () {

				alert(this.get("x"));
				alert(this.get("y"));

			}

		});
		widgetModel.view = new Qwile.widget.View({

			model: widgetModel,
			className: widget.name

		});
		Qwile.installedWidgets.add(widgetModel);

	};

	Qwile.initInstalledWidgets = function () {
		$.get("/widget/getInstalled", function (data) {
			if (data.success) {

				console.log("Widgets: ", data);
				_.each(data.widgets, Qwile.renderInstalledWidget);
				console.log("Installed widgets: ", Qwile.installedWidgets);

			}
		});
	}
	
});