var Peer = SimplePeer;

navigator.getUserMedia = ( navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia ||
navigator.msGetUserMedia);

navigator.getUserMedia({ video: true, audio: true }, gotMedia, function () {});

function gotMedia (stream) {

	var initiator = new SimplePeer({ initiator: true, stream: stream });
	var reciever = new SimplePeer({ stream: stream });

	initiator.on('signal', function (data) {
		reciever.signal(data)
	});

	reciever.on('signal', function (data) {
		initiator.signal(data)
	});

	reciever.on('stream', function (stream) {
		// got remote video stream, now let's show it in a video tag
		var video = document.querySelector('video#fromPeer1');
		var audio = document.querySelector('audio');
		video.src = window.URL.createObjectURL(stream);
		video.audio = window.URL.createObjectURL(stream);
		video.play();
	});
/*
 	initiator.on('stream', function (stream) {
		// got remote video stream, now let's show it in a video tag
		var video = document.querySelector('video#fromPeer2');
		video.src = window.URL.createObjectURL(stream);
		video.play();
	});
*/
}