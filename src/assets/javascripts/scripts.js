//global variables
var bodyEl = $('body');

//pre-functions
function loader_lego() {
  var animData = {
    wrapper: document.querySelector('#animationWindow'),
    animType: 'svg',
    loop: true,
    prerender: true,
    autoplay: true,
    path: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/35984/LEGO_loader.json'
  };
  var anim = bodymovin.loadAnimation(animData);
  anim.setSpeed(3.4);
}

//pre-functions calls
loader_lego();

$(window).load(function() {
  var loader = $('#animationWindow');
    setTimeout(function(){loader.fadeOut(600)}, 1000);
});

function classIfPage() {
  var page = $('article.page').attr('class');
  bodyEl.addClass(page);
}

function parallaxLatest(){
  var args = {
    scalarX: 8,
    scalarY: 10,
    frictionX:0.01,
    frictionY:0.01
  }

  if(bodyEl.hasClass('mobile')) {
    args.scalarX = args.scalarX*2;
    args.scalarY = args.scalarY*1.5;
    args.frictionX = args.frictionX*10;
    args.frictionY = args.frictionY*10;
  }else{
    args.scalarX = args.scalarX*1;
    args.scalarY = args.scalarY*1;
    args.frictionX = args.frictionX*1;
    args.frictionY = args.frictionY*1;
  }

  var meso_scene = $('.meso-scene').get(0),
  capside_scene = $('.capside-scene').get(0),
  hsjd_scene = $('.hsjd-scene').get(0);

  var parallaxMeso = new Parallax(meso_scene, args),
  parallaxCapside = new Parallax(capside_scene, args),
  parallaxHsjd = new Parallax(hsjd_scene, args);

  parallaxMeso.invert(false, false);
  parallaxCapside.invert(false, false);
  parallaxHsjd.invert(false, false);

}

function scrollFade(){

  $(window).scroll( function(){

    var fadeinleft = $('.fade');

    fadeinleft.each( function(i){

      var bottom_of_object = $(this).offset().top + $(this).outerHeight()/2;
      var bottom_of_window = $(window).scrollTop() + $(window).height();

      if( bottom_of_window > bottom_of_object ){

        $(this).addClass('active');

      }
    });
  });
}

function screenDetect(){
  if (window.matchMedia("(max-width: 769px)").matches) {
    if(!bodyEl.hasClass('mobile')){
      bodyEl.addClass('mobile');
    }
  } else {
    bodyEl.removeClass('mobile');
  }
}

function depthChange(){
  var depthEl = $('.work .image img');

  depthEl.each(function() {

    if(bodyEl.hasClass('tablet')) {
      $(this).attr('data-depth',$(this).data('depth')*10)
    }else{
      $(this).attr('data-depth',$(this).data('depth')*1)
    }
  });
}

//function calls
$(document).ready(function(){
  screenDetect();
  parallaxLatest();
  scrollFade();

  $(window).on('resize', function(){
    screenDetect();
  })
})
