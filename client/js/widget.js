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
			this.$el.html(template());
			this.$el.appendTo(".wrapper");

		},
		
		events: {

			"click .close": "remove"
		
		},

		remove: function () {

			this.$el.remove();
			this.model.uninstall();

		}

	});

	Qwile.widget.Model = Backbone.Model.extend({

		uninstall: function () {
			//alert("Uninstall"); works!
		}

	});
	
	var widgetView = new Qwile.widget.View({
		model: new Qwile.widget.Model()
	});
	widgetView.remove();
	
});