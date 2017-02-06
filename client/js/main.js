﻿(function() {

	window.Qwile = {};

	Qwile.desktop = new Function();
	Qwile.start = new Function();
	Qwile.user = new Function();
	Qwile.app = new Function();
	Qwile.widget = new Function();
	Qwile.file = new Function();

	var baseURL = Qwile.baseURL = document.location.href.split(":8080")[0];
	var port = Qwile.serverPort = "3000";

	// it's because browser doesn't fired onpopstate when pushState is called (only back() and forward())

	(function(history){
		var pushState = history.pushState;
		history.pushState = function(state, name, title, popstate) {
			if (typeof history.onpushstate == "function") {
				history.onpushstate({ state: state });
			}
			var result = pushState.apply(history, arguments);
			if (popstate) window.onpopstate.call();
			return result;
		}
	})(window.history);

	require.config({
		baseUrl: "js",
		paths: {
			"underscore":    "lib/underscore.min",
			"jquery":        "lib/jquery.min",
			"jquery-ui":     "lib/jquery.ui.min",
			"tipped":        "lib/tipped",
			"jquery-form":   "lib/jquery.form.min",
			"jquery-cookie": "lib/jquery.cookie"
		}
	});

	define(["underscore", "tipped", "jquery-form", "jquery-ui", "jquery-cookie"], function(_, Tipped) {

		window.Tipped = Tipped;

		$.ajaxSetup({
			xhrFields: {
				withCredentials: true
			}
		});

		function loadPage(template) {
			$.ajax({

				method: "GET",
				url: baseURL + ":" + port + "/templateController",
				data: { template: template },
				crossDomain: true,
				dataType: "html"

			}).done(function(data, textStatus, xhr) {

				var state = { state: "" };
				window.history.pushState(state, "", $.cookie("redirect"), false);
				$(document.body).hide().html(data).show();
				$.removeCookie("redirect");

			});
		}
		
		var parameter = document.location.href.replace(/^.*\/\/[^\/]+\//, '');
		if (parameter == "desktop") {
			loadPage(parameter);
		} else {
			loadPage("login");
		}

		window.onpopstate = function() {
			var parameter = document.location.href.replace(/^.*\/\/[^\/]+\//, '');
			loadPage(parameter);
		}

	});

})();