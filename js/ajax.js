(function(){
	console.log('ajax');

	$('.buttonCont').click(function(){
		// check if switch is on or off
		if($(this).children('.bootstrap-switch').children('.bootstrap-switch-container').css("margin-left") == '0px'){
			// disconnect account
			console.log('turn off');
		}else if($(this).children('.bootstrap-switch').children('.bootstrap-switch-container').css("margin-left") == '-50px'){
			// connect account
			console.log('turn on');
		}
	});
})();