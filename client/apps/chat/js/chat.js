var Peer = SimplePeer;

navigator.getUserMedia = ( navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia ||
navigator.msGetUserMedia);

// get video/voice stream
navigator.getUserMedia({ video: true, audio: true }, gotMedia, function () {});

function gotMedia (stream) {

	var peer1 = new SimplePeer({ initiator: true, stream: stream });
	var peer2 = new SimplePeer({ stream: stream });

	peer1.on('signal', function (data) {
		peer2.signal(data)
	});

	peer2.on('signal', function (data) {
		peer1.signal(data)
	});

	peer2.on('stream', function (stream) {
		// got remote video stream, now let's show it in a video tag
		var video = document.querySelector('video#fromPeer1');
		var audio = document.querySelector('audio');
		video.src = window.URL.createObjectURL(stream);
		video.audio = window.URL.createObjectURL(stream);
		video.play();
	});

	peer1.on('stream', function (stream) {
		// got remote video stream, now let's show it in a video tag
		var video = document.querySelector('video#fromPeer2');
		video.src = window.URL.createObjectURL(stream);
		video.play();
	});

}