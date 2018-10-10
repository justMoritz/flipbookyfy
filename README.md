# flipbookyfy
Make a cool Flip-board style web-app. 


## Usage: 

### Sample Markup:

  `<div class="main">`
    `<article>`
      `<div class="header"></div>`
      `<div class="summary"></div>`
    `</article>`
    `<article>`
      `<div class="header"></div>`
      `<div class="summary"></div>`
    `</article>`
  `<div>`
    

*ATTENTION!!!!!: The wrapper for (`<article>` in the example) will be removed by the script!*
*Make sure you don't rely on them in your CSS.*

### Sample Function Call

  `flipbookyfy.init({
    containerclass: '.blogmain',
    headerclass: '.entry-header',
    summaryclass: '.entry-summary',
    perspective: '1000px',
    heightmodifier: 1,
    excludeitems: [
      '.footer',
      '.header'
      ]
  });`
  
#### REQUIRED!!
  
  * @param  {string} containerclass The class containing the items that should be flipped (.main in the example markup)
  * @param  {string} headerclass    The class of the top portion of the flipbook (.header) in the example
  * @param  {string} summaryclass   The class of the bottom portion of the flipbook (.summary) in the example
  
#### (OPTIONAL) 
  * @param  {string} heightmodifier EXPERIMENTAL!!!! If you want to slow down or speed up the scroll.
  * @param  {array} excludeitems    An array of classnames (strings) you wish to exclude
  
  
