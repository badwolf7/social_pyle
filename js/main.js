window.onload = function(){
	// if($('main').hasClass('landing')){
	// 	$('header').css({
	// 		'display':'none'
	// 	});
	// }

	$("[name='my-checkbox']").bootstrapSwitch();

	var headerHeight = $('header').height();
	function socialNav(){
		if ($(window).scrollTop() >= headerHeight-35){
			$('.accounts aside').css({
				'position':'fixed',
				'top': '35px'
			});
			$('.socialLinks').addClass('col-sm-offset-3');
			$('.socialLinks').removeClass('col-sm-offset-1');
		}else{
			$('.accounts aside').css({
				'position':'initial'
			});
			$('.socialLinks').addClass('col-sm-offset-1');
			$('.socialLinks').removeClass('col-sm-offset-3');
		}
	}
	socialNav();
	


	////////////////////////////// HEADER
	/////////////////////////////////////
	function headerScroll(){
		if ($(window).scrollTop() >= 50){
			$('header.upper').addClass('lower');
			$('header.upper').removeClass('upper');
		}else{
			$('header.lower').addClass('upper');
			$('header.lower').removeClass('lower');
		}
	}
	if($('main').hasClass('landing')){
		headerScroll();
	}


	//////////////////////// HOW IT WORKS
	/////////////////////////////////////
	function sideScroll(counter, margin){
		perc = margin+"%";
		$('.hiw section').css({
			'margin-left':perc
		});
	}
	var counter = 0;
	var margin = 0;
	
	setInterval(function(){
		if(counter<4 && counter>0 && margin > -301){
			margin -= 100;
		}else if(counter>=4 && counter<7 && margin > -301){
			margin += 100;
		}else{
			counter = 0;
			margin = 0;
		}

		switch(margin){
			case 0:
				$('.hiw ul li').removeClass('active');
				$('.hiw ul li:nth-child(1)').addClass('active');
				break;
			case -100:
				$('.hiw ul li').removeClass('active');
				$('.hiw ul li:nth-child(2)').addClass('active');
				break;
			case -200:
				$('.hiw ul li').removeClass('active');
				$('.hiw ul li:nth-child(3)').addClass('active');
				break;
			case -300:
				$('.hiw ul li').removeClass('active');
				$('.hiw ul li:nth-child(4)').addClass('active');
				break;
		}

		console.log("counter: "+counter+" margin: "+margin);

		sideScroll(counter, margin);
		counter++;
	}, 8000);

	$('.hiw ul li:nth-child(1)').click(function(){
		$('.hiw ul li').removeClass('active');
		$(this).addClass('active')
		margin = 0;
		counter = 1;
		sideScroll(counter, margin);
	});
	$('.hiw ul li:nth-child(2)').click(function(){
		$('.hiw ul li').removeClass('active');
		$(this).addClass('active')
		margin = -100;
		counter = 2;
		sideScroll(counter, margin);
	});
	$('.hiw ul li:nth-child(3)').click(function(){
		$('.hiw ul li').removeClass('active');
		$(this).addClass('active')
		margin = -200;
		counter = 3;
		sideScroll(counter, margin);
	});
	$('.hiw ul li:nth-child(4)').click(function(){
		$('.hiw ul li').removeClass('active');
		$(this).addClass('active')
		margin = -300;
		counter = 4;
		sideScroll(counter, margin);
	});


	/////////////////////////// PAGE FLOW
	/////////////////////////////////////
	// Check if the user is on Chrome 
	var browserChrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()); 
	function pageFlow(e, obj){
		if(browserChrome){
			e.preventDefault();
		}
		var loc = $(obj).attr('href');
		$('body').animate({scrollTop: $(loc).offset().top - 75}, 1000, 'swing');
	}

	$('.accounts aside ul li a').click(function(e){
		var obj = $(this);
		pageFlow(e, obj);
	});

	/////////////////////////// On Scroll
	/////////////////////////////////////
	window.onscroll = function(){
		socialNav();
		if($('main').hasClass('landing')){
			headerScroll();
		}
	}
};