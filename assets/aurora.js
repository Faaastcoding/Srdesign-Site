/* Fond animé "aurora" — version optimisée mobile.
   Rendu en basse résolution (mis à l'échelle par CSS, invisible car flou),
   dégradés pré-rendus une seule fois en sprites, ~30 fps. Léger sur le CPU. */
(function(){
  var cv=document.getElementById('aurora');if(!cv)return;
  var ctx=cv.getContext('2d');
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var SCALE=0.4, W=1, H=1;              // backing store réduit → coût de remplissage /6
  function size(){
    W=Math.max(1,Math.round(innerWidth*SCALE));
    H=Math.max(1,Math.round(innerHeight*SCALE));
    cv.width=W;cv.height=H;
    cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';
  }
  size();
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){size();if(reduce)draw(0);},200);});

  var cols=[[56,189,248],[59,130,246],[37,99,235]];
  var SPR=256;                          // dégradé pré-rendu une fois par couleur
  var sprites=cols.map(function(c){
    var o=document.createElement('canvas');o.width=o.height=SPR;
    var oc=o.getContext('2d'),g=oc.createRadialGradient(SPR/2,SPR/2,0,SPR/2,SPR/2,SPR/2);
    g.addColorStop(0,'rgba('+c[0]+','+c[1]+','+c[2]+',0.16)');
    g.addColorStop(1,'rgba('+c[0]+','+c[1]+','+c[2]+',0)');
    oc.fillStyle=g;oc.fillRect(0,0,SPR,SPR);
    return o;
  });

  var blobs=[];for(var i=0;i<5;i++){blobs.push({x:Math.random(),y:Math.random(),
    r:.3+Math.random()*.35,s:sprites[i%3],px:Math.random()*6.28,py:Math.random()*6.28,
    sx:.00013+Math.random()*.0002,sy:.00013+Math.random()*.0002});}

  function draw(t){
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    var m=Math.max(W,H);
    for(var i=0;i<blobs.length;i++){var b=blobs[i];
      var x=(b.x+Math.sin(t*b.sx+b.px)*.18)*W,
          y=(b.y+Math.cos(t*b.sy+b.py)*.18)*H,
          R=b.r*m;
      ctx.drawImage(b.s,x-R,y-R,R*2,R*2);   // pas de createRadialGradient par frame
    }
    ctx.globalCompositeOperation='source-over';
  }

  if(reduce){draw(0);return;}
  var last=0, MIN=1000/30;                 // plafond ~30 fps (le mouvement est très lent)
  (function frame(t){
    requestAnimationFrame(frame);
    if(t-last<MIN)return; last=t;
    draw(t);
  })(0);
})();
