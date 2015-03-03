(function(){
	var uId = $('#accountDrop')[0].getAttribute('uid');
	var fbId = $('#accountDrop')[0].getAttribute('fbid');
	var twtId = $('#accountDrop')[0].getAttribute('twtid');
	var gId = $('#accountDrop')[0].getAttribute('gid');



	$('.buttonCont').click(function(){
		// Which was clicked
		var input = $(this).children('.bootstrap-switch').children('.bootstrap-switch-container').children('input');
		var direction = input.val();
		console.log('Direction: '+direction);

		// check if switch is on or off
		var switchContMarg = $(this).children('.bootstrap-switch').children('.bootstrap-switch-container').css("margin-left");
		if(switchContMarg == '0px'){
			// disconnect account
			console.log('turn off');

			switch(direction){
				case 'fb_on':
					console.log('FACEBOOK TURN OFF');
					input.val('fb_off');
					var data = {
						'table':'facebooks',
						'uId':uId,
						'actId':fbId
					}
					deactivate(data);
					break;
				case 'twt_on':
					console.log('TWITTER TURN OFF');
					input.val('twt_off');
					var data = {
						'table':'twitters',
						'uId':uId,
						'actId':twtId
					}
					deactivate(data);
					break;
				case 'g_on':
					console.log('GOOGLE TURN OFF');
					input.val('g_off');
					var data = {
						'table':'googles',
						'uId':uId,
						'actId':gId
					}
					deactivate(data);
					break;
			}
		}else if(switchContMarg == '-50px'){
			// connect account
			console.log('turn on');
			
			switch(direction){
				case 'fb_off':
					console.log('FACEBOOK TURN ON');
					input.val('fb_on');
					document.location.href = '/auth/facebook';
					break;
				case 'twt_off':
					console.log('TWITTER TURN ON');
					input.val('twt_on');
					document.location.href = '/auth/twitter';
					break;
				case 'g_off':
					console.log('GOOGLE TURN ON');
					input.val('g_on');
					document.location.href = '/auth/google';
					break;
			}
		}
	});

	function deactivate(data){
		$.ajax({
			type: 'GET',
			url: '/accounts/deactivate',
			data: data,
			dataType: 'json',
			error: function(err){
				console.log('ajax error');
				console.log(err);
			},
			success: function(result){
				console.log('loggedIn');
				console.log(result);
			}
		});
	}
})();