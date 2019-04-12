var flipbookyfy = (function($){

  /**
   * Will create a flipbook out of a stardartized markup.
   * Sample Markup:
   *
   *  <div class="main">
   *    <article>
   *      <div class="header"> <a href="some-page1.html">Some link1</a> </div>
   *      <div class="summary"></div>
   *    </article>
   *    <article>
   *      <div class="header"> <a href="some-page2.html">Some link2</a> </div>
   *      <div class="summary"></div>
   *    </article>
   *    […]
   *  <div>
   *
   * ATTENTION!!!!!:
   *
   *   The wrapper for (<article> in the example) will be removed by the script!
   *   Make sure you don't rely on them in your CSS.
   *
   *   If your markup has any links in it, make sure they are in the header portion. The script will
   *   look for the first link in the header and use it for each entire flipcard application state
   *
   * ARGUMENTS
   *
   *   You will need to pass a Javascript object as an argument, but within that object,
   *   you have these parameters
   *
   *   MANDATORY
   *   @param  {string} containerclass The class containing the items that should be flipped (.main in the example markup)
   *   @param  {string} headerclass    The class of the top portion of the flipbook (.header) in the example
   *   @param  {string} summaryclass   The class of the bottom portion of the flipbook (.summary) in the example
   *
   *   OPTIONAL
   *   @param  {string} paginationclass The class of the item your pagination might sit in. CAREFUL!!
   *                                    This item MUST NOT sit in the container (the one with “containerclass”)
   *   @param  {array}  excludeitems    An array of classnames (strings) you wish to exclude
   *   @param  {int}    perspective     Defauly is 0, Don't use px. The CSS perspective on the flipping cards.
   *   @param  {string} heightmodifier  EXPERIMENTAL!!!! If you want to slow down or speed up the scroll.
   *                                    For example: Pass 0.5 for twice the speed, 2 for half. Default is 1.
   */
  var _flipbookyfy = function( input ){

    // variables to hold information passed form function call
    var containerclass,
        headerclass,
        summaryclass,
        perspective,
        heightmodifier,
        excludeitems,
        paginationclass;

    // parse object passed in function call
    for (var key in input){
      if (input.hasOwnProperty(key)) {
        if( key === 'containerclass'){ containerclass = input[key]; }
        if( key === 'headerclass'){ headerclass = input[key]; }
        if( key === 'summaryclass'){ summaryclass = input[key]; }
        if( key === 'perspective'){ perspective = input[key]; }
        if( key === 'heightmodifier'){ heightmodifier = input[key]; }
        if( key === 'excludeitems'){ excludeitems = input[key]; }
        if( key === 'paginationclass'){ paginationclass = input[key]; }
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
    heightmodifier  = heightmodifier  ||  1;
    perspective     = perspective     || '0';
    paginationclass = paginationclass || false;

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
        '.filpbookscrollplaceholder{' +
          'top: 0; ' +
          'display: block; ' +
          'position: relative; ' +
          'width: 100%; ' +
          'z-index: 4998;' +
          'opacity: 0; ' +
          // For any overlays over the flipbook application, use the same kinda logic
          // in your other CSS as follows (needed for safari browsers):
          // Since your flipping elements will live in a perspective state, you will need ANYTHING
          // that overlays them to also live in the same state AND be “obove” them,
          // What it does here is move it up on the Z Axis by half the perspective, bringing
          // it 2x closer to the virtual camera, which means we will need to render the item
          // at half the size in order to make it appear flat and fit into it's original space
          'transform: perspective('+perspective+'px) translateZ('+perspective/2+'px) scale(0.5);' +
          'transform-style: preserve-3d;' +
        '}' +
      '</style>';
    $('head').append( headstyles );

    var windowheight;
    var $childelements;
    var childnumber;
    var paginationclassHeight = 0;
    var paginationmarkup = '';

    if(paginationclass){
      // paginationclassHeight = $(paginationclass).outerHeight(true);
      // used to take up the height of additional flip card at the end of the list later
      paginationclassHeight = 1;
      // saves the pagination markup
      paginationmarkup = $(paginationclass).html();
      $(paginationclass).remove();
    }


    var _prepDoc = function(){

      windowheight = $(window).height()*heightmodifier - excludedheight;
      // leaving these here for reference for now.
      // windowheight = screen.availHeight*heightmodifier - excludedheight;
      // windowheight = window.innerHeight*heightmodifier - excludedheight;

      $childelements = $(containerclass).children();
      childnumber   = $childelements.length;

      console.log( childnumber );

      var lastNumberedZIndex = 0;
      // applies reverse order z-indices.
      for(var h=0; h<childnumber; h++){
        var $curset = $($childelements[h]);
        $curset.children().addClass('elementnumber'+h).css('zIndex', (childnumber-h)*100 );
        lastNumberedZIndex = childnumber-h;
      }
      // adds the last z-index to the item.
      lastNumberedZIndex--;
      if(paginationclass){
        $(paginationclass).css('zIndex', (lastNumberedZIndex)*100 );
      }


      // removes wrapper ('article')
      $childelements.find(headerclass, containerclass).unwrap();

      // makes sure each element has the correct height,
      // also makes sure they container height is the height
      // that would be scrolled if all the elements were to
      // render in a row in stead of on top of each other.
      $(containerclass).children().css('height', windowheight/(2*heightmodifier)+'px');
      $(containerclass).css('height', (windowheight*(childnumber+paginationclassHeight))-1 +'px').css('overflow', 'hidden');

      // offsets the second element at the correct height
      $(containerclass).find(summaryclass).css('top', windowheight/(2*heightmodifier)+'px');

      // wraps the entire (overflow: hidden) flipbook application
      // in an overflow: scroll container, only adjust height if already exists
      if( !$('.flipbookwrapper').length ){
        $(containerclass).wrap('<div class="flipbookwrapper" style="height: '+windowheight+'px; overflow: scroll; -webkit-overflow-scrolling: touch;"></div>');
      }else{
        $('.flipbookwrapper').css('height', windowheight+'px');
      }

      $(document).trigger('flipBookPrepDocFinish');

    };

    /**
     * creates an artifical scroll and click interface.
     * Here is where it important that you put at least one link
     * in the Header markup, because this will find it and
     * use it as the link in the click overlay
     * Does not run (hopefully) if already exists, but if it does
     * It will adjust the height of the element accordingly
     */
    var _initDocOnly = function(){
      // console.log( '_initDocOnly' );
      if( !$('.filpbookscrollplaceholder').length ){
        for(var i=0; i<childnumber; i++){
          var $allHeaders = $(headerclass) ;
          var $currHeader = $($allHeaders[i]);
          var currentLink = $currHeader.find('a').attr('href');
          var startMarkup = '<div ';
          var endMarkup   = 'div>';

          if(currentLink.length){
            startMarkup = '<a href="'+currentLink+'" ';
            endMarkup   = 'a>';
          }
          $(containerclass).append(startMarkup + ' class="filpbookscrollplaceholder" style="height:' + windowheight + 'px"></' + endMarkup);
        }
        // if pagination exists, adds another half height element,
        // so you can back if need be. It will also add the pagination markup
        // into that element, if that's something you want to style.
        if(paginationclassHeight && paginationmarkup){
          $(containerclass).append('<div class="filpbookscrollplaceholder this--lastitemscroller" style="height:' + windowheight/2 + 'px">'+paginationmarkup+'</div>');
        }
      }else{
        for(var b=0; b<childnumber; b++){
          var $allScrollPlaceholders = $('.filpbookscrollplaceholder');
          var $curScrollPlaceholder  = $($allScrollPlaceholders[b]);
          $curScrollPlaceholder.css('height', windowheight + 'px');
        }
        if(paginationclassHeight){
          $('.filpbookscrollplaceholder.this--lastitemscroller').css('height', windowheight/2 + 'px');
        }
      }

    };

    _prepDoc();
    _initDocOnly();
    $( window ).resize(function() {
      _prepDoc();
    });

    // listens for scroll and does all the magic
    $('.flipbookwrapper').scroll( function(){

      var wnps = $('.flipbookwrapper').scrollTop();
      wnps = wnps/heightmodifier;

      // if scrolled half a card height past the last card height, trigger half event
      if( wnps > windowheight*(childnumber-paginationclassHeight/2) ){
        $(document).trigger('flipBookHalfEnd');
      }
      if(wnps > windowheight*(childnumber-paginationclassHeight/2.5) ){
        $(document).trigger('flipBookThreeQuarterEnd');
      }

      // if scrolled half a card height past the last card height
      if( wnps > windowheight*(childnumber-paginationclassHeight) ){
        $(paginationclass).addClass('this--paginationisinview');
      }else{
        $(paginationclass).removeClass('this--paginationisinview');
      }

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
            $nextHeader.css('transform', 'perspective('+perspective+'px) rotateX('+((degree-180))+'deg)');
            $curSummary.css('transform', 'perspective('+perspective+'px) rotateX('+90+'deg)');
          }else{
            $curSummary.css('transform', 'perspective('+perspective+'px) rotateX('+degree+'deg)');
            $curHeader.css('transform', 'perspective('+perspective+'px) rotateX('+0+'deg)');
            $nextHeader.css('transform', 'perspective('+perspective+'px) rotateX('+90+'deg)');
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

  // Makes sure init only happens one time
  var initted = false;
  var init = function(input){
    if(!initted){
      _flipbookyfy(input);
      // hack needed in order to start drawing
      // all the elements correctly after load
      window.scrollBy(0, 1);
      window.scrollBy(0, -1);
    }
    initted = true;
  };


 /**
  * Public Methods
  */
  return{
    init: init
  };

})(jQuery);