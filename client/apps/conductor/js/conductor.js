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

}).delegate("li.upload", "click", function() {
	$("#attachment").click();
});

function fileSelected () {

	var $progressBar = $(".progress").show();
	$("#upload-form").ajaxSubmit({

		beforeSend: function() {

		},

		uploadProgress: function(event, position, total, percentComplete) {
			$progressBar.css("width", percentComplete + "%");
		},

		complete: function(xhr) {

			var data = JSON.parse(xhr.responseText);
			if (data.success) {
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
						arguments: [3000, 800]

					});
					// re-render all the table from server
				});
			}
		}

	});
}

Tipped.create(".dropdown-menu .upload", function(element) {
	return "You may also just drag & drop files from OS to the folder.";
}, { position: 'right'});