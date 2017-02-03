var bool = true;

function hideStartMenu() {
	$("#menu").animate({
		top: '-100%',
		left: '-100%',
		opacity: 0
	}, "slow");
	document.getElementById('widget_select').style.display = 'none';
	bool = true;
}

document.getElementById('start').onclick = function(e) {
	e.stopPropagation();
	if(bool) {
		$("#menu").animate({
			top: '50px',
			left: 0,
			opacity: 1
		}, "slow");
		document.getElementById('widget_select').style.display = 'none';
		bool = false;
	} else {
		hideStartMenu();
	}
}

$("#toppanel, footer").click(hideStartMenu);

document.getElementsByClassName('add-widget')[0].onclick = function() {
	if (!$("#widget_select").is(":hidden")) {
		$("#widget_select").fadeOut("slow");
	} else {
		$("#widget_select").fadeIn("slow");
		document.getElementById('widget_select').style.display = 'table';
	}
}

$("#widget_select").click(function() {
	$(this).fadeOut("slow", function() {
		$('#leftpanel').mouseleave();
	});
});
$("#widget_select_inside").click(function(e) { e.stopPropagation(); });

// NEED REFACTOR!!!!!!!!!!

$(".widgets_list div.img").click(function() {
	$('.widget.' + $(this).data("name")).show();
});

