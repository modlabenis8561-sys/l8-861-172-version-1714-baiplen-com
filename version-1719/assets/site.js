(function(){
  var toggles=document.querySelectorAll('.menu-toggle');
  toggles.forEach(function(btn){btn.addEventListener('click',function(){var links=document.querySelector('.nav-links');if(links){links.classList.toggle('open');}});});
  var hero=document.querySelector('.hero');
  if(hero){
    var slides=[].slice.call(hero.querySelectorAll('.hero-slide'));
    var dots=[].slice.call(hero.querySelectorAll('.hero-dots button'));
    var index=0;
    function show(i){if(!slides.length)return;index=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('active',n===index);});dots.forEach(function(d,n){d.classList.toggle('active',n===index);});}
    var next=hero.querySelector('.hero-arrow.next');
    var prev=hero.querySelector('.hero-arrow.prev');
    if(next)next.addEventListener('click',function(){show(index+1);});
    if(prev)prev.addEventListener('click',function(){show(index-1);});
    dots.forEach(function(dot,n){dot.addEventListener('click',function(){show(n);});});
    show(0);
    setInterval(function(){show(index+1);},5000);
  }
  var inputs=document.querySelectorAll('.filter-input');
  inputs.forEach(function(input){
    var scope=input.closest('.filter-scope')||document;
    var cards=[].slice.call(scope.querySelectorAll('.movie-card'));
    var empty=scope.querySelector('.empty-state');
    function run(){
      var q=(input.value||'').trim().toLowerCase();
      var shown=0;
      cards.forEach(function(card){
        var text=(card.getAttribute('data-search')||card.textContent||'').toLowerCase();
        var ok=!q||text.indexOf(q)>-1;
        card.style.display=ok?'':'none';
        if(ok)shown++;
      });
      if(empty)empty.classList.toggle('show',shown===0);
    }
    input.addEventListener('input',run);
  });
})();