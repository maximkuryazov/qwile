/**
 * Created by User on 8/2/2017.
 */

var player = videojs("clip");
player.on("fullscreenchange", function () {

	var controlBar = document.querySelector(".video-js .vjs-control-bar");
	if (player.isFullscreen()) {

		controlBar.style.width = "100%";
		controlBar.style.left = "0";

	} else {

		controlBar.style.width = "200%";
		controlBar.style.left = "-50%";

	}

});