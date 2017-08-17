var $table = $('.conductor-table');

$table.DataTable({

	paging: false,
	ordering: true,
	bLengthChange: false,
	bInfo: false

});

$(".dataTables_filter input").attr("placeholder", "Start typing to search in this directory").appendTo(".conductor-search");

$table.find(".select-all input").change(function() {

	var checked = $(this).is(':checked');
	$table.find("tr.docket td.box input").prop("checked", checked);
	if (checked) {
		$table.find("tr.docket").addClass("checked");
	} else {
		$table.find("tr.docket").removeClass("checked");
	}

});

$table.delegate("tr.docket", "click", function() {

	$(this).find(":checkbox").click();
	if ($(this).find(":checkbox").is(':checked')) {
		$(this).addClass("checked");
	} else {
		$(this).removeClass("checked");
	}

}).delegate(":checkbox", "click", function(e) {

	e.stopPropagation();
	if ($(this).is(':checked')) {
		$(this).parent().parent().addClass("checked");
	} else {
		$(this).parent().parent().removeClass("checked");

	}
}).delegate("tr.docket", "dblclick", function(e) {

	alert("It will be opened by application.");
	// if (this.type !== "folder") {	// or 1 : 0 Boolean
	// 	var instanseApp = new AppController(this.assignedApp, this.url);
	// 	instanseApp.run();
	// } else {
	// 	conductor.showFolder(this.id);	// in the same window
	// }

});

$(document.body).delegate("li.delete", "click", function() {

	var $dockets = $(".conductor-table tr.docket.checked");
	if ($dockets.length > 0) {
		if (confirm("You are about to delete that " + $dockets.length + " items. \n Are you sure?")) {

			$dockets.remove().hide();
			// hide нужен для того, что если кликнуть на ячейку с selectAll этот долбанный бутстрап каким-то
			// макаром вставляет их обратно после удаление, но в реальности всё равно эта вьюха будет рендериться заного

		}
	} else {
		alert("Select items you need to delete.");
	}

}).delegate("li.upload", "click", function () {
	$("#attachment").click();
});

function showUploadComplete (data) {

	var $progressBar = $(".progress").show();
	$progressBar.css("background", "#42ff71").fadeOut("slow", function() {

		$(this).css("background", "#bee8ff").width(0);

		var Q = window.parent.Qwile;
		var model = Q.processes.find(function(model) {
			return model.get("name") === "Conductor";
		});

		model.trigger("push", {

			model: new Q.popup.Model({

				picture: "conductor.png",
				title: model.get("name"),
				message: data.message

			}),
			method: "showWithBlink",
			arguments: [3000, 800],
			sound: "sounds/complete.mp3"

		});
		// re-render all the table from server
	});

}

function fileSelected () {

	var $progressBar = $(".progress").show();
	$("#upload-form").ajaxSubmit({

		beforeSend: function() {

		},

		uploadProgress: function (event, position, total, percentComplete) {
			$progressBar.css("width", percentComplete + "%");
		},

		complete: function (xhr) {

			var data = JSON.parse(xhr.responseText);
			if (data.success) {
				showUploadComplete(data);
			}
		}

	});

}

dropbox = document.body;
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function dragenter (e) {

	e.stopPropagation();
	e.preventDefault();

}

function dragover (e) {

	e.stopPropagation();
	e.preventDefault();

}

function drop (e) {

	e.stopPropagation();
	e.preventDefault();

	var dt = e.dataTransfer;
	var files = dt.files;
	var data = new FormData();

	for (var i = 0; i < files.length; i++) {
		data.append('upload', files[i]);
	}
	var $progressBar = $(".progress").show();

	$.ajax({

		type: "POST",
		url: "/app/upload",
		enctype: 'multipart/form-data',
		contentType: false,
		data: data,

		xhr: function () {

			var xhr = new window.XMLHttpRequest();

			xhr.upload.addEventListener("progress", function (evt) {
				if (evt.lengthComputable) {

					var percentComplete = evt.loaded / evt.total;
					console.log(percentComplete);
					$progressBar.css("width", percentComplete * 100 + "%");

				}
			}, false);

			xhr.addEventListener("progress", function (evt) {
				if (evt.lengthComputable) {

					var percentComplete = evt.loaded / evt.total;
					console.log(percentComplete);
					$progressBar.css("width", percentComplete * 100 + "%");

				}
			}, false);
			return xhr;

		},

		success: function (data, status, xhr) {

			var data = JSON.parse(xhr.responseText);
			if (data.success) {
				showUploadComplete(data);
			}

		},

		processData: false,
		cache: false

	});

}

Tipped.create(".dropdown-menu .upload", function(element) {
	return "You may also just drag & drop files from OS to the folder.";
}, { position: 'right'});