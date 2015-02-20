window.onload = function(){
	console.log('AJAX');
	
	$('.socialToggleSwitch').change(function(){
		console.log('switch');
		console.log($(this).val());
	});
}