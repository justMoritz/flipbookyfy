# flipbookyfy
Make a cool Flip-board style web-app. 


## Usage: 

### Sample Markup*:
```
   <div class="main">
     <article>
       <div class="header"> <a href="some-page1.html">Some link1</a> </div>
       <div class="summary"></div>
     </article>
     <article>
       <div class="header"> <a href="some-page2.html">Some link2</a> </div>
       <div class="summary"></div>
     </article>
     […]
   <div>
```
    
*ATTENTION!!!!!: The wrapper for (`<article>` in the example) will be removed by the script!*
*Make sure you don't rely on them in your CSS.*

If your markup has any links in it, make sure they are in the header portion. The script will
look for the first link in the header and use it for each entire flipcard application state

### Sample Function Call

```
  flipbookyfy.init({
    containerclass: '.blogmain',
    headerclass: '.entry-header',
    summaryclass: '.entry-summary',
    perspective: '1000px',
    heightmodifier: 1,
    excludeitems: [
      '.footer',
      '.header'
      ]
  });
```

#### REQUIRED!!
  
  * @param  {string} `containerclass` The class containing the items that should be flipped (.main in the example markup)
  * @param  {string} `headerclass`    The class of the top portion of the flipbook (.header) in the example
  * @param  {string} `summaryclass`   The class of the bottom portion of the flipbook (.summary) in the example
  
#### (OPTIONAL) 
  * @param  {string} `heightmodifier` EXPERIMENTAL!!!! If you want to slow down or speed up the scroll.
  * @param  {int}    `perspective`    Defauly is 0, Don't use px. The CSS perspective on the flipping cards.
  * @param  {array}  `excludeitems`   An array of classnames (strings) you wish to exclude
  
  
