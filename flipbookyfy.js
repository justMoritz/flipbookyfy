var flipbookyfy = (function($){

  /**
   * Will create a flipbook out of a stardartized markup.
   * Sample Markup:
   *
   *  <div class="main">
   *    <article>
   *      <div class="header"></div>
   *      <div class="summary"></div>
   *    </article>
   *    <article>
   *      <div class="header"></div>
   *      <div class="summary"></div>
   *    </article>
   *  <div>
   *
   * ATTENTION!!!!!: The wrapper for (<article> in the example) will be removed by the script!
   * Make sure you don't rely on them in your CSS.
   *
   * @param  {string} containerclass The class containing the items that should be flipped (.main in the example markup)
   * @param  {string} headerclass    The class of the top portion of the flipbook (.header) in the example
   * @param  {string} summaryclass   The class of the bottom portion of the flipbook (.summary) in the example
   * @param  {array} excludeitems    An array of classnames (strings) you wish to exclude
   * @param  {string} heightmodifier EXPERIMENTAL!!!! If you want to slow down or speed up the scroll.
   *                                 For example: Pass 0.5 for twice the speed, 2 for half. Default is 1.
   */
  var _flipbookyfy = function( input ){

    // variables to hold information passed form function call
    var containerclass,
        headerclass,
        summaryclass,
        perspective,
        heightmodifier,
        excludeitems;

    // parse object passed in function call
    for (var key in input){
      if (input.hasOwnProperty(key)) {
        if( key === 'containerclass'){ containerclass = input[key]; }
        if( key === 'headerclass'){ headerclass = input[key]; }
        if( key === 'summaryclass'){ summaryclass = input[key]; }
        if( key === 'perspective'){ perspective = input[key]; }
        if( key === 'heightmodifier'){ heightmodifier = input[key]; }
        if( key === 'excludeitems'){ excludeitems = input[key]; }
      }
    }

    // checks and prepares if needed the height to be excluded from the flipbook (used for footer etc.)
    var excludedheight = 0;
    var excludeditemsarray = (Object.prototype.toString.call(excludeitems) === '[object Array]');
    if( excludeditemsarray ){
      for(i=0; i < excludeitems.length; i++){
        // adds height of each to-be-excluded element to the overall excludedheight
        excludedheight += $(excludeitems[i]).outerHeight(true);
      }
    }

    // check to make sure we have all the required minimum information
    if(!containerclass || !headerclass || !summaryclass ){
      throw "You did not set all required parameters";
    }
    // defaults
    heightmodifier = heightmodifier || 1;
    perspective = perspective || '0px';

    // prepares neccesary classes and styles for the flipbook
    var headstyles =
      '<style id="flipbookstyles">'+
        containerclass +' '+ headerclass + ','+
        containerclass +' '+ summaryclass+'{'+
          'background-color: white;' +
          'position: fixed;' +
          'width: 100%;'+
          'height: 50%;'+
        '}'+
// next header current summary

        containerclass +' '+ headerclass +  ':not(.this--nextitem), '+
        containerclass +' '+ summaryclass + ':not(.this--isinview){ '+
          'transform: rotateX(0deg) !important;' +
        '}'+
        containerclass +' '+ headerclass+ '{' +
          'top: 0;'+
          'transform-origin: bottom center;'+
          'transform: rotateX(-90deg);'+
        '}'+
        containerclass +' '+ summaryclass + '{'+
          'top: 50%;' +
          'transform: rotateX(0deg);' +
          'transform-origin: top center;' +
        '}'+
        '.this--isinview'+summaryclass+'{ z-index: 2000 !important;}' +
        '.this--previtem'+summaryclass+'{ visibility: hidden; }' +
        '.this--isinview'+headerclass+'{ z-index: 2001 !important; }' +
        '.this--nextitem'+headerclass+'{ z-index: 2002 !important; }' +
        '.this--nextitem'+summaryclass+'{ transform: rotateX(0deg) !important; }' +
      '</style>';
    $('head').append( headstyles );

    var windowheight;
    var $childelements;
    var childnumber;

    var _prepDoc = function(){

      windowheight = $(window).height()*heightmodifier - excludedheight;
      // windowheight = screen.availHeight*heightmodifier - excludedheight;
      // windowheight = window.innerHeight*heightmodifier - excludedheight;


      $childelements = $(containerclass).children();
      childnumber   = $childelements.length;

      // applies reverse order z-indices.
      for(var i=0; i<childnumber; i++){
        var $curset = $($childelements[i]);
        $curset.children().addClass('elementnumber'+i).css('zIndex', (childnumber-i)*100 );
      }

      // removes wrapper ('article')
      $childelements.find(headerclass, containerclass).unwrap();

      // makes sure each element has the correct height,
      // also makes sure they container height is the height
      // that would be scrolled if all the elements were to
      // render in a row in stead of on top of each other.
      $(containerclass).children().css('height', windowheight/(2*heightmodifier)+'px');
      $(containerclass).css('height', windowheight*childnumber +'px');

      // offsets the second element at the correct height
      $(containerclass).find(summaryclass).css('top', windowheight/(2*heightmodifier)+'px');
    };


    _prepDoc();
    $( window ).resize(function() {
      _prepDoc();
    });

    $(window).scroll( function(){

      var wnps = $(window).scrollTop();
      wnps = wnps/heightmodifier;

      // resets every time the height of one element has been scrolled
      var scrollratio = wnps % windowheight;

      // figures out the number of 180 degrees that has been scrolled
      var ratio  = windowheight / 180;
      var degree = scrollratio / ratio;

      // loops through each item in the list and applies logical logic.
      for(var i=0; i<childnumber; i++){
        var $prevHeader = $(headerclass);
        var $prevSummary = $(summaryclass);

        var $curHeader = $(headerclass+'.elementnumber'+i);
        var $curSummary = $(summaryclass+'.elementnumber'+i);

        var $nextHeader = $(headerclass+'.elementnumber'+(i+1));
        var $nextSummary = $(summaryclass+'.elementnumber'+(i+1));

        // if that element is in view
        if( wnps >= windowheight*i && wnps < windowheight*(i+1) ){

          $prevHeader.addClass('this--previtem');
          $prevSummary.addClass('this--previtem');

          $curHeader.addClass('this--isinview').removeClass('this--previtem');
          $curSummary.addClass('this--isinview').removeClass('this--previtem');

          $nextHeader.addClass('this--nextitem').removeClass('this--previtem');
          $nextSummary.addClass('this--nextitem').removeClass('this--previtem');

          if( degree >= 90 ){
            $nextHeader.css('transform', 'perspective('+perspective+') rotateX('+((degree-180))+'deg)');
            $curSummary.css('transform', 'perspective('+perspective+') rotateX('+90+'deg)');
          }else{
            $curSummary.css('transform', 'perspective('+perspective+') rotateX('+degree+'deg)');
            $curHeader.css('transform', 'perspective('+perspective+') rotateX('+0+'deg)');
            $nextHeader.css('transform', 'perspective('+perspective+') rotateX('+90+'deg)');
          }
        }
        // if element is no longer in view, and related logic.
        else{
          // $prevHeader.removeClass('this--previtem');
          // $prevSummary.removeClass('this--previtem');

          $curHeader.removeClass('this--isinview');
          $curSummary.removeClass('this--isinview');

          $nextHeader.removeClass('this--nextitem');
          $nextSummary.removeClass('this--nextitem');
        }
      }
    });
  };


  var init = function(input){

    _flipbookyfy(input);

    // window.addEventListener('resize', function(){
    //   flipbookyfy(input);
    // });

    window.scrollBy(0, 1);
    window.scrollBy(0, -1);

  };


 /**
  * Public Methods
  */
  return{
    init: init
  };

})(jQuery);
