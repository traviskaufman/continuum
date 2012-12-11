var min = Math.min,
    max = Math.max;

function fillRect(x, y, w, h) {
  var minX = x > 0 ? x / 100 | 0 : 0,
      minY = y > 0 ? y / 50 | 0 : 0,
      maxX = min((x + w) / 100 | 0, this.bisected[0].length - 1),
      maxY = min((y + h) / 50 | 0, this.bisected.length - 1);

  for (var py = minY; py <= maxY; py++) {
    for (var px = minX; px <= maxX; px++) {
      var sub = this.bisected[py][px];
      for (var iy = max(y - py * 50, 0); iy < y + h - py * 50 && iy < 50; iy++) {
        for (var ix = max(x - px * 100, 0); ix < x + w - px * 100 && ix < 100; ix++) {
          var offset = (49 - iy % 50) * 100 + ix % 100;
          sub.queue[offset] = offset;
          for (var i = 0; i < 4; i++) {
            sub.pixels[offset * 4 + i] = this.fillStyleValue[i];
          }
        }
      }
      sub.dirty = true;
    }
  }

  this.context.requestUpdate();
}

function createCanvasElement(){
  var canvas = document.createElement('canvas'),
      style = canvas.style;
  style.position = 'relative';
  style.overflow = 'hidden';
  style.display = 'inline-block';
  canvas.container = canvas;
  canvas.context = null;
  canvas.width = 0;
  canvas.height = 0;
  canvas.parts = null;
  canvas.scheduledUpdate = null;
  canvas.fillStyleType = 0;
  canvas.fillStyleValue = null;
}

inherit(HTMLCanvasElement, HTMLElement, [
  function setFillStyle(v) {
    this.fillStyleType = 0;
    this.fillStyleValue = this.parseColor(v);
    this.context.fillStyle = 'rgba(' + this.fillStyleValue + ')';
  },
  function setWidth(v){
    this.destroy();
    this.init(v, this.height);
  },
  function setHeight(v){
    this.destroy();
    this.init(this.width, v);
  }
]);

var base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var base64Pairs = [];

for (var i = 0; i < 4096; i++) {
  base64Pairs[i] = base64Chars[i >> 6] + base64Chars[i & 63];
}



function CanvasRenderingContext2D(width, height, canvas){
  this.computed = canvas.currentStyle;
  this.style = canvas.style;
  this.canvas = canvas;
  this.width(width);
  this.height(height);
  this.bisected = [];
  this.fillStyleType = 0;
  this.fillStyleValue = [0, 0, 0, 255];

  var w = width / 100 + 1 | 0,
      h = height / 50 + 1 | 0,
      wr = width % 100,
      hr = height % 50;

  for (var y=0; y < h; y++) {
    var row = this.bisected[this.bisected.length] = [];
    for (var x=0; x < w; x++) {
      var sub = row[row.length] = new Renderer(x, y, wr && x === w - 1 ? wr : 100, hr && y === h - 1 ? hr : 50);
      this.canvas.appendChild(sub.element);
    }
  }
}

define(CanvasRenderingContext2D.prototype, [
  function height(v){
    if (v === undefined) {
      return parseFloat(this.computed.height);
    } else {
      this.style.height = v + 'px';
    }
  },
  function width(v){
    if (v === undefined) {
      return parseFloat(this.computed.width);
    } else {
      this.style.width = v + 'px';
    }
  },
  function destroy(){
    for (var x = 0; x < this.bisected.length; x++) {
      for (var y = 0; y < this.bisected[x].length; y++) {
        var node = this.bisected[x][y].element;
        node.parentNode.removeChild(node);
      }
      this.bisected[x].length = 0;
    }
    this.bisected.length = 0;
  },
  function update(){
    var w = this.bisected.length;
    for (var x = 0; x < w; x++) {
      var h = this.bisected[x].length;
      for (var y = 0; y < h; y++) {
        var sub = this.bisected[x][y];
        if (sub.dirty) {
          for (var pixel in sub.queue) {
            var r = sub.queue[pixel],
                o = r << 2,
                b = sub.pixels[o + 2] << 16 | sub.pixels[o + 1] << 8 | sub.pixels[o];
            sub.encoded[r] = base64Pairs[b >> 12] + base64Pairs[b & 4095];
          }
          sub.queue = {};
          sub.element.src = sub.header + sub.encoded.join('');
        }
      }
    }
    this.scheduled = false;
  },
  function setPixel(x, y, r, g, b, a) {
    var sub = this.bisected[y / 50 | 0][x / 100 | 0],
        o = (49 - y % 50) * 100 + x % 100,
        pixels = sub.pixels;

    sub.dirty = true;
    sub.queue[o] = o;
    o *= 4;
    pixels[o++] = r;
    pixels[o++] = g;
    pixels[o++] = b;
    pixels[o] = a;

    this.requestUpdate();
  },
  function requestUpdate(){
    if (!this.scheduled) {
      this.scheduled = true;
      var self = this;
      setTimeout(function(){ self.update() }, 0);
    }
  }
]);


var pixels = [],
    encoded = [];

for (var i = 0; i < 20000; i++) {
  pixels[pixels.length] = 255;
}

for (var i = 0; i < 5000; i++) {
  encoded[encoded.length] = '////';
}

function Renderer(x, y, w, h){
  this.width = w;
  this.height = h;
  this.pixels = pixels.slice();
  this.encoded = encoded.slice();
  this.header = 'data:image/bmp;base64,Qk0aWAAAAAAAADYAAAAoAAAAZAAAADIAAAABABgAAAAAAJg6AAATCwAAEwsAAAAAAAAAAAAA';
  this.dirty = false;
  this.queue = {};
  this.element = document.createElement('img');
  var style = this.element.style;
  style.position = 'absolute';
  style.left = x + 'px';
  style.top = y + 'px';
  style.width = '100px';
  style.height = '50px';
  this.element.src = this.header + this.encoded.join('');
}

function rgbClamp(v){
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}
var rgb = /(?:(hsl|rgb)a?\(([\d.]+)\s*,\s*([\d.]+\%?)\s*,\s*([\d.]+\%?)\s*(?:,\s*([\d.]+)\s*)?\))/;
var hex = /(#[a-f0-9]{3}(?:[a-f0-9]{3})?)/;


function hsl2rgb(h, s, l){
  var a = h / 60, b = s, c = l;
  b=[c+=b*=c<.5 ? c : 1-c, c-a%1*b*2, c-=b*=2, c, c+a%1*b, c+b];
  return [(b[~~a % 6] / 255 + .5) | 0, (b[(a|16)%6] / 255 + .5) | 0, (b[(a|8)%6] / 255 + .5) | 0];
}

function interpretColor(v){
  if (typeof v === 'string') {
    if (v[0] === '#') {
      if (v.length === 4)
        v = '#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
      v = ('0x' + v.slice(1)) | 0;
      return [v >> 16, v >> 8 & 255, v & 255, 1];
    } else {
      var match = rgb.exec(v);
      if (match) {
        if (match[1] === 'rgb')
          return [rgbClamp(match[2]), rgbClamp(match[3]), rgbClamp(match[4]), match[5] == null ? 1 : match[5]];
        else if (match[1] === 'hsl') {
          return hsl2rgb(match[2], match[3], match[4]);
        }
      }
    }
  }
}



class HitRegionOptions {
  constructor(dict) {
    dict = dict || EMPTY;
    this.path = 'path' in dict ? dict.path : '';
    this.id = 'id' in dict ? dict.id : '';
    this.parentID = 'parentID' in dict ? dict.parentID : '';
    this.cursor = 'cursor' in dict ? dict.cursor : 'inherit';
    this.control = 'control' in dict ? dict.control : '';
    this.label = 'label' in dict ? dict.label : '';
    this.role = 'role' in dict ? dict.role : '';
  }
}

export class CanvasGradient {
  addColorStop(offset, color) {
    CALL(this.@wrapped, 'addColorStop', +offset || 0, '' + color);
  }
}

export class CanvasPattern {
  setTransform(transform) {
    CALL(this.@wrapped, 'setTransform', UNWRAP(transform));
  }
}


export class ImageData {
  get width() {
    return GET(this.@wrapped, 'width');
  }
  get height() {
    return GET(this.@wrapped, 'height');
  }
  get data() {
    return WRAP(GET(this.@wrapped, 'data'));
  }
}

export class Path {
  constructor(d) {
    this.@wrapped = CONSTRUCT(Path, '' + d);
  }
  addPath(path, transformation) {
    CALL(this.@wrapped, 'addPath', UNWRAP(path), UNWRAP(transformation));
  }
  addPathByStrokingPath(path, styles, transformation) {
    CALL(this.@wrapped, 'addPathByStrokingPath', UNWRAP(path), UNWRAP(styles), UNWRAP(transformation));
  }
  addText(text, styles, transformation, x, y, maxWidth, path) {
    CALL(this.@wrapped, 'addText', '' + text, UNWRAP(styles), UNWRAP(transformation), +x || 0, +y || 0, +maxWidth || 0, UNWRAP(path));
  }
  addPathByStrokingText(text, styles, transformation, x, y, maxWidth, path) {
    CALL(this.@wrapped, 'addPathByStrokingText', '' + text, UNWRAP(styles), UNWRAP(transformation), +x || 0, +y || 0, +maxWidth || 0, UNWRAP(path));
  }
  closePath() {
    CALL(this.@wrapped, 'closePath');
  }
  moveTo(x, y) {
    CALL(this.@wrapped, 'moveTo', +x || 0, +y || 0);
  }
  lineTo(x, y) {
    CALL(this.@wrapped, 'lineTo', +x || 0, +y || 0);
  }
  quadraticCurveTo(cpx, cpy, x, y) {
    CALL(this.@wrapped, 'quadraticCurveTo', +cpx || 0, +cpy || 0, +x || 0, +y || 0);
  }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    CALL(this.@wrapped, 'bezierCurveTo', +cp1x || 0, +cp1y || 0, +cp2x || 0, +cp2y || 0, +x || 0, +y || 0);
  }
  arcTo(x1, y1, x2, y2, radius, radiusX, radiusY, rotation) {
    CALL(this.@wrapped, 'arcTo', +x1 || 0, +y1 || 0, +x2 || 0, +y2 || 0, +radius || 0, +radiusX || 0, +radiusY || 0, +rotation || 0);
  }
  rect(x, y, w, h) {
    CALL(this.@wrapped, 'rect', +x || 0, +y || 0, +w || 0, +h || 0);
  }
  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    CALL(this.@wrapped, 'arc', +x || 0, +y || 0, +radius || 0, +startAngle || 0, +endAngle || 0, !!anticlockwise);
  }
  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
    CALL(this.@wrapped, 'ellipse', +x || 0, +y || 0, +radiusX || 0, +radiusY || 0, +rotation || 0, +startAngle || 0, +endAngle || 0, !!anticlockwise);
  }
}

private @lineWidth, @lineCap, @lineJoin, @miterLimit, @lineDashOffset,
        @font, @textAlign, @textBaseline, @direction, @lineDash;

const lineCap      = { butt: 'butt', round: 'round', square: 'square' };
const lineJoin     = { bevel: 'bevel', round: 'round', miter: 'miter' };
const textAlign    = { start: 'start', end: 'end', left: 'left', right: 'right', center: 'center' };
const textBaseline = { alphabetic: 'alphabetic',  top: 'top', hanging: 'hanging',
                       middle: 'middle', ideographic: 'ideographic',  bottom: 'bottom' };
const direction    = { inherit: 'inherit', ltr: 'ltr', rtl: 'rtl' }

lineJoin.__proto__ = lineCap.__proto__ = textBasline.__proto__ = direction.__proto__ = textAlign.__proto__ = null;

function initDrawingStyles(obj, scope){
  obj.@lineCap = 'butt';
  obj.@lineWidth = 1.0;
  obj.@miterLimit = 10.0;
  obj.@lineJoin = 'miter';
  obj.@textAlign = 'start';
  obj.@textBaline = 'alphabetic';
  obj.@direction = 'inherit';
  obj.@lineDash = [];
  obj.@lineDashOffset = 0.0;
}


export class DrawingStyle {
  constructor(scope) {
    initDrawingStyles(this, scope);
  }
  get lineWidth() {
    return this.@lineWidth;
  }
  set lineWidth(v) {
    v = +v;
    if (v === v && v !== Infinity && v >= 0) {
      this.@lineWidth = v;
    }
  }
  get lineCap() {
    return this.@lineCap;
  }
  set lineCap(v) {
    if (v in lineCap) {
      this.@lineCap = v;
    }
  }
  get lineJoin() {
    return this.@lineJoin;
  }
  set lineJoin(v) {
    if (v in lineJoin) {
      this.@lineJoin = v;
    }
  }
  get miterLimit() {
    return this.@miterLimit;
  }
  set miterLimit(v) {
    v = +v;
    if (v === v && v < Infinity && v >= 0) {
      this.@miterLimit = v;
    }
  }
  get lineDashOffset() {
    return this.@lineDashOffset;
  }
  set lineDashOffset(v) {
    v = +v;
    if (v === v && v !== Infinity && v !== -Infinity) {
      this.@lineDashOffset = v;
    }
  }
  get font() {
    return this.@font;
  }
  set font(v) {
    this.@font = v;
  }
  get textAlign() {
    return this.@textAlign;
  }
  set textAlign(v) {
    if (v in textAlign) {
      this.@textAlign = v;
    }
  }
  get textBaseline() {
    return this.@textBaseline;
  }
  set textBaseline(v) {
    if (v in textBaseline) {
      this.@textBaseline = v;
    }
  }
  get direction() {
    return this.@direction;
  }
  set direction(v) {
    if (v in direction) {
      this.@direction = v;
    }
  }
  setLineDash(segments) {
    var len = segments.length,
        segs = [];

    for (var i=0; i < len; i++) {
      var val = segments[i];
      if (val == null || val !== val || val === Infinity || val < 0) {
        return;
      }
      segs[i] = val;
    }
    if (len % 2) {
      segs = segs.concat(segs);
    }
    this.@lineDash = segs;
  }
  getLineDash() {
    return this.@lineDash.slice();
  }
}


private @width, @height;

export class CanvasRenderingContext2D {

  constructor(width, height) {
    initDrawingStyles(this);
    this.@width = width;
    this.@height = height;
  }
  get width() {
    return this.@width;
  }
  set width(v) {
    this.@width =
  }
  get height() {
    return GET(this.@wrapped, 'height');
  }
  set height(v) {
    SET(this.@wrapped, 'height', v >>> 0);
  }
  get currentTransform() {
    return WRAP(GET(this.@wrapped, 'currentTransform'));
  }
  set currentTransform(v) {
    SET(this.@wrapped, 'currentTransform', UNWRAP(v));
  }
  get globalAlpha() {
    return GET(this.@wrapped, 'globalAlpha');
  }
  set globalAlpha(v) {
    SET(this.@wrapped, 'globalAlpha', +v || 0);
  }
  get globalCompositeOperation() {
    return GET(this.@wrapped, 'globalCompositeOperation');
  }
  set globalCompositeOperation(v) {
    SET(this.@wrapped, 'globalCompositeOperation', '' + v);
  }
  get imageSmoothingEnabled() {
    return GET(this.@wrapped, 'imageSmoothingEnabled');
  }
  set imageSmoothingEnabled(v) {
    SET(this.@wrapped, 'imageSmoothingEnabled', !!v);
  }
  get strokeStyle() {
    return WRAP(GET(this.@wrapped, 'strokeStyle'));
  }
  set strokeStyle(v) {
    SET(this.@wrapped, 'strokeStyle', UNWRAP(v));
  }
  get fillStyle() {
    return WRAP(GET(this.@wrapped, 'fillStyle'));
  }
  set fillStyle(v) {
    SET(this.@wrapped, 'fillStyle', UNWRAP(v));
  }
  get shadowOffsetX() {
    return GET(this.@wrapped, 'shadowOffsetX');
  }
  set shadowOffsetX(v) {
    SET(this.@wrapped, 'shadowOffsetX', +v || 0);
  }
  get shadowOffsetY() {
    return GET(this.@wrapped, 'shadowOffsetY');
  }
  set shadowOffsetY(v) {
    SET(this.@wrapped, 'shadowOffsetY', +v || 0);
  }
  get shadowBlur() {
    return GET(this.@wrapped, 'shadowBlur');
  }
  set shadowBlur(v) {
    SET(this.@wrapped, 'shadowBlur', +v || 0);
  }
  get shadowColor() {
    return GET(this.@wrapped, 'shadowColor');
  }
  set shadowColor(v) {
    SET(this.@wrapped, 'shadowColor', '' + v);
  }
  get canvas() {
    return WRAP(GET(this.@wrapped, 'canvas'));
  }
  commit() {
    CALL(this.@wrapped, 'commit');
  }
  save() {
    CALL(this.@wrapped, 'save');
  }
  restore() {
    CALL(this.@wrapped, 'restore');
  }
  scale(x, y) {
    CALL(this.@wrapped, 'scale', +x || 0, +y || 0);
  }
  rotate(angle) {
    CALL(this.@wrapped, 'rotate', +angle || 0);
  }
  translate(x, y) {
    CALL(this.@wrapped, 'translate', +x || 0, +y || 0);
  }
  transform(a, b, c, d, e, f) {
    CALL(this.@wrapped, 'transform', +a || 0, +b || 0, +c || 0, +d || 0, +e || 0, +f || 0);
  }
  setTransform(a, b, c, d, e, f) {
    CALL(this.@wrapped, 'setTransform', +a || 0, +b || 0, +c || 0, +d || 0, +e || 0, +f || 0);
  }
  resetTransform() {
    CALL(this.@wrapped, 'resetTransform');
  }
  createLinearGradient(x0, y0, x1, y1) {
    return WRAP(CALL(this.@wrapped, 'createLinearGradient', +x0 || 0, +y0 || 0, +x1 || 0, +y1 || 0));
  }
  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return WRAP(CALL(this.@wrapped, 'createRadialGradient', +x0 || 0, +y0 || 0, +r0 || 0, +x1 || 0, +y1 || 0, +r1 || 0));
  }
  createPattern(image, repetition) {
    return WRAP(CALL(this.@wrapped, 'createPattern', UNWRAP(image), '' + repetition));
  }
  clearRect(x, y, w, h) {
    CALL(this.@wrapped, 'clearRect', +x || 0, +y || 0, +w || 0, +h || 0);
  }
  fillRect(x, y, w, h) {
    CALL(this.@wrapped, 'fillRect', +x || 0, +y || 0, +w || 0, +h || 0);
  }
  strokeRect(x, y, w, h) {
    CALL(this.@wrapped, 'strokeRect', +x || 0, +y || 0, +w || 0, +h || 0);
  }
  beginPath() {
    CALL(this.@wrapped, 'beginPath');
  }
  fill(path) {
    CALL(this.@wrapped, 'fill', UNWRAP(path));
  }
  stroke(path) {
    CALL(this.@wrapped, 'stroke', UNWRAP(path));
  }
  drawSystemFocusRing(element, path) {
    CALL(this.@wrapped, 'drawSystemFocusRing', UNWRAP(element), UNWRAP(path));
  }
  drawCustomFocusRing(element, path) {
    return CALL(this.@wrapped, 'drawCustomFocusRing', UNWRAP(element), UNWRAP(path));
  }
  scrollPathIntoView(path) {
    CALL(this.@wrapped, 'scrollPathIntoView', UNWRAP(path));
  }
  clip(path) {
    CALL(this.@wrapped, 'clip', UNWRAP(path));
  }
  resetClip() {
    CALL(this.@wrapped, 'resetClip');
  }
  isPointInPath(x, y, path) {
    return CALL(this.@wrapped, 'isPointInPath', +x || 0, +y || 0, UNWRAP(path));
  }
  fillText(text, x, y, maxWidth) {
    CALL(this.@wrapped, 'fillText', '' + text, +x || 0, +y || 0, +maxWidth || 0);
  }
  strokeText(text, x, y, maxWidth) {
    CALL(this.@wrapped, 'strokeText', '' + text, +x || 0, +y || 0, +maxWidth || 0);
  }
  measureText(text) {
    return WRAP(CALL(this.@wrapped, 'measureText', '' + text));
  }
  drawImage(image, dx, dy, dw, dh, sx, sy, sw, sh) {
    CALL(this.@wrapped, 'drawImage', UNWRAP(image), +dx || 0, +dy || 0, +dw || 0, +dh || 0, +sx || 0, +sy || 0, +sw || 0, +sh || 0);
  }
  addHitRegion(options) {
    CALL(this.@wrapped, 'addHitRegion', new HitRegionOptions(options));
  }
  removeHitRegion(options) {
    CALL(this.@wrapped, 'removeHitRegion', new HitRegionOptions(options));
  }
  createImageData(sw, sh, imagedata) {
    return WRAP(CALL(this.@wrapped, 'createImageData', +sw || 0, +sh || 0, UNWRAP(imagedata)));
  }
  createImageDataHD(sw, sh) {
    return WRAP(CALL(this.@wrapped, 'createImageDataHD', +sw || 0, +sh || 0));
  }
  getImageData(sx, sy, sw, sh) {
    return WRAP(CALL(this.@wrapped, 'getImageData', +sx || 0, +sy || 0, +sw || 0, +sh || 0));
  }
  getImageDataHD(sx, sy, sw, sh) {
    return WRAP(CALL(this.@wrapped, 'getImageDataHD', +sx || 0, +sy || 0, +sw || 0, +sh || 0));
  }
  putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    CALL(this.@wrapped, 'putImageData', UNWRAP(imagedata), +dx || 0, +dy || 0, +dirtyX || 0, +dirtyY || 0, +dirtyWidth || 0, +dirtyHeight || 0);
  }
  putImageDataHD(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    CALL(this.@wrapped, 'putImageDataHD', UNWRAP(imagedata), +dx || 0, +dy || 0, +dirtyX || 0, +dirtyY || 0, +dirtyWidth || 0, +dirtyHeight || 0);
  }
  closePath() {
    CALL(this.@wrapped, 'closePath');
  }
  moveTo(x, y) {
    CALL(this.@wrapped, 'moveTo', +x || 0, +y || 0);
  }
  lineTo(x, y) {
    CALL(this.@wrapped, 'lineTo', +x || 0, +y || 0);
  }
  quadraticCurveTo(cpx, cpy, x, y) {
    CALL(this.@wrapped, 'quadraticCurveTo', +cpx || 0, +cpy || 0, +x || 0, +y || 0);
  }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    CALL(this.@wrapped, 'bezierCurveTo', +cp1x || 0, +cp1y || 0, +cp2x || 0, +cp2y || 0, +x || 0, +y || 0);
  }
  arcTo(x1, y1, x2, y2, radius, radiusX, radiusY, rotation) {
    CALL(this.@wrapped, 'arcTo', +x1 || 0, +y1 || 0, +x2 || 0, +y2 || 0, +radius || 0, +radiusX || 0, +radiusY || 0, +rotation || 0);
  }
  rect(x, y, w, h) {
    CALL(this.@wrapped, 'rect', +x || 0, +y || 0, +w || 0, +h || 0);
  }
  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    CALL(this.@wrapped, 'arc', +x || 0, +y || 0, +radius || 0, +startAngle || 0, +endAngle || 0, !!anticlockwise);
  }
  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
    CALL(this.@wrapped, 'ellipse', +x || 0, +y || 0, +radiusX || 0, +radiusY || 0, +rotation || 0, +startAngle || 0, +endAngle || 0, !!anticlockwise);
  }
}


for (let [i, key] of Object.getOwnPropertyNames(DrawingStyle.prototype)) {
  if (key !== 'constructor') {
    Object.defineProperty(CanvasRenderingContext2D.prototype, Object.getOwnPropertyDescriptor(DrawingStyle.prototype));
  }
}
