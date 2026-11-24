// Splash-screen icon loader: fetches small static PNGs (public/splash/*.png), strips their
// near-white background at runtime via flood-fill (border-in, so it can't eat into the subject),
// crops to the opaque bounds, and draws the result onto the matching <canvas id="sp-...">.
//
// These used to be inlined as base64 strings directly in this file (~1.2MB of JS, fetched eagerly
// on every app load for a splash animation). Moved to real static files under public/splash/ so
// they're normal cacheable network requests instead of JS payload that has to be parsed/held in
// memory as a string. SP_AVO (the largest one, ~275KB) was dropped entirely: the avocado slot in
// the splash screen is now rendered by the avo-animation.mp4 video (see SplashScreen in App.jsx),
// and no element with id="sp-avo" exists anymore — it was dead weight.
function _spRemoveBg(c,thr){
  var ctx=c.getContext('2d'),W=c.width,H=c.height;
  var id=ctx.getImageData(0,0,W,H),d=id.data;
  var vis=new Uint8Array(W*H),q=[];
  function ok(i4){return d[i4]>thr&&d[i4+1]>thr&&d[i4+2]>thr;}
  function seed(x,y){var i=y*W+x;if(!vis[i]&&ok(i*4)){vis[i]=1;q.push(i);}}
  for(var bx=0;bx<W;bx++){seed(bx,0);seed(bx,H-1);}
  for(var by=1;by<H-1;by++){seed(0,by);seed(W-1,by);}
  while(q.length){
    var i=q.pop();d[i*4+3]=0;
    var x=i%W,y=(i-x)/W;
    if(x>0)seed(x-1,y);if(x<W-1)seed(x+1,y);
    if(y>0)seed(x,y-1);if(y<H-1)seed(x,y+1);
  }
  for(var j=0;j<d.length;j+=4){
    if(d[j+3]===0)continue;
    var r=d[j],g=d[j+1],b=d[j+2];
    if(r>200&&g>200&&b>200)d[j+3]=Math.round((255-(r+g+b)/3)*4);
  }
  ctx.putImageData(id,0,0);
}
function _spCropBounds(c){
  var ctx=c.getContext('2d'),W=c.width,H=c.height,d=ctx.getImageData(0,0,W,H).data;
  var x0=W,x1=0,y0=H,y1=0;
  for(var y=0;y<H;y++)for(var x=0;x<W;x++){
    if(d[(y*W+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  }
  if(x0>=x1||y0>=y1)return c;
  var p=6,sw=x1-x0+1+p*2,sh=y1-y0+1+p*2;
  var dst=document.createElement('canvas');dst.width=sw;dst.height=sh;
  dst.getContext('2d').drawImage(c,x0-p,y0-p,sw,sh,0,0,sw,sh);
  return dst;
}
function _spScale(src,dstId,sz){
  var c=document.getElementById(dstId),W=src.width,H=src.height,s=Math.min(sz/W,sz/H);
  var dw=W*s,dh=H*s;c.width=sz;c.height=sz;
  c.getContext('2d').drawImage(src,0,0,W,H,(sz-dw)/2,(sz-dh)/2,dw,dh);
}
function _spLoadIcon(url,id,sz,thr){
  var img=new Image();
  img.onload=function(){
    var t=document.createElement('canvas');
    t.width=img.naturalWidth;t.height=img.naturalHeight;
    t.getContext('2d').drawImage(img,0,0);
    _spRemoveBg(t,thr);t=_spCropBounds(t);_spScale(t,id,sz);
  };
  img.src=url;
}
function _spLoadBubble(url,id){
  var img=new Image();
  img.onload=function(){
    var t=document.createElement('canvas');
    t.width=img.naturalWidth;t.height=img.naturalHeight;
    t.getContext('2d').drawImage(img,0,0);
    _spRemoveBg(t,235);t=_spCropBounds(t);
    var c=document.getElementById(id);c.width=t.width;c.height=t.height;
    c.getContext('2d').drawImage(t,0,0);
  };
  img.src=url;
}
window._loadSplashImages=function(){
  _spLoadIcon('/Nutrition/splash/cup.png?v=1',  'sp-cup',  64,238);
  _spLoadIcon('/Nutrition/splash/salad.png?v=1','sp-salad',64,238);
  _spLoadIcon('/Nutrition/splash/dumb.png?v=1', 'sp-dumb', 64,238);
  _spLoadIcon('/Nutrition/splash/tape.png?v=1', 'sp-tape', 64,238);
  _spLoadIcon('/Nutrition/splash/leaf.png?v=1', 'sp-leaf', 64,238);
  _spLoadIcon('/Nutrition/splash/heart.png?v=1','sp-heart',64,238);
  _spLoadBubble('/Nutrition/splash/bubble.png?v=1','sp-bubble');
};
