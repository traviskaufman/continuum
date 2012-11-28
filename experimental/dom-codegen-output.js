module DOM {
  export class Attr {
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', '' + v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    get namespaceURI() {
      return GET(this.@wrapped, 'namespaceURI');
    }
    get prefix() {
      return GET(this.@wrapped, 'prefix');
    }
    get localName() {
      return GET(this.@wrapped, 'localName');
    }
  }
  export class DOMError {
    get name() {
      return GET(this.@wrapped, 'name');
    }
  }
  export class DOMException {
    get code() {
      return GET(this.@wrapped, 'code');
    }
  }
  constants(DOMException, {
    INDEX_SIZE_ERR: 1,
    DOMSTRING_SIZE_ERR: 2,
    HIERARCHY_REQUEST_ERR: 3,
    WRONG_DOCUMENT_ERR: 4,
    INVALID_CHARACTER_ERR: 5,
    NO_DATA_ALLOWED_ERR: 6,
    NO_MODIFICATION_ALLOWED_ERR: 7,
    NOT_FOUND_ERR: 8,
    NOT_SUPPORTED_ERR: 9,
    INUSE_ATTRIBUTE_ERR: 10,
    INVALID_STATE_ERR: 11,
    SYNTAX_ERR: 12,
    INVALID_MODIFICATION_ERR: 13,
    NAMESPACE_ERR: 14,
    INVALID_ACCESS_ERR: 15,
    VALIDATION_ERR: 16,
    TYPE_MISMATCH_ERR: 17,
    SECURITY_ERR: 18,
    NETWORK_ERR: 19,
    ABORT_ERR: 20,
    URL_MISMATCH_ERR: 21,
    QUOTA_EXCEEDED_ERR: 22,
    TIMEOUT_ERR: 23,
    INVALID_NODE_TYPE_ERR: 24,
    DATA_CLONE_ERR: 25
  });
  export class DOMImplementation {
    createDocumentType(qualifiedName, publicId, systemId) {
      return WRAP(CALL(this.@wrapped, 'createDocumentType', '' + qualifiedName, '' + publicId, '' + systemId));
    }
    createDocument(namespace, qualifiedName, doctype) {
      return WRAP(CALL(this.@wrapped, 'createDocument', '' + namespace, '' + qualifiedName, UNWRAP(doctype)));
    }
    createHTMLDocument(title) {
      return WRAP(CALL(this.@wrapped, 'createHTMLDocument', '' + title));
    }
    hasFeature(feature, version) {
      return CALL(this.@wrapped, 'hasFeature', '' + feature, '' + version);
    }
  }
  export class DOMStringList {
    item(index) {
      return CALL(this.@wrapped, 'item', index >>> 0);
    }
    contains(string) {
      return CALL(this.@wrapped, 'contains', '' + string);
    }
  }
  export class DOMTokenList {
    item(index) {
      return CALL(this.@wrapped, 'item', index >>> 0);
    }
    contains(token) {
      return CALL(this.@wrapped, 'contains', '' + token);
    }
    add(token) {
      CALL(this.@wrapped, 'add', '' + token);
    }
    remove(token) {
      CALL(this.@wrapped, 'remove', '' + token);
    }
    toggle(token) {
      return CALL(this.@wrapped, 'toggle', '' + token);
    }
    toString() {
      return CALL(this.@wrapped, 'toString');
    }
  }
  export class Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(Event, '' + type, new EventInit(eventInitDict));
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    get target() {
      return WRAP(GET(this.@wrapped, 'target'));
    }
    get currentTarget() {
      return WRAP(GET(this.@wrapped, 'currentTarget'));
    }
    get eventPhase() {
      return GET(this.@wrapped, 'eventPhase');
    }
    get bubbles() {
      return GET(this.@wrapped, 'bubbles');
    }
    get cancelable() {
      return GET(this.@wrapped, 'cancelable');
    }
    get defaultPrevented() {
      return GET(this.@wrapped, 'defaultPrevented');
    }
    get isTrusted() {
      return GET(this.@wrapped, 'isTrusted');
    }
    get timeStamp() {
      return toUint64(GET(this.@wrapped, 'timeStamp'));
    }
    stopPropagation() {
      CALL(this.@wrapped, 'stopPropagation');
    }
    stopImmediatePropagation() {
      CALL(this.@wrapped, 'stopImmediatePropagation');
    }
    preventDefault() {
      CALL(this.@wrapped, 'preventDefault');
    }
    initEvent(type, bubbles, cancelable) {
      CALL(this.@wrapped, 'initEvent', '' + type, !!bubbles, !!cancelable);
    }
  }
  constants(Event, { NONE: 0, CAPTURING_PHASE: 1, AT_TARGET: 2, BUBBLING_PHASE: 3 });
  class EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      this.bubbles = 'bubbles' in dict ? dict.bubbles : false;
      this.cancelable = 'cancelable' in dict ? dict.cancelable : false;
    }
  }
  export class EventTarget {
    addEventListener(type, callback, capture) {
      CALL(this.@wrapped, 'addEventListener', '' + type, UNWRAP(callback), !!capture);
    }
    removeEventListener(type, callback, capture) {
      CALL(this.@wrapped, 'removeEventListener', '' + type, UNWRAP(callback), !!capture);
    }
    dispatchEvent(event) {
      return CALL(this.@wrapped, 'dispatchEvent', UNWRAP(event));
    }
  }
  export class HTMLCollection {
    item(index) {
      return WRAP(CALL(this.@wrapped, 'item', index >>> 0));
    }
    namedItem(name) {
      return WRAP(CALL(this.@wrapped, 'namedItem', '' + name));
    }
  }
  export class MutationObserver {
    constructor(callback) {
      this.@wrapped = CONSTRUCT(MutationObserver, CALLBACK(callback));
    }
    observe(target, options) {
      CALL(this.@wrapped, 'observe', UNWRAP(target), new MutationObserverInit(options));
    }
    disconnect() {
      CALL(this.@wrapped, 'disconnect');
    }
    takeRecords() {
      return WRAP(CALL(this.@wrapped, 'takeRecords'));
    }
  }
  class MutationObserverInit {
    constructor(dict) {
      dict = dict || EMPTY;
      this.childList = 'childList' in dict ? dict.childList : false;
      this.attributes = 'attributes' in dict ? dict.attributes : false;
      this.characterData = 'characterData' in dict ? dict.characterData : false;
      this.subtree = 'subtree' in dict ? dict.subtree : false;
      this.attributeOldValue = 'attributeOldValue' in dict ? dict.attributeOldValue : false;
      this.characterDataOldValue = 'characterDataOldValue' in dict ? dict.characterDataOldValue : false;
      this.attributeFilter = 'attributeFilter' in dict ? dict.attributeFilter : {};
    }
  }
  export class MutationRecord {
    get type() {
      return GET(this.@wrapped, 'type');
    }
    get target() {
      return WRAP(GET(this.@wrapped, 'target'));
    }
    get addedNodes() {
      return WRAP(GET(this.@wrapped, 'addedNodes'));
    }
    get removedNodes() {
      return WRAP(GET(this.@wrapped, 'removedNodes'));
    }
    get previousSibling() {
      return WRAP(GET(this.@wrapped, 'previousSibling'));
    }
    get nextSibling() {
      return WRAP(GET(this.@wrapped, 'nextSibling'));
    }
    get attributeName() {
      return GET(this.@wrapped, 'attributeName');
    }
    get attributeNamespace() {
      return GET(this.@wrapped, 'attributeNamespace');
    }
    get oldValue() {
      return GET(this.@wrapped, 'oldValue');
    }
  }
  export class Node extends EventTarget {
    get nodeValue() {
      return GET(this.@wrapped, 'nodeValue');
    }
    set nodeValue(v) {
      SET(this.@wrapped, 'nodeValue', '' + v);
    }
    get textContent() {
      return GET(this.@wrapped, 'textContent');
    }
    set textContent(v) {
      SET(this.@wrapped, 'textContent', '' + v);
    }
    get nodeType() {
      return GET(this.@wrapped, 'nodeType');
    }
    get nodeName() {
      return GET(this.@wrapped, 'nodeName');
    }
    get baseURI() {
      return GET(this.@wrapped, 'baseURI');
    }
    get ownerDocument() {
      return WRAP(GET(this.@wrapped, 'ownerDocument'));
    }
    get parentNode() {
      return WRAP(GET(this.@wrapped, 'parentNode'));
    }
    get parentElement() {
      return WRAP(GET(this.@wrapped, 'parentElement'));
    }
    get childNodes() {
      return WRAP(GET(this.@wrapped, 'childNodes'));
    }
    get firstChild() {
      return WRAP(GET(this.@wrapped, 'firstChild'));
    }
    get lastChild() {
      return WRAP(GET(this.@wrapped, 'lastChild'));
    }
    get previousSibling() {
      return WRAP(GET(this.@wrapped, 'previousSibling'));
    }
    get nextSibling() {
      return WRAP(GET(this.@wrapped, 'nextSibling'));
    }
    hasChildNodes() {
      return CALL(this.@wrapped, 'hasChildNodes');
    }
    insertBefore(node, child) {
      return WRAP(CALL(this.@wrapped, 'insertBefore', UNWRAP(node), UNWRAP(child)));
    }
    appendChild(node) {
      return WRAP(CALL(this.@wrapped, 'appendChild', UNWRAP(node)));
    }
    replaceChild(node, child) {
      return WRAP(CALL(this.@wrapped, 'replaceChild', UNWRAP(node), UNWRAP(child)));
    }
    removeChild(child) {
      return WRAP(CALL(this.@wrapped, 'removeChild', UNWRAP(child)));
    }
    normalize() {
      CALL(this.@wrapped, 'normalize');
    }
    cloneNode(deep) {
      return WRAP(CALL(this.@wrapped, 'cloneNode', !!deep));
    }
    isEqualNode(node) {
      return CALL(this.@wrapped, 'isEqualNode', UNWRAP(node));
    }
    compareDocumentPosition(other) {
      return CALL(this.@wrapped, 'compareDocumentPosition', UNWRAP(other));
    }
    contains(other) {
      return CALL(this.@wrapped, 'contains', UNWRAP(other));
    }
    lookupPrefix(namespace) {
      return CALL(this.@wrapped, 'lookupPrefix', '' + namespace);
    }
    lookupNamespaceURI(prefix) {
      return CALL(this.@wrapped, 'lookupNamespaceURI', '' + prefix);
    }
    isDefaultNamespace(namespace) {
      return CALL(this.@wrapped, 'isDefaultNamespace', '' + namespace);
    }
  }
  constants(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12,
    DOCUMENT_POSITION_DISCONNECTED: 1,
    DOCUMENT_POSITION_PRECEDING: 2,
    DOCUMENT_POSITION_FOLLOWING: 4,
    DOCUMENT_POSITION_CONTAINS: 8,
    DOCUMENT_POSITION_CONTAINED_BY: 16,
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32
  });
  export class NodeIterator {
    get root() {
      return WRAP(GET(this.@wrapped, 'root'));
    }
    get referenceNode() {
      return WRAP(GET(this.@wrapped, 'referenceNode'));
    }
    get pointerBeforeReferenceNode() {
      return GET(this.@wrapped, 'pointerBeforeReferenceNode');
    }
    get whatToShow() {
      return GET(this.@wrapped, 'whatToShow');
    }
    get filter() {
      return WRAP(GET(this.@wrapped, 'filter'));
    }
    nextNode() {
      return WRAP(CALL(this.@wrapped, 'nextNode'));
    }
    previousNode() {
      return WRAP(CALL(this.@wrapped, 'previousNode'));
    }
    detach() {
      CALL(this.@wrapped, 'detach');
    }
  }
  export class NodeList {
    item(index) {
      return WRAP(CALL(this.@wrapped, 'item', index >>> 0));
    }
  }
  export class Range {
    get startContainer() {
      return WRAP(GET(this.@wrapped, 'startContainer'));
    }
    get startOffset() {
      return GET(this.@wrapped, 'startOffset');
    }
    get endContainer() {
      return WRAP(GET(this.@wrapped, 'endContainer'));
    }
    get endOffset() {
      return GET(this.@wrapped, 'endOffset');
    }
    get collapsed() {
      return GET(this.@wrapped, 'collapsed');
    }
    get commonAncestorContainer() {
      return WRAP(GET(this.@wrapped, 'commonAncestorContainer'));
    }
    setStart(refNode, offset) {
      CALL(this.@wrapped, 'setStart', UNWRAP(refNode), offset >>> 0);
    }
    setEnd(refNode, offset) {
      CALL(this.@wrapped, 'setEnd', UNWRAP(refNode), offset >>> 0);
    }
    setStartBefore(refNode) {
      CALL(this.@wrapped, 'setStartBefore', UNWRAP(refNode));
    }
    setStartAfter(refNode) {
      CALL(this.@wrapped, 'setStartAfter', UNWRAP(refNode));
    }
    setEndBefore(refNode) {
      CALL(this.@wrapped, 'setEndBefore', UNWRAP(refNode));
    }
    setEndAfter(refNode) {
      CALL(this.@wrapped, 'setEndAfter', UNWRAP(refNode));
    }
    collapse(toStart) {
      CALL(this.@wrapped, 'collapse', !!toStart);
    }
    selectNode(refNode) {
      CALL(this.@wrapped, 'selectNode', UNWRAP(refNode));
    }
    selectNodeContents(refNode) {
      CALL(this.@wrapped, 'selectNodeContents', UNWRAP(refNode));
    }
    compareBoundaryPoints(how, sourceRange) {
      return CALL(this.@wrapped, 'compareBoundaryPoints', toInt16(how), UNWRAP(sourceRange));
    }
    deleteContents() {
      CALL(this.@wrapped, 'deleteContents');
    }
    extractContents() {
      return WRAP(CALL(this.@wrapped, 'extractContents'));
    }
    cloneContents() {
      return WRAP(CALL(this.@wrapped, 'cloneContents'));
    }
    insertNode(node) {
      CALL(this.@wrapped, 'insertNode', UNWRAP(node));
    }
    surroundContents(newParent) {
      CALL(this.@wrapped, 'surroundContents', UNWRAP(newParent));
    }
    cloneRange() {
      return WRAP(CALL(this.@wrapped, 'cloneRange'));
    }
    detach() {
      CALL(this.@wrapped, 'detach');
    }
    isPointInRange(node, offset) {
      return CALL(this.@wrapped, 'isPointInRange', UNWRAP(node), offset >>> 0);
    }
    comparePoint(node, offset) {
      return CALL(this.@wrapped, 'comparePoint', UNWRAP(node), offset >>> 0);
    }
    intersectsNode(node) {
      return CALL(this.@wrapped, 'intersectsNode', UNWRAP(node));
    }
  }
  constants(Range, { START_TO_START: 0, START_TO_END: 1, END_TO_END: 2, END_TO_START: 3 });
  export class TreeWalker {
    get currentNode() {
      return WRAP(GET(this.@wrapped, 'currentNode'));
    }
    set currentNode(v) {
      SET(this.@wrapped, 'currentNode', UNWRAP(v));
    }
    get root() {
      return WRAP(GET(this.@wrapped, 'root'));
    }
    get whatToShow() {
      return GET(this.@wrapped, 'whatToShow');
    }
    get filter() {
      return WRAP(GET(this.@wrapped, 'filter'));
    }
    parentNode() {
      return WRAP(CALL(this.@wrapped, 'parentNode'));
    }
    firstChild() {
      return WRAP(CALL(this.@wrapped, 'firstChild'));
    }
    lastChild() {
      return WRAP(CALL(this.@wrapped, 'lastChild'));
    }
    previousSibling() {
      return WRAP(CALL(this.@wrapped, 'previousSibling'));
    }
    nextSibling() {
      return WRAP(CALL(this.@wrapped, 'nextSibling'));
    }
    previousNode() {
      return WRAP(CALL(this.@wrapped, 'previousNode'));
    }
    nextNode() {
      return WRAP(CALL(this.@wrapped, 'nextNode'));
    }
  }
  export class ApplicationCache extends EventTarget {
    get onchecking() {
      return WRAP(GET(this.@wrapped, 'onchecking'));
    }
    set onchecking(v) {
      SET(this.@wrapped, 'onchecking', CALLBACK_OR_NULL(v));
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', CALLBACK_OR_NULL(v));
    }
    get onnoupdate() {
      return WRAP(GET(this.@wrapped, 'onnoupdate'));
    }
    set onnoupdate(v) {
      SET(this.@wrapped, 'onnoupdate', CALLBACK_OR_NULL(v));
    }
    get ondownloading() {
      return WRAP(GET(this.@wrapped, 'ondownloading'));
    }
    set ondownloading(v) {
      SET(this.@wrapped, 'ondownloading', CALLBACK_OR_NULL(v));
    }
    get onprogress() {
      return WRAP(GET(this.@wrapped, 'onprogress'));
    }
    set onprogress(v) {
      SET(this.@wrapped, 'onprogress', CALLBACK_OR_NULL(v));
    }
    get onupdateready() {
      return WRAP(GET(this.@wrapped, 'onupdateready'));
    }
    set onupdateready(v) {
      SET(this.@wrapped, 'onupdateready', CALLBACK_OR_NULL(v));
    }
    get oncached() {
      return WRAP(GET(this.@wrapped, 'oncached'));
    }
    set oncached(v) {
      SET(this.@wrapped, 'oncached', CALLBACK_OR_NULL(v));
    }
    get onobsolete() {
      return WRAP(GET(this.@wrapped, 'onobsolete'));
    }
    set onobsolete(v) {
      SET(this.@wrapped, 'onobsolete', CALLBACK_OR_NULL(v));
    }
    get status() {
      return GET(this.@wrapped, 'status');
    }
    update() {
      CALL(this.@wrapped, 'update');
    }
    abort() {
      CALL(this.@wrapped, 'abort');
    }
    swapCache() {
      CALL(this.@wrapped, 'swapCache');
    }
  }
  constants(ApplicationCache, { UNCACHED: 0, IDLE: 1, CHECKING: 2, DOWNLOADING: 3, UPDATEREADY: 4, OBSOLETE: 5 });
  export class AudioTrack {
    get enabled() {
      return GET(this.@wrapped, 'enabled');
    }
    set enabled(v) {
      SET(this.@wrapped, 'enabled', !!v);
    }
    get id() {
      return GET(this.@wrapped, 'id');
    }
    get kind() {
      return GET(this.@wrapped, 'kind');
    }
    get label() {
      return GET(this.@wrapped, 'label');
    }
    get language() {
      return GET(this.@wrapped, 'language');
    }
  }
  export class AudioTrackList extends EventTarget {
    get onchange() {
      return WRAP(GET(this.@wrapped, 'onchange'));
    }
    set onchange(v) {
      SET(this.@wrapped, 'onchange', CALLBACK_OR_NULL(v));
    }
    get onaddtrack() {
      return WRAP(GET(this.@wrapped, 'onaddtrack'));
    }
    set onaddtrack(v) {
      SET(this.@wrapped, 'onaddtrack', CALLBACK_OR_NULL(v));
    }
    get onremovetrack() {
      return WRAP(GET(this.@wrapped, 'onremovetrack'));
    }
    set onremovetrack(v) {
      SET(this.@wrapped, 'onremovetrack', CALLBACK_OR_NULL(v));
    }
    getTrackById(id) {
      return WRAP(CALL(this.@wrapped, 'getTrackById', '' + id));
    }
  }
  const AutoKeyword = { auto: 'auto' };
  export class BarProp {
    get visible() {
      return GET(this.@wrapped, 'visible');
    }
    set visible(v) {
      SET(this.@wrapped, 'visible', !!v);
    }
  }
  export class BeforeUnloadEvent extends Event {
    get returnValue() {
      return GET(this.@wrapped, 'returnValue');
    }
    set returnValue(v) {
      SET(this.@wrapped, 'returnValue', '' + v);
    }
  }
  const BinaryType = { blob: 'blob', arraybuffer: 'arraybuffer' };
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
  export class CanvasRenderingContext2D {
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
    get lineWidth() {
      return GET(this.@wrapped, 'lineWidth');
    }
    set lineWidth(v) {
      SET(this.@wrapped, 'lineWidth', +v || 0);
    }
    get lineCap() {
      return GET(this.@wrapped, 'lineCap');
    }
    set lineCap(v) {
      SET(this.@wrapped, 'lineCap', '' + v);
    }
    get lineJoin() {
      return GET(this.@wrapped, 'lineJoin');
    }
    set lineJoin(v) {
      SET(this.@wrapped, 'lineJoin', '' + v);
    }
    get miterLimit() {
      return GET(this.@wrapped, 'miterLimit');
    }
    set miterLimit(v) {
      SET(this.@wrapped, 'miterLimit', +v || 0);
    }
    get lineDashOffset() {
      return GET(this.@wrapped, 'lineDashOffset');
    }
    set lineDashOffset(v) {
      SET(this.@wrapped, 'lineDashOffset', +v || 0);
    }
    get font() {
      return GET(this.@wrapped, 'font');
    }
    set font(v) {
      SET(this.@wrapped, 'font', '' + v);
    }
    get textAlign() {
      return GET(this.@wrapped, 'textAlign');
    }
    set textAlign(v) {
      SET(this.@wrapped, 'textAlign', '' + v);
    }
    get textBaseline() {
      return GET(this.@wrapped, 'textBaseline');
    }
    set textBaseline(v) {
      SET(this.@wrapped, 'textBaseline', '' + v);
    }
    get canvas() {
      return WRAP(GET(this.@wrapped, 'canvas'));
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
    putImageData(imagedata, dx, dy) {
      CALL(this.@wrapped, 'putImageData', UNWRAP(imagedata), +dx || 0, +dy || 0);
    }
    putImageDataHD(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
      CALL(this.@wrapped, 'putImageDataHD', UNWRAP(imagedata), +dx || 0, +dy || 0, +dirtyX || 0, +dirtyY || 0, +dirtyWidth || 0, +dirtyHeight || 0);
    }
    setLineDash(...segments) {
      CALL(this.@wrapped, 'setLineDash');
    }
    getLineDash() {
      return WRAP(CALL(this.@wrapped, 'getLineDash'));
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
  export class CloseEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(CloseEvent, '' + type, new CloseEventInit(eventInitDict));
    }
    get wasClean() {
      return GET(this.@wrapped, 'wasClean');
    }
    get code() {
      return GET(this.@wrapped, 'code');
    }
    get reason() {
      return GET(this.@wrapped, 'reason');
    }
  }
  class CloseEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.wasClean = 'wasClean' in dict ? dict.wasClean : false;
      this.code = 'code' in dict ? dict.code : 0;
      this.reason = 'reason' in dict ? dict.reason : '';
    }
  }
  export class DOMElementMap {
  }
  export class DOMStringMap {
  }
  export class DataTransfer {
    get dropEffect() {
      return GET(this.@wrapped, 'dropEffect');
    }
    set dropEffect(v) {
      SET(this.@wrapped, 'dropEffect', '' + v);
    }
    get effectAllowed() {
      return GET(this.@wrapped, 'effectAllowed');
    }
    set effectAllowed(v) {
      SET(this.@wrapped, 'effectAllowed', '' + v);
    }
    get items() {
      return WRAP(GET(this.@wrapped, 'items'));
    }
    get types() {
      return WRAP(GET(this.@wrapped, 'types'));
    }
    get files() {
      return WRAP(GET(this.@wrapped, 'files'));
    }
    setDragImage(image, x, y) {
      CALL(this.@wrapped, 'setDragImage', UNWRAP(image), x >> 0, y >> 0);
    }
    getData(format) {
      return CALL(this.@wrapped, 'getData', '' + format);
    }
    setData(format, data) {
      CALL(this.@wrapped, 'setData', '' + format, '' + data);
    }
    clearData(format) {
      CALL(this.@wrapped, 'clearData', '' + format);
    }
  }
  export class DataTransferItem {
    get kind() {
      return GET(this.@wrapped, 'kind');
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    getAsString(_callback) {
      CALL(this.@wrapped, 'getAsString', CALLBACK(_callback));
    }
    getAsFile() {
      return WRAP(CALL(this.@wrapped, 'getAsFile'));
    }
  }
  export class DataTransferItemList {
    clear() {
      CALL(this.@wrapped, 'clear');
    }
    add(data, type) {
      return WRAP(CALL(this.@wrapped, 'add', UNWRAP(data), '' + type));
    }
  }
  export class DrawingStyle {
    constructor(scope) {
      this.@wrapped = CONSTRUCT(DrawingStyle, UNWRAP(scope));
    }
    get lineWidth() {
      return GET(this.@wrapped, 'lineWidth');
    }
    set lineWidth(v) {
      SET(this.@wrapped, 'lineWidth', +v || 0);
    }
    get lineCap() {
      return GET(this.@wrapped, 'lineCap');
    }
    set lineCap(v) {
      SET(this.@wrapped, 'lineCap', '' + v);
    }
    get lineJoin() {
      return GET(this.@wrapped, 'lineJoin');
    }
    set lineJoin(v) {
      SET(this.@wrapped, 'lineJoin', '' + v);
    }
    get miterLimit() {
      return GET(this.@wrapped, 'miterLimit');
    }
    set miterLimit(v) {
      SET(this.@wrapped, 'miterLimit', +v || 0);
    }
    get lineDashOffset() {
      return GET(this.@wrapped, 'lineDashOffset');
    }
    set lineDashOffset(v) {
      SET(this.@wrapped, 'lineDashOffset', +v || 0);
    }
    get font() {
      return GET(this.@wrapped, 'font');
    }
    set font(v) {
      SET(this.@wrapped, 'font', '' + v);
    }
    get textAlign() {
      return GET(this.@wrapped, 'textAlign');
    }
    set textAlign(v) {
      SET(this.@wrapped, 'textAlign', '' + v);
    }
    get textBaseline() {
      return GET(this.@wrapped, 'textBaseline');
    }
    set textBaseline(v) {
      SET(this.@wrapped, 'textBaseline', '' + v);
    }
    setLineDash(...segments) {
      CALL(this.@wrapped, 'setLineDash');
    }
    getLineDash() {
      return WRAP(CALL(this.@wrapped, 'getLineDash'));
    }
  }
  export class ErrorEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(ErrorEvent, '' + type, new ErrorEventInit(eventInitDict));
    }
    get message() {
      return GET(this.@wrapped, 'message');
    }
    get filename() {
      return GET(this.@wrapped, 'filename');
    }
    get lineno() {
      return GET(this.@wrapped, 'lineno');
    }
  }
  class ErrorEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.message = 'message' in dict ? dict.message : '';
      this.filename = 'filename' in dict ? dict.filename : '';
      this.lineno = 'lineno' in dict ? dict.lineno : 0;
    }
  }
  export class EventSource extends EventTarget {
    constructor(url, eventSourceInitDict) {
      this.@wrapped = CONSTRUCT(EventSource, '' + url, new EventSourceInit(eventSourceInitDict));
    }
    get onopen() {
      return WRAP(GET(this.@wrapped, 'onopen'));
    }
    set onopen(v) {
      SET(this.@wrapped, 'onopen', CALLBACK(v));
    }
    get onmessage() {
      return WRAP(GET(this.@wrapped, 'onmessage'));
    }
    set onmessage(v) {
      SET(this.@wrapped, 'onmessage', CALLBACK(v));
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', CALLBACK(v));
    }
    get url() {
      return GET(this.@wrapped, 'url');
    }
    get withCredentials() {
      return GET(this.@wrapped, 'withCredentials');
    }
    get readyState() {
      return GET(this.@wrapped, 'readyState');
    }
    close() {
      CALL(this.@wrapped, 'close');
    }
  }
  constants(EventSource, { CONNECTING: 0, OPEN: 1, CLOSED: 2 });
  class EventSourceInit {
    constructor(dict) {
      dict = dict || EMPTY;
      this.withCredentials = 'withCredentials' in dict ? dict.withCredentials : false;
    }
  }
  export class External {
    AddSearchProvider(engineURL) {
      CALL(this.@wrapped, 'AddSearchProvider', '' + engineURL);
    }
    IsSearchProviderInstalled(engineURL) {
      return CALL(this.@wrapped, 'IsSearchProviderInstalled', '' + engineURL);
    }
  }
  export class FormData {
    constructor(form) {
      this.@wrapped = CONSTRUCT(FormData, UNWRAP(form));
    }
    append(name, value, filename) {
      CALL(this.@wrapped, 'append', '' + name, UNWRAP(value), '' + filename);
    }
  }
  export class FunctionStringCallback {
    handleEvent(data) {
      CALL(this.@wrapped, 'handleEvent', '' + data);
    }
  }
  export class HTMLAllCollection extends HTMLCollection {
    namedItem(name) {
      return WRAP(CALL(this.@wrapped, 'namedItem', '' + name));
    }
    tags(tagName) {
      return WRAP(CALL(this.@wrapped, 'tags', '' + tagName));
    }
  }
  export class HTMLFormControlsCollection extends HTMLCollection {
    namedItem(name) {
      return WRAP(CALL(this.@wrapped, 'namedItem', '' + name));
    }
  }
  export class HTMLOptionsCollection extends HTMLCollection {
    namedItem(name) {
      return WRAP(CALL(this.@wrapped, 'namedItem', '' + name));
    }
    add(element, before) {
      CALL(this.@wrapped, 'add', UNWRAP(element), UNWRAP(before));
    }
    remove(index) {
      CALL(this.@wrapped, 'remove', index >> 0);
    }
  }
  export class HTMLPropertiesCollection extends HTMLCollection {
    get names() {
      return WRAP(GET(this.@wrapped, 'names'));
    }
    namedItem(name) {
      return WRAP(CALL(this.@wrapped, 'namedItem', '' + name));
    }
  }
  export class HashChangeEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(HashChangeEvent, '' + type, new HashChangeEventInit(eventInitDict));
    }
    get oldURL() {
      return GET(this.@wrapped, 'oldURL');
    }
    get newURL() {
      return GET(this.@wrapped, 'newURL');
    }
  }
  class HashChangeEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.oldURL = 'oldURL' in dict ? dict.oldURL : '';
      this.newURL = 'newURL' in dict ? dict.newURL : '';
    }
  }
  export class HistorySection {
    go(delta) {
      CALL(this.@wrapped, 'go', delta >> 0);
    }
    back() {
      CALL(this.@wrapped, 'back');
    }
    forward() {
      CALL(this.@wrapped, 'forward');
    }
    pushState(data, title, url) {
      CALL(this.@wrapped, 'pushState', UNWRAP(data), '' + title, '' + url);
    }
    replaceState(data, title, url) {
      CALL(this.@wrapped, 'replaceState', UNWRAP(data), '' + title, '' + url);
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
  export class Location {
    get href() {
      return GET(this.@wrapped, 'href');
    }
    set href(v) {
      SET(this.@wrapped, 'href', '' + v);
    }
    get protocol() {
      return GET(this.@wrapped, 'protocol');
    }
    set protocol(v) {
      SET(this.@wrapped, 'protocol', '' + v);
    }
    get host() {
      return GET(this.@wrapped, 'host');
    }
    set host(v) {
      SET(this.@wrapped, 'host', '' + v);
    }
    get hostname() {
      return GET(this.@wrapped, 'hostname');
    }
    set hostname(v) {
      SET(this.@wrapped, 'hostname', '' + v);
    }
    get port() {
      return GET(this.@wrapped, 'port');
    }
    set port(v) {
      SET(this.@wrapped, 'port', '' + v);
    }
    get pathname() {
      return GET(this.@wrapped, 'pathname');
    }
    set pathname(v) {
      SET(this.@wrapped, 'pathname', '' + v);
    }
    get search() {
      return GET(this.@wrapped, 'search');
    }
    set search(v) {
      SET(this.@wrapped, 'search', '' + v);
    }
    get hash() {
      return GET(this.@wrapped, 'hash');
    }
    set hash(v) {
      SET(this.@wrapped, 'hash', '' + v);
    }
    assign(url) {
      CALL(this.@wrapped, 'assign', '' + url);
    }
    replace(url) {
      CALL(this.@wrapped, 'replace', '' + url);
    }
    reload() {
      CALL(this.@wrapped, 'reload');
    }
  }
  const MediaControllerPlaybackState = { waiting: 'waiting', playing: 'playing', ended: 'ended' };
  export class MediaControllerSection {
    constructor() {
      this.@wrapped = CONSTRUCT(MediaControllerSection);
    }
    get currentTime() {
      return GET(this.@wrapped, 'currentTime');
    }
    set currentTime(v) {
      SET(this.@wrapped, 'currentTime', +v || 0);
    }
    get defaultPlaybackRate() {
      return GET(this.@wrapped, 'defaultPlaybackRate');
    }
    set defaultPlaybackRate(v) {
      SET(this.@wrapped, 'defaultPlaybackRate', +v || 0);
    }
    get playbackRate() {
      return GET(this.@wrapped, 'playbackRate');
    }
    set playbackRate(v) {
      SET(this.@wrapped, 'playbackRate', +v || 0);
    }
    get volume() {
      return GET(this.@wrapped, 'volume');
    }
    set volume(v) {
      SET(this.@wrapped, 'volume', +v || 0);
    }
    get muted() {
      return GET(this.@wrapped, 'muted');
    }
    set muted(v) {
      SET(this.@wrapped, 'muted', !!v);
    }
    get onemptied() {
      return WRAP(GET(this.@wrapped, 'onemptied'));
    }
    set onemptied(v) {
      SET(this.@wrapped, 'onemptied', CALLBACK_OR_NULL(v));
    }
    get onloadedmetadata() {
      return WRAP(GET(this.@wrapped, 'onloadedmetadata'));
    }
    set onloadedmetadata(v) {
      SET(this.@wrapped, 'onloadedmetadata', CALLBACK_OR_NULL(v));
    }
    get onloadeddata() {
      return WRAP(GET(this.@wrapped, 'onloadeddata'));
    }
    set onloadeddata(v) {
      SET(this.@wrapped, 'onloadeddata', CALLBACK_OR_NULL(v));
    }
    get oncanplay() {
      return WRAP(GET(this.@wrapped, 'oncanplay'));
    }
    set oncanplay(v) {
      SET(this.@wrapped, 'oncanplay', CALLBACK_OR_NULL(v));
    }
    get oncanplaythrough() {
      return WRAP(GET(this.@wrapped, 'oncanplaythrough'));
    }
    set oncanplaythrough(v) {
      SET(this.@wrapped, 'oncanplaythrough', CALLBACK_OR_NULL(v));
    }
    get onplaying() {
      return WRAP(GET(this.@wrapped, 'onplaying'));
    }
    set onplaying(v) {
      SET(this.@wrapped, 'onplaying', CALLBACK_OR_NULL(v));
    }
    get onended() {
      return WRAP(GET(this.@wrapped, 'onended'));
    }
    set onended(v) {
      SET(this.@wrapped, 'onended', CALLBACK_OR_NULL(v));
    }
    get onwaiting() {
      return WRAP(GET(this.@wrapped, 'onwaiting'));
    }
    set onwaiting(v) {
      SET(this.@wrapped, 'onwaiting', CALLBACK_OR_NULL(v));
    }
    get ondurationchange() {
      return WRAP(GET(this.@wrapped, 'ondurationchange'));
    }
    set ondurationchange(v) {
      SET(this.@wrapped, 'ondurationchange', CALLBACK_OR_NULL(v));
    }
    get ontimeupdate() {
      return WRAP(GET(this.@wrapped, 'ontimeupdate'));
    }
    set ontimeupdate(v) {
      SET(this.@wrapped, 'ontimeupdate', CALLBACK_OR_NULL(v));
    }
    get onplay() {
      return WRAP(GET(this.@wrapped, 'onplay'));
    }
    set onplay(v) {
      SET(this.@wrapped, 'onplay', CALLBACK_OR_NULL(v));
    }
    get onpause() {
      return WRAP(GET(this.@wrapped, 'onpause'));
    }
    set onpause(v) {
      SET(this.@wrapped, 'onpause', CALLBACK_OR_NULL(v));
    }
    get onratechange() {
      return WRAP(GET(this.@wrapped, 'onratechange'));
    }
    set onratechange(v) {
      SET(this.@wrapped, 'onratechange', CALLBACK_OR_NULL(v));
    }
    get onvolumechange() {
      return WRAP(GET(this.@wrapped, 'onvolumechange'));
    }
    set onvolumechange(v) {
      SET(this.@wrapped, 'onvolumechange', CALLBACK_OR_NULL(v));
    }
    get readyState() {
      return GET(this.@wrapped, 'readyState');
    }
    get buffered() {
      return WRAP(GET(this.@wrapped, 'buffered'));
    }
    get seekable() {
      return WRAP(GET(this.@wrapped, 'seekable'));
    }
    get duration() {
      return GET(this.@wrapped, 'duration');
    }
    get paused() {
      return GET(this.@wrapped, 'paused');
    }
    get playbackState() {
      return WRAP(GET(this.@wrapped, 'playbackState'));
    }
    get played() {
      return WRAP(GET(this.@wrapped, 'played'));
    }
    play() {
      CALL(this.@wrapped, 'play');
    }
    pause() {
      CALL(this.@wrapped, 'pause');
    }
  }
  export class MediaError {
    get code() {
      return GET(this.@wrapped, 'code');
    }
  }
  constants(MediaError, { MEDIA_ERR_ABORTED: 1, MEDIA_ERR_NETWORK: 2, MEDIA_ERR_DECODE: 3, MEDIA_ERR_SRC_NOT_SUPPORTED: 4 });
  export class MessageChannel {
    constructor() {
      this.@wrapped = CONSTRUCT(MessageChannel);
    }
    get port1() {
      return WRAP(GET(this.@wrapped, 'port1'));
    }
    get port2() {
      return WRAP(GET(this.@wrapped, 'port2'));
    }
  }
  export class MessageEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(MessageEvent, '' + type, new MessageEventInit(eventInitDict));
    }
    get data() {
      return WRAP(GET(this.@wrapped, 'data'));
    }
    get origin() {
      return GET(this.@wrapped, 'origin');
    }
    get lastEventId() {
      return GET(this.@wrapped, 'lastEventId');
    }
    get source() {
      return WRAP(GET(this.@wrapped, 'source'));
    }
    get ports() {
      return WRAP(GET(this.@wrapped, 'ports'));
    }
  }
  class MessageEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.data = 'data' in dict ? dict.data : '';
      this.origin = 'origin' in dict ? dict.origin : '';
      this.lastEventId = 'lastEventId' in dict ? dict.lastEventId : '';
      this.source = 'source' in dict ? dict.source : '';
      this.ports = 'ports' in dict ? dict.ports : '';
    }
  }
  export class MessagePort extends EventTarget {
    get onmessage() {
      return WRAP(GET(this.@wrapped, 'onmessage'));
    }
    set onmessage(v) {
      SET(this.@wrapped, 'onmessage', CALLBACK(v));
    }
    postMessage(message, ...transfer) {
      CALL(this.@wrapped, 'postMessage', UNWRAP(message));
    }
    start() {
      CALL(this.@wrapped, 'start');
    }
    close() {
      CALL(this.@wrapped, 'close');
    }
  }
  export class Navigator {
    get appName() {
      return GET(this.@wrapped, 'appName');
    }
    get appVersion() {
      return GET(this.@wrapped, 'appVersion');
    }
    get platform() {
      return GET(this.@wrapped, 'platform');
    }
    get userAgent() {
      return GET(this.@wrapped, 'userAgent');
    }
    get onLine() {
      return GET(this.@wrapped, 'onLine');
    }
    registerProtocolHandler(scheme, url, title) {
      CALL(this.@wrapped, 'registerProtocolHandler', '' + scheme, '' + url, '' + title);
    }
    registerContentHandler(mimeType, url, title) {
      CALL(this.@wrapped, 'registerContentHandler', '' + mimeType, '' + url, '' + title);
    }
    isProtocolHandlerRegistered(scheme, url) {
      return CALL(this.@wrapped, 'isProtocolHandlerRegistered', '' + scheme, '' + url);
    }
    isContentHandlerRegistered(mimeType, url) {
      return CALL(this.@wrapped, 'isContentHandlerRegistered', '' + mimeType, '' + url);
    }
    unregisterProtocolHandler(scheme, url) {
      CALL(this.@wrapped, 'unregisterProtocolHandler', '' + scheme, '' + url);
    }
    unregisterContentHandler(mimeType, url) {
      CALL(this.@wrapped, 'unregisterContentHandler', '' + mimeType, '' + url);
    }
    yieldForStorageUpdates() {
      CALL(this.@wrapped, 'yieldForStorageUpdates');
    }
  }
  export class PageTransitionEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(PageTransitionEvent, '' + type, new PageTransitionEventInit(eventInitDict));
    }
    get persisted() {
      return GET(this.@wrapped, 'persisted');
    }
  }
  class PageTransitionEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.persisted = 'persisted' in dict ? dict.persisted : false;
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
  export class PopStateEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(PopStateEvent, '' + type, new PopStateEventInit(eventInitDict));
    }
    get state() {
      return WRAP(GET(this.@wrapped, 'state'));
    }
  }
  class PopStateEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.state = 'state' in dict ? dict.state : '';
    }
  }
  export class ProgressEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(ProgressEvent, '' + type, new ProgressEventInit(eventInitDict));
    }
    get lengthComputable() {
      return GET(this.@wrapped, 'lengthComputable');
    }
    get loaded() {
      return toUint64(GET(this.@wrapped, 'loaded'));
    }
    get total() {
      return toUint64(GET(this.@wrapped, 'total'));
    }
  }
  class ProgressEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.lengthComputable = 'lengthComputable' in dict ? dict.lengthComputable : false;
      this.loaded = 'loaded' in dict ? dict.loaded : '';
      this.total = 'total' in dict ? dict.total : '';
    }
  }
  export class PropertyNodeList extends NodeList {
    getValues() {
      return WRAP(CALL(this.@wrapped, 'getValues'));
    }
  }
  export class RadioNodeList extends NodeList {
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', '' + v);
    }
  }
  const SelectionMode = { select: 'select', start: 'start', end: 'end', preserve: 'preserve' };
  export class SharedWorker extends EventTarget {
    constructor(scriptURL, name) {
      this.@wrapped = CONSTRUCT(SharedWorker, '' + scriptURL, '' + name);
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', CALLBACK(v));
    }
    get port() {
      return WRAP(GET(this.@wrapped, 'port'));
    }
  }
  export class Storage {
    key(index) {
      return CALL(this.@wrapped, 'key', index >>> 0);
    }
    getItem(key) {
      return CALL(this.@wrapped, 'getItem', '' + key);
    }
    setItem(key, value) {
      CALL(this.@wrapped, 'setItem', '' + key, '' + value);
    }
    removeItem(key) {
      CALL(this.@wrapped, 'removeItem', '' + key);
    }
    clear() {
      CALL(this.@wrapped, 'clear');
    }
  }
  export class StorageEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(StorageEvent, '' + type, new StorageEventInit(eventInitDict));
    }
    get key() {
      return GET(this.@wrapped, 'key');
    }
    get oldValue() {
      return GET(this.@wrapped, 'oldValue');
    }
    get newValue() {
      return GET(this.@wrapped, 'newValue');
    }
    get url() {
      return GET(this.@wrapped, 'url');
    }
    get storageArea() {
      return WRAP(GET(this.@wrapped, 'storageArea'));
    }
  }
  class StorageEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.key = 'key' in dict ? dict.key : '';
      this.oldValue = 'oldValue' in dict ? dict.oldValue : '';
      this.newValue = 'newValue' in dict ? dict.newValue : '';
      this.url = 'url' in dict ? dict.url : '';
      this.storageArea = 'storageArea' in dict ? dict.storageArea : '';
    }
  }
  export class TextMetrics {
    get width() {
      return GET(this.@wrapped, 'width');
    }
    get actualBoundingBoxLeft() {
      return GET(this.@wrapped, 'actualBoundingBoxLeft');
    }
    get actualBoundingBoxRight() {
      return GET(this.@wrapped, 'actualBoundingBoxRight');
    }
    get fontBoundingBoxAscent() {
      return GET(this.@wrapped, 'fontBoundingBoxAscent');
    }
    get fontBoundingBoxDescent() {
      return GET(this.@wrapped, 'fontBoundingBoxDescent');
    }
    get actualBoundingBoxAscent() {
      return GET(this.@wrapped, 'actualBoundingBoxAscent');
    }
    get actualBoundingBoxDescent() {
      return GET(this.@wrapped, 'actualBoundingBoxDescent');
    }
    get emHeightAscent() {
      return GET(this.@wrapped, 'emHeightAscent');
    }
    get emHeightDescent() {
      return GET(this.@wrapped, 'emHeightDescent');
    }
    get hangingBaseline() {
      return GET(this.@wrapped, 'hangingBaseline');
    }
    get alphabeticBaseline() {
      return GET(this.@wrapped, 'alphabeticBaseline');
    }
    get ideographicBaseline() {
      return GET(this.@wrapped, 'ideographicBaseline');
    }
  }
  export class TextTrack extends EventTarget {
    get mode() {
      return WRAP(GET(this.@wrapped, 'mode'));
    }
    set mode(v) {
      SET(this.@wrapped, 'mode', UNWRAP(v));
    }
    get oncuechange() {
      return WRAP(GET(this.@wrapped, 'oncuechange'));
    }
    set oncuechange(v) {
      SET(this.@wrapped, 'oncuechange', CALLBACK_OR_NULL(v));
    }
    get kind() {
      return GET(this.@wrapped, 'kind');
    }
    get label() {
      return GET(this.@wrapped, 'label');
    }
    get language() {
      return GET(this.@wrapped, 'language');
    }
    get inBandMetadataTrackDispatchType() {
      return GET(this.@wrapped, 'inBandMetadataTrackDispatchType');
    }
    get cues() {
      return WRAP(GET(this.@wrapped, 'cues'));
    }
    get activeCues() {
      return WRAP(GET(this.@wrapped, 'activeCues'));
    }
    addCue(cue) {
      CALL(this.@wrapped, 'addCue', UNWRAP(cue));
    }
    removeCue(cue) {
      CALL(this.@wrapped, 'removeCue', UNWRAP(cue));
    }
  }
  export class TextTrackCue extends EventTarget {
    constructor(startTime, endTime, text) {
      this.@wrapped = CONSTRUCT(TextTrackCue, +startTime || 0, +endTime || 0, '' + text);
    }
    get id() {
      return GET(this.@wrapped, 'id');
    }
    set id(v) {
      SET(this.@wrapped, 'id', '' + v);
    }
    get startTime() {
      return GET(this.@wrapped, 'startTime');
    }
    set startTime(v) {
      SET(this.@wrapped, 'startTime', +v || 0);
    }
    get endTime() {
      return GET(this.@wrapped, 'endTime');
    }
    set endTime(v) {
      SET(this.@wrapped, 'endTime', +v || 0);
    }
    get pauseOnExit() {
      return GET(this.@wrapped, 'pauseOnExit');
    }
    set pauseOnExit(v) {
      SET(this.@wrapped, 'pauseOnExit', !!v);
    }
    get vertical() {
      return GET(this.@wrapped, 'vertical');
    }
    set vertical(v) {
      SET(this.@wrapped, 'vertical', '' + v);
    }
    get snapToLines() {
      return GET(this.@wrapped, 'snapToLines');
    }
    set snapToLines(v) {
      SET(this.@wrapped, 'snapToLines', !!v);
    }
    get line() {
      return WRAP(GET(this.@wrapped, 'line'));
    }
    set line(v) {
      SET(this.@wrapped, 'line', UNWRAP(v));
    }
    get position() {
      return GET(this.@wrapped, 'position');
    }
    set position(v) {
      SET(this.@wrapped, 'position', v >> 0);
    }
    get size() {
      return GET(this.@wrapped, 'size');
    }
    set size(v) {
      SET(this.@wrapped, 'size', v >> 0);
    }
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get text() {
      return GET(this.@wrapped, 'text');
    }
    set text(v) {
      SET(this.@wrapped, 'text', '' + v);
    }
    get onenter() {
      return WRAP(GET(this.@wrapped, 'onenter'));
    }
    set onenter(v) {
      SET(this.@wrapped, 'onenter', CALLBACK_OR_NULL(v));
    }
    get onexit() {
      return WRAP(GET(this.@wrapped, 'onexit'));
    }
    set onexit(v) {
      SET(this.@wrapped, 'onexit', CALLBACK_OR_NULL(v));
    }
    get track() {
      return WRAP(GET(this.@wrapped, 'track'));
    }
    getCueAsHTML() {
      return WRAP(CALL(this.@wrapped, 'getCueAsHTML'));
    }
  }
  export class TextTrackCueList {
    getCueById(id) {
      return WRAP(CALL(this.@wrapped, 'getCueById', '' + id));
    }
  }
  export class TextTrackList extends EventTarget {
    get onaddtrack() {
      return WRAP(GET(this.@wrapped, 'onaddtrack'));
    }
    set onaddtrack(v) {
      SET(this.@wrapped, 'onaddtrack', CALLBACK_OR_NULL(v));
    }
    get onremovetrack() {
      return WRAP(GET(this.@wrapped, 'onremovetrack'));
    }
    set onremovetrack(v) {
      SET(this.@wrapped, 'onremovetrack', CALLBACK_OR_NULL(v));
    }
  }
  const TextTrackMode = { disabled: 'disabled', hidden: 'hidden', showing: 'showing' };
  export class TimeRanges {
    start(index) {
      return CALL(this.@wrapped, 'start', index >>> 0);
    }
    end(index) {
      return CALL(this.@wrapped, 'end', index >>> 0);
    }
  }
  export class TrackEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(TrackEvent, '' + type, new TrackEventInit(eventInitDict));
    }
    get track() {
      return WRAP(GET(this.@wrapped, 'track'));
    }
  }
  class TrackEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.track = 'track' in dict ? dict.track : {};
    }
  }
  export class ValidityState {
    get valueMissing() {
      return GET(this.@wrapped, 'valueMissing');
    }
    get typeMismatch() {
      return GET(this.@wrapped, 'typeMismatch');
    }
    get patternMismatch() {
      return GET(this.@wrapped, 'patternMismatch');
    }
    get tooLong() {
      return GET(this.@wrapped, 'tooLong');
    }
    get rangeUnderflow() {
      return GET(this.@wrapped, 'rangeUnderflow');
    }
    get rangeOverflow() {
      return GET(this.@wrapped, 'rangeOverflow');
    }
    get stepMismatch() {
      return GET(this.@wrapped, 'stepMismatch');
    }
    get customError() {
      return GET(this.@wrapped, 'customError');
    }
    get valid() {
      return GET(this.@wrapped, 'valid');
    }
  }
  export class VideoTrack {
    get selected() {
      return GET(this.@wrapped, 'selected');
    }
    set selected(v) {
      SET(this.@wrapped, 'selected', !!v);
    }
    get id() {
      return GET(this.@wrapped, 'id');
    }
    get kind() {
      return GET(this.@wrapped, 'kind');
    }
    get label() {
      return GET(this.@wrapped, 'label');
    }
    get language() {
      return GET(this.@wrapped, 'language');
    }
  }
  export class VideoTrackList extends EventTarget {
    get onchange() {
      return WRAP(GET(this.@wrapped, 'onchange'));
    }
    set onchange(v) {
      SET(this.@wrapped, 'onchange', CALLBACK_OR_NULL(v));
    }
    get onaddtrack() {
      return WRAP(GET(this.@wrapped, 'onaddtrack'));
    }
    set onaddtrack(v) {
      SET(this.@wrapped, 'onaddtrack', CALLBACK_OR_NULL(v));
    }
    get onremovetrack() {
      return WRAP(GET(this.@wrapped, 'onremovetrack'));
    }
    set onremovetrack(v) {
      SET(this.@wrapped, 'onremovetrack', CALLBACK_OR_NULL(v));
    }
    getTrackById(id) {
      return WRAP(CALL(this.@wrapped, 'getTrackById', '' + id));
    }
  }
  export class WebSocket extends EventTarget {
    constructor(url, protocols) {
      this.@wrapped = CONSTRUCT(WebSocket, '' + url, UNWRAP(protocols));
    }
    get onopen() {
      return WRAP(GET(this.@wrapped, 'onopen'));
    }
    set onopen(v) {
      SET(this.@wrapped, 'onopen', CALLBACK(v));
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', CALLBACK(v));
    }
    get onclose() {
      return WRAP(GET(this.@wrapped, 'onclose'));
    }
    set onclose(v) {
      SET(this.@wrapped, 'onclose', CALLBACK(v));
    }
    get onmessage() {
      return WRAP(GET(this.@wrapped, 'onmessage'));
    }
    set onmessage(v) {
      SET(this.@wrapped, 'onmessage', CALLBACK(v));
    }
    get binaryType() {
      return WRAP(GET(this.@wrapped, 'binaryType'));
    }
    set binaryType(v) {
      SET(this.@wrapped, 'binaryType', UNWRAP(v));
    }
    get url() {
      return GET(this.@wrapped, 'url');
    }
    get readyState() {
      return GET(this.@wrapped, 'readyState');
    }
    get bufferedAmount() {
      return GET(this.@wrapped, 'bufferedAmount');
    }
    get extensions() {
      return GET(this.@wrapped, 'extensions');
    }
    get protocol() {
      return GET(this.@wrapped, 'protocol');
    }
    close(code, reason) {
      CALL(this.@wrapped, 'close', toInt16(code), '' + reason);
    }
    send(data) {
      CALL(this.@wrapped, 'send', UNWRAP(data));
    }
  }
  constants(WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
  export class Window extends EventTarget {
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get status() {
      return GET(this.@wrapped, 'status');
    }
    set status(v) {
      SET(this.@wrapped, 'status', '' + v);
    }
    get opener() {
      return WRAP(GET(this.@wrapped, 'opener'));
    }
    set opener(v) {
      SET(this.@wrapped, 'opener', UNWRAP(v));
    }
    get onabort() {
      return WRAP(GET(this.@wrapped, 'onabort'));
    }
    set onabort(v) {
      SET(this.@wrapped, 'onabort', CALLBACK_OR_NULL(v));
    }
    get onafterprint() {
      return WRAP(GET(this.@wrapped, 'onafterprint'));
    }
    set onafterprint(v) {
      SET(this.@wrapped, 'onafterprint', CALLBACK_OR_NULL(v));
    }
    get onbeforeprint() {
      return WRAP(GET(this.@wrapped, 'onbeforeprint'));
    }
    set onbeforeprint(v) {
      SET(this.@wrapped, 'onbeforeprint', CALLBACK_OR_NULL(v));
    }
    get onbeforeunload() {
      return WRAP(GET(this.@wrapped, 'onbeforeunload'));
    }
    set onbeforeunload(v) {
      SET(this.@wrapped, 'onbeforeunload', CALLBACK_OR_NULL(v));
    }
    get onblur() {
      return WRAP(GET(this.@wrapped, 'onblur'));
    }
    set onblur(v) {
      SET(this.@wrapped, 'onblur', CALLBACK_OR_NULL(v));
    }
    get oncancel() {
      return WRAP(GET(this.@wrapped, 'oncancel'));
    }
    set oncancel(v) {
      SET(this.@wrapped, 'oncancel', CALLBACK_OR_NULL(v));
    }
    get oncanplay() {
      return WRAP(GET(this.@wrapped, 'oncanplay'));
    }
    set oncanplay(v) {
      SET(this.@wrapped, 'oncanplay', CALLBACK_OR_NULL(v));
    }
    get oncanplaythrough() {
      return WRAP(GET(this.@wrapped, 'oncanplaythrough'));
    }
    set oncanplaythrough(v) {
      SET(this.@wrapped, 'oncanplaythrough', CALLBACK_OR_NULL(v));
    }
    get onchange() {
      return WRAP(GET(this.@wrapped, 'onchange'));
    }
    set onchange(v) {
      SET(this.@wrapped, 'onchange', CALLBACK_OR_NULL(v));
    }
    get onclick() {
      return WRAP(GET(this.@wrapped, 'onclick'));
    }
    set onclick(v) {
      SET(this.@wrapped, 'onclick', CALLBACK_OR_NULL(v));
    }
    get onclose() {
      return WRAP(GET(this.@wrapped, 'onclose'));
    }
    set onclose(v) {
      SET(this.@wrapped, 'onclose', CALLBACK_OR_NULL(v));
    }
    get oncontextmenu() {
      return WRAP(GET(this.@wrapped, 'oncontextmenu'));
    }
    set oncontextmenu(v) {
      SET(this.@wrapped, 'oncontextmenu', CALLBACK_OR_NULL(v));
    }
    get oncuechange() {
      return WRAP(GET(this.@wrapped, 'oncuechange'));
    }
    set oncuechange(v) {
      SET(this.@wrapped, 'oncuechange', CALLBACK_OR_NULL(v));
    }
    get ondblclick() {
      return WRAP(GET(this.@wrapped, 'ondblclick'));
    }
    set ondblclick(v) {
      SET(this.@wrapped, 'ondblclick', CALLBACK_OR_NULL(v));
    }
    get ondrag() {
      return WRAP(GET(this.@wrapped, 'ondrag'));
    }
    set ondrag(v) {
      SET(this.@wrapped, 'ondrag', CALLBACK_OR_NULL(v));
    }
    get ondragend() {
      return WRAP(GET(this.@wrapped, 'ondragend'));
    }
    set ondragend(v) {
      SET(this.@wrapped, 'ondragend', CALLBACK_OR_NULL(v));
    }
    get ondragenter() {
      return WRAP(GET(this.@wrapped, 'ondragenter'));
    }
    set ondragenter(v) {
      SET(this.@wrapped, 'ondragenter', CALLBACK_OR_NULL(v));
    }
    get ondragleave() {
      return WRAP(GET(this.@wrapped, 'ondragleave'));
    }
    set ondragleave(v) {
      SET(this.@wrapped, 'ondragleave', CALLBACK_OR_NULL(v));
    }
    get ondragover() {
      return WRAP(GET(this.@wrapped, 'ondragover'));
    }
    set ondragover(v) {
      SET(this.@wrapped, 'ondragover', CALLBACK_OR_NULL(v));
    }
    get ondragstart() {
      return WRAP(GET(this.@wrapped, 'ondragstart'));
    }
    set ondragstart(v) {
      SET(this.@wrapped, 'ondragstart', CALLBACK_OR_NULL(v));
    }
    get ondrop() {
      return WRAP(GET(this.@wrapped, 'ondrop'));
    }
    set ondrop(v) {
      SET(this.@wrapped, 'ondrop', CALLBACK_OR_NULL(v));
    }
    get ondurationchange() {
      return WRAP(GET(this.@wrapped, 'ondurationchange'));
    }
    set ondurationchange(v) {
      SET(this.@wrapped, 'ondurationchange', CALLBACK_OR_NULL(v));
    }
    get onemptied() {
      return WRAP(GET(this.@wrapped, 'onemptied'));
    }
    set onemptied(v) {
      SET(this.@wrapped, 'onemptied', CALLBACK_OR_NULL(v));
    }
    get onended() {
      return WRAP(GET(this.@wrapped, 'onended'));
    }
    set onended(v) {
      SET(this.@wrapped, 'onended', CALLBACK_OR_NULL(v));
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', UNWRAP(v));
    }
    get onfocus() {
      return WRAP(GET(this.@wrapped, 'onfocus'));
    }
    set onfocus(v) {
      SET(this.@wrapped, 'onfocus', CALLBACK_OR_NULL(v));
    }
    get onhashchange() {
      return WRAP(GET(this.@wrapped, 'onhashchange'));
    }
    set onhashchange(v) {
      SET(this.@wrapped, 'onhashchange', CALLBACK_OR_NULL(v));
    }
    get oninput() {
      return WRAP(GET(this.@wrapped, 'oninput'));
    }
    set oninput(v) {
      SET(this.@wrapped, 'oninput', CALLBACK_OR_NULL(v));
    }
    get oninvalid() {
      return WRAP(GET(this.@wrapped, 'oninvalid'));
    }
    set oninvalid(v) {
      SET(this.@wrapped, 'oninvalid', CALLBACK_OR_NULL(v));
    }
    get onkeydown() {
      return WRAP(GET(this.@wrapped, 'onkeydown'));
    }
    set onkeydown(v) {
      SET(this.@wrapped, 'onkeydown', CALLBACK_OR_NULL(v));
    }
    get onkeypress() {
      return WRAP(GET(this.@wrapped, 'onkeypress'));
    }
    set onkeypress(v) {
      SET(this.@wrapped, 'onkeypress', CALLBACK_OR_NULL(v));
    }
    get onkeyup() {
      return WRAP(GET(this.@wrapped, 'onkeyup'));
    }
    set onkeyup(v) {
      SET(this.@wrapped, 'onkeyup', CALLBACK_OR_NULL(v));
    }
    get onload() {
      return WRAP(GET(this.@wrapped, 'onload'));
    }
    set onload(v) {
      SET(this.@wrapped, 'onload', CALLBACK_OR_NULL(v));
    }
    get onloadeddata() {
      return WRAP(GET(this.@wrapped, 'onloadeddata'));
    }
    set onloadeddata(v) {
      SET(this.@wrapped, 'onloadeddata', CALLBACK_OR_NULL(v));
    }
    get onloadedmetadata() {
      return WRAP(GET(this.@wrapped, 'onloadedmetadata'));
    }
    set onloadedmetadata(v) {
      SET(this.@wrapped, 'onloadedmetadata', CALLBACK_OR_NULL(v));
    }
    get onloadstart() {
      return WRAP(GET(this.@wrapped, 'onloadstart'));
    }
    set onloadstart(v) {
      SET(this.@wrapped, 'onloadstart', CALLBACK_OR_NULL(v));
    }
    get onmessage() {
      return WRAP(GET(this.@wrapped, 'onmessage'));
    }
    set onmessage(v) {
      SET(this.@wrapped, 'onmessage', CALLBACK_OR_NULL(v));
    }
    get onmousedown() {
      return WRAP(GET(this.@wrapped, 'onmousedown'));
    }
    set onmousedown(v) {
      SET(this.@wrapped, 'onmousedown', CALLBACK_OR_NULL(v));
    }
    get onmousemove() {
      return WRAP(GET(this.@wrapped, 'onmousemove'));
    }
    set onmousemove(v) {
      SET(this.@wrapped, 'onmousemove', CALLBACK_OR_NULL(v));
    }
    get onmouseout() {
      return WRAP(GET(this.@wrapped, 'onmouseout'));
    }
    set onmouseout(v) {
      SET(this.@wrapped, 'onmouseout', CALLBACK_OR_NULL(v));
    }
    get onmouseover() {
      return WRAP(GET(this.@wrapped, 'onmouseover'));
    }
    set onmouseover(v) {
      SET(this.@wrapped, 'onmouseover', CALLBACK_OR_NULL(v));
    }
    get onmouseup() {
      return WRAP(GET(this.@wrapped, 'onmouseup'));
    }
    set onmouseup(v) {
      SET(this.@wrapped, 'onmouseup', CALLBACK_OR_NULL(v));
    }
    get onmousewheel() {
      return WRAP(GET(this.@wrapped, 'onmousewheel'));
    }
    set onmousewheel(v) {
      SET(this.@wrapped, 'onmousewheel', CALLBACK_OR_NULL(v));
    }
    get onoffline() {
      return WRAP(GET(this.@wrapped, 'onoffline'));
    }
    set onoffline(v) {
      SET(this.@wrapped, 'onoffline', CALLBACK_OR_NULL(v));
    }
    get ononline() {
      return WRAP(GET(this.@wrapped, 'ononline'));
    }
    set ononline(v) {
      SET(this.@wrapped, 'ononline', CALLBACK_OR_NULL(v));
    }
    get onpause() {
      return WRAP(GET(this.@wrapped, 'onpause'));
    }
    set onpause(v) {
      SET(this.@wrapped, 'onpause', CALLBACK_OR_NULL(v));
    }
    get onplay() {
      return WRAP(GET(this.@wrapped, 'onplay'));
    }
    set onplay(v) {
      SET(this.@wrapped, 'onplay', CALLBACK_OR_NULL(v));
    }
    get onplaying() {
      return WRAP(GET(this.@wrapped, 'onplaying'));
    }
    set onplaying(v) {
      SET(this.@wrapped, 'onplaying', CALLBACK_OR_NULL(v));
    }
    get onpagehide() {
      return WRAP(GET(this.@wrapped, 'onpagehide'));
    }
    set onpagehide(v) {
      SET(this.@wrapped, 'onpagehide', CALLBACK_OR_NULL(v));
    }
    get onpageshow() {
      return WRAP(GET(this.@wrapped, 'onpageshow'));
    }
    set onpageshow(v) {
      SET(this.@wrapped, 'onpageshow', CALLBACK_OR_NULL(v));
    }
    get onpopstate() {
      return WRAP(GET(this.@wrapped, 'onpopstate'));
    }
    set onpopstate(v) {
      SET(this.@wrapped, 'onpopstate', CALLBACK_OR_NULL(v));
    }
    get onprogress() {
      return WRAP(GET(this.@wrapped, 'onprogress'));
    }
    set onprogress(v) {
      SET(this.@wrapped, 'onprogress', CALLBACK_OR_NULL(v));
    }
    get onratechange() {
      return WRAP(GET(this.@wrapped, 'onratechange'));
    }
    set onratechange(v) {
      SET(this.@wrapped, 'onratechange', CALLBACK_OR_NULL(v));
    }
    get onreset() {
      return WRAP(GET(this.@wrapped, 'onreset'));
    }
    set onreset(v) {
      SET(this.@wrapped, 'onreset', CALLBACK_OR_NULL(v));
    }
    get onresize() {
      return WRAP(GET(this.@wrapped, 'onresize'));
    }
    set onresize(v) {
      SET(this.@wrapped, 'onresize', CALLBACK_OR_NULL(v));
    }
    get onscroll() {
      return WRAP(GET(this.@wrapped, 'onscroll'));
    }
    set onscroll(v) {
      SET(this.@wrapped, 'onscroll', CALLBACK_OR_NULL(v));
    }
    get onseeked() {
      return WRAP(GET(this.@wrapped, 'onseeked'));
    }
    set onseeked(v) {
      SET(this.@wrapped, 'onseeked', CALLBACK_OR_NULL(v));
    }
    get onseeking() {
      return WRAP(GET(this.@wrapped, 'onseeking'));
    }
    set onseeking(v) {
      SET(this.@wrapped, 'onseeking', CALLBACK_OR_NULL(v));
    }
    get onselect() {
      return WRAP(GET(this.@wrapped, 'onselect'));
    }
    set onselect(v) {
      SET(this.@wrapped, 'onselect', CALLBACK_OR_NULL(v));
    }
    get onshow() {
      return WRAP(GET(this.@wrapped, 'onshow'));
    }
    set onshow(v) {
      SET(this.@wrapped, 'onshow', CALLBACK_OR_NULL(v));
    }
    get onstalled() {
      return WRAP(GET(this.@wrapped, 'onstalled'));
    }
    set onstalled(v) {
      SET(this.@wrapped, 'onstalled', CALLBACK_OR_NULL(v));
    }
    get onstorage() {
      return WRAP(GET(this.@wrapped, 'onstorage'));
    }
    set onstorage(v) {
      SET(this.@wrapped, 'onstorage', CALLBACK_OR_NULL(v));
    }
    get onsubmit() {
      return WRAP(GET(this.@wrapped, 'onsubmit'));
    }
    set onsubmit(v) {
      SET(this.@wrapped, 'onsubmit', CALLBACK_OR_NULL(v));
    }
    get onsuspend() {
      return WRAP(GET(this.@wrapped, 'onsuspend'));
    }
    set onsuspend(v) {
      SET(this.@wrapped, 'onsuspend', CALLBACK_OR_NULL(v));
    }
    get ontimeupdate() {
      return WRAP(GET(this.@wrapped, 'ontimeupdate'));
    }
    set ontimeupdate(v) {
      SET(this.@wrapped, 'ontimeupdate', CALLBACK_OR_NULL(v));
    }
    get onunload() {
      return WRAP(GET(this.@wrapped, 'onunload'));
    }
    set onunload(v) {
      SET(this.@wrapped, 'onunload', CALLBACK_OR_NULL(v));
    }
    get onvolumechange() {
      return WRAP(GET(this.@wrapped, 'onvolumechange'));
    }
    set onvolumechange(v) {
      SET(this.@wrapped, 'onvolumechange', CALLBACK_OR_NULL(v));
    }
    get onwaiting() {
      return WRAP(GET(this.@wrapped, 'onwaiting'));
    }
    set onwaiting(v) {
      SET(this.@wrapped, 'onwaiting', CALLBACK_OR_NULL(v));
    }
    close() {
      CALL(this.@wrapped, 'close');
    }
    stop() {
      CALL(this.@wrapped, 'stop');
    }
    focus() {
      CALL(this.@wrapped, 'focus');
    }
    blur() {
      CALL(this.@wrapped, 'blur');
    }
    open(url, target, features, replace) {
      return WRAP(CALL(this.@wrapped, 'open', '' + url, '' + target, '' + features, !!replace));
    }
    alert(message) {
      CALL(this.@wrapped, 'alert', '' + message);
    }
    confirm(message) {
      return CALL(this.@wrapped, 'confirm', '' + message);
    }
    prompt(message, default) {
      return CALL(this.@wrapped, 'prompt', '' + message, '' + default);
    }
    print() {
      CALL(this.@wrapped, 'print');
    }
    showModalDialog(url, argument) {
      return WRAP(CALL(this.@wrapped, 'showModalDialog', '' + url, UNWRAP(argument)));
    }
    postMessage(message, targetOrigin, ...transfer) {
      CALL(this.@wrapped, 'postMessage', UNWRAP(message), '' + targetOrigin);
    }
    requestFileSystem(type, size, successCallback, errorCallback) {
      CALL(this.@wrapped, 'requestFileSystem', toInt16(type), size >>> 0, CALLBACK(successCallback), CALLBACK(errorCallback));
    }
    resolveLocalFileSystemURL(url, successCallback, errorCallback) {
      CALL(this.@wrapped, 'resolveLocalFileSystemURL', '' + url, CALLBACK(successCallback), CALLBACK(errorCallback));
    }
    btoa(btoa) {
      return CALL(this.@wrapped, 'btoa', '' + btoa);
    }
    atob(atob) {
      return CALL(this.@wrapped, 'atob', '' + atob);
    }
    setTimeout(handler, timeout, args) {
      return CALL(this.@wrapped, 'setTimeout', UNWRAP(handler), timeout >> 0, UNWRAP(args));
    }
    clearTimeout(handle) {
      CALL(this.@wrapped, 'clearTimeout', handle >> 0);
    }
    setInterval(handler, timeout, args) {
      return CALL(this.@wrapped, 'setInterval', UNWRAP(handler), timeout >> 0, UNWRAP(args));
    }
    clearInterval(handle) {
      CALL(this.@wrapped, 'clearInterval', handle >> 0);
    }
  }
  constants(Window, { TEMPORARY: 0, PERSISTENT: 1 });
  export class WindowModal {
    get returnValue() {
      return GET(this.@wrapped, 'returnValue');
    }
    set returnValue(v) {
      SET(this.@wrapped, 'returnValue', '' + v);
    }
    get dialogArguments() {
      return WRAP(GET(this.@wrapped, 'dialogArguments'));
    }
  }
  export class Worker extends EventTarget {
    constructor(scriptURL) {
      this.@wrapped = CONSTRUCT(Worker, '' + scriptURL);
    }
    get onmessage() {
      return WRAP(GET(this.@wrapped, 'onmessage'));
    }
    set onmessage(v) {
      SET(this.@wrapped, 'onmessage', CALLBACK(v));
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', CALLBACK(v));
    }
    terminate() {
      CALL(this.@wrapped, 'terminate');
    }
    postMessage(message, ...transfer) {
      CALL(this.@wrapped, 'postMessage', UNWRAP(message));
    }
  }
  export class WorkerGlobalScope extends EventTarget {
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', CALLBACK(v));
    }
    get onoffline() {
      return WRAP(GET(this.@wrapped, 'onoffline'));
    }
    set onoffline(v) {
      SET(this.@wrapped, 'onoffline', CALLBACK(v));
    }
    get ononline() {
      return WRAP(GET(this.@wrapped, 'ononline'));
    }
    set ononline(v) {
      SET(this.@wrapped, 'ononline', CALLBACK(v));
    }
    get self() {
      return WRAP(GET(this.@wrapped, 'self'));
    }
    get location() {
      return WRAP(GET(this.@wrapped, 'location'));
    }
    get navigator() {
      return WRAP(GET(this.@wrapped, 'navigator'));
    }
    close() {
      CALL(this.@wrapped, 'close');
    }
    requestFileSystem(type, size, successCallback, errorCallback) {
      CALL(this.@wrapped, 'requestFileSystem', toInt16(type), size >>> 0, CALLBACK(successCallback), CALLBACK(errorCallback));
    }
    resolveLocalFileSystemURL(url, successCallback, errorCallback) {
      CALL(this.@wrapped, 'resolveLocalFileSystemURL', '' + url, CALLBACK(successCallback), CALLBACK(errorCallback));
    }
    requestFileSystemSync(type, size) {
      return WRAP(CALL(this.@wrapped, 'requestFileSystemSync', toInt16(type), size >>> 0));
    }
    resolveLocalFileSystemSyncURL(url) {
      return WRAP(CALL(this.@wrapped, 'resolveLocalFileSystemSyncURL', '' + url));
    }
    importScripts(urls) {
      CALL(this.@wrapped, 'importScripts', '' + urls);
    }
  }
  constants(WorkerGlobalScope, { TEMPORARY: 0, PERSISTENT: 1 });
  export class WorkerLocation {
    get href() {
      return GET(this.@wrapped, 'href');
    }
    get protocol() {
      return GET(this.@wrapped, 'protocol');
    }
    get host() {
      return GET(this.@wrapped, 'host');
    }
    get hostname() {
      return GET(this.@wrapped, 'hostname');
    }
    get port() {
      return GET(this.@wrapped, 'port');
    }
    get pathname() {
      return GET(this.@wrapped, 'pathname');
    }
    get search() {
      return GET(this.@wrapped, 'search');
    }
    get hash() {
      return GET(this.@wrapped, 'hash');
    }
  }
  export class WorkerNavigator {
    get appName() {
      return GET(this.@wrapped, 'appName');
    }
    get appVersion() {
      return GET(this.@wrapped, 'appVersion');
    }
    get platform() {
      return GET(this.@wrapped, 'platform');
    }
    get userAgent() {
      return GET(this.@wrapped, 'userAgent');
    }
    get onLine() {
      return GET(this.@wrapped, 'onLine');
    }
  }
  export class XMLHttpRequestEventTarget extends EventTarget {
    get onloadstart() {
      return WRAP(GET(this.@wrapped, 'onloadstart'));
    }
    set onloadstart(v) {
      SET(this.@wrapped, 'onloadstart', CALLBACK(v));
    }
    get onprogress() {
      return WRAP(GET(this.@wrapped, 'onprogress'));
    }
    set onprogress(v) {
      SET(this.@wrapped, 'onprogress', CALLBACK(v));
    }
    get onabort() {
      return WRAP(GET(this.@wrapped, 'onabort'));
    }
    set onabort(v) {
      SET(this.@wrapped, 'onabort', CALLBACK(v));
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', CALLBACK(v));
    }
    get onload() {
      return WRAP(GET(this.@wrapped, 'onload'));
    }
    set onload(v) {
      SET(this.@wrapped, 'onload', CALLBACK(v));
    }
    get ontimeout() {
      return WRAP(GET(this.@wrapped, 'ontimeout'));
    }
    set ontimeout(v) {
      SET(this.@wrapped, 'ontimeout', CALLBACK(v));
    }
    get onloadend() {
      return WRAP(GET(this.@wrapped, 'onloadend'));
    }
    set onloadend(v) {
      SET(this.@wrapped, 'onloadend', CALLBACK(v));
    }
  }
  const XMLHttpRequestResponseType = { '': '', arraybuffer: 'arraybuffer', blob: 'blob', document: 'document', json: 'json', text: 'text' };
  export class XMLHttpRequestUpload extends XMLHttpRequestEventTarget {
  }
  export class CharacterData extends Node {
    get data() {
      return GET(this.@wrapped, 'data');
    }
    set data(v) {
      SET(this.@wrapped, 'data', '' + v);
    }
    substringData(offset, count) {
      return CALL(this.@wrapped, 'substringData', offset >>> 0, count >>> 0);
    }
    appendData(data) {
      CALL(this.@wrapped, 'appendData', '' + data);
    }
    insertData(offset, data) {
      CALL(this.@wrapped, 'insertData', offset >>> 0, '' + data);
    }
    deleteData(offset, count) {
      CALL(this.@wrapped, 'deleteData', offset >>> 0, count >>> 0);
    }
    replaceData(offset, count, data) {
      CALL(this.@wrapped, 'replaceData', offset >>> 0, count >>> 0, '' + data);
    }
    before(nodes) {
      CALL(this.@wrapped, 'before', UNWRAP(nodes));
    }
    after(nodes) {
      CALL(this.@wrapped, 'after', UNWRAP(nodes));
    }
    replace(nodes) {
      CALL(this.@wrapped, 'replace', UNWRAP(nodes));
    }
    remove() {
      CALL(this.@wrapped, 'remove');
    }
  }
  export class Comment extends CharacterData {
  }
  export class CustomEvent extends Event {
    constructor(type, eventInitDict) {
      this.@wrapped = CONSTRUCT(CustomEvent, '' + type, new CustomEventInit(eventInitDict));
    }
    get detail() {
      return WRAP(GET(this.@wrapped, 'detail'));
    }
  }
  class CustomEventInit extends EventInit {
    constructor(dict) {
      dict = dict || EMPTY;
      super(dict);
      this.detail = 'detail' in dict ? dict.detail : '';
    }
  }
  export class DOMSettableTokenList extends DOMTokenList {
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', '' + v);
    }
  }
  export class Document extends Node {
    get implementation() {
      return WRAP(GET(this.@wrapped, 'implementation'));
    }
    get URL() {
      return GET(this.@wrapped, 'URL');
    }
    get documentURI() {
      return GET(this.@wrapped, 'documentURI');
    }
    get compatMode() {
      return GET(this.@wrapped, 'compatMode');
    }
    get characterSet() {
      return GET(this.@wrapped, 'characterSet');
    }
    get contentType() {
      return GET(this.@wrapped, 'contentType');
    }
    get doctype() {
      return WRAP(GET(this.@wrapped, 'doctype'));
    }
    get documentElement() {
      return WRAP(GET(this.@wrapped, 'documentElement'));
    }
    getElementsByTagName(localName) {
      return WRAP(CALL(this.@wrapped, 'getElementsByTagName', '' + localName));
    }
    getElementsByTagNameNS(namespace, localName) {
      return WRAP(CALL(this.@wrapped, 'getElementsByTagNameNS', '' + namespace, '' + localName));
    }
    getElementsByClassName(classNames) {
      return WRAP(CALL(this.@wrapped, 'getElementsByClassName', '' + classNames));
    }
    getElementById(elementId) {
      return WRAP(CALL(this.@wrapped, 'getElementById', '' + elementId));
    }
    createElement(localName) {
      return WRAP(CALL(this.@wrapped, 'createElement', '' + localName));
    }
    createElementNS(namespace, qualifiedName) {
      return WRAP(CALL(this.@wrapped, 'createElementNS', '' + namespace, '' + qualifiedName));
    }
    createDocumentFragment() {
      return WRAP(CALL(this.@wrapped, 'createDocumentFragment'));
    }
    createTextNode(data) {
      return WRAP(CALL(this.@wrapped, 'createTextNode', '' + data));
    }
    createComment(data) {
      return WRAP(CALL(this.@wrapped, 'createComment', '' + data));
    }
    createProcessingInstruction(target, data) {
      return WRAP(CALL(this.@wrapped, 'createProcessingInstruction', '' + target, '' + data));
    }
    importNode(node, deep) {
      return WRAP(CALL(this.@wrapped, 'importNode', UNWRAP(node), !!deep));
    }
    adoptNode(node) {
      return WRAP(CALL(this.@wrapped, 'adoptNode', UNWRAP(node)));
    }
    createEvent(interface) {
      return WRAP(CALL(this.@wrapped, 'createEvent', '' + interface));
    }
    createRange() {
      return WRAP(CALL(this.@wrapped, 'createRange'));
    }
    createNodeIterator(root, whatToShow, filter) {
      return WRAP(CALL(this.@wrapped, 'createNodeIterator', UNWRAP(root), whatToShow >>> 0, UNWRAP(filter)));
    }
    createTreeWalker(root, whatToShow, filter) {
      return WRAP(CALL(this.@wrapped, 'createTreeWalker', UNWRAP(root), whatToShow >>> 0, UNWRAP(filter)));
    }
    prepend(nodes) {
      CALL(this.@wrapped, 'prepend', UNWRAP(nodes));
    }
    append(nodes) {
      CALL(this.@wrapped, 'append', UNWRAP(nodes));
    }
  }
  export class DocumentFragment extends Node {
    prepend(nodes) {
      CALL(this.@wrapped, 'prepend', UNWRAP(nodes));
    }
    append(nodes) {
      CALL(this.@wrapped, 'append', UNWRAP(nodes));
    }
  }
  export class DocumentType extends Node {
    get name() {
      return GET(this.@wrapped, 'name');
    }
    get publicId() {
      return GET(this.@wrapped, 'publicId');
    }
    get systemId() {
      return GET(this.@wrapped, 'systemId');
    }
    before(nodes) {
      CALL(this.@wrapped, 'before', UNWRAP(nodes));
    }
    after(nodes) {
      CALL(this.@wrapped, 'after', UNWRAP(nodes));
    }
    replace(nodes) {
      CALL(this.@wrapped, 'replace', UNWRAP(nodes));
    }
    remove() {
      CALL(this.@wrapped, 'remove');
    }
  }
  export class Element extends Node {
    get id() {
      return GET(this.@wrapped, 'id');
    }
    set id(v) {
      SET(this.@wrapped, 'id', '' + v);
    }
    get className() {
      return GET(this.@wrapped, 'className');
    }
    set className(v) {
      SET(this.@wrapped, 'className', '' + v);
    }
    get namespaceURI() {
      return GET(this.@wrapped, 'namespaceURI');
    }
    get prefix() {
      return GET(this.@wrapped, 'prefix');
    }
    get localName() {
      return GET(this.@wrapped, 'localName');
    }
    get tagName() {
      return GET(this.@wrapped, 'tagName');
    }
    get classList() {
      return WRAP(GET(this.@wrapped, 'classList'));
    }
    get attributes() {
      return WRAP(GET(this.@wrapped, 'attributes'));
    }
    get children() {
      return WRAP(GET(this.@wrapped, 'children'));
    }
    get firstElementChild() {
      return WRAP(GET(this.@wrapped, 'firstElementChild'));
    }
    get lastElementChild() {
      return WRAP(GET(this.@wrapped, 'lastElementChild'));
    }
    get previousElementSibling() {
      return WRAP(GET(this.@wrapped, 'previousElementSibling'));
    }
    get nextElementSibling() {
      return WRAP(GET(this.@wrapped, 'nextElementSibling'));
    }
    get childElementCount() {
      return GET(this.@wrapped, 'childElementCount');
    }
    getAttribute(name) {
      return CALL(this.@wrapped, 'getAttribute', '' + name);
    }
    getAttributeNS(namespace, localName) {
      return CALL(this.@wrapped, 'getAttributeNS', '' + namespace, '' + localName);
    }
    setAttribute(name, value) {
      CALL(this.@wrapped, 'setAttribute', '' + name, '' + value);
    }
    setAttributeNS(namespace, name, value) {
      CALL(this.@wrapped, 'setAttributeNS', '' + namespace, '' + name, '' + value);
    }
    removeAttribute(name) {
      CALL(this.@wrapped, 'removeAttribute', '' + name);
    }
    removeAttributeNS(namespace, localName) {
      CALL(this.@wrapped, 'removeAttributeNS', '' + namespace, '' + localName);
    }
    hasAttribute(name) {
      return CALL(this.@wrapped, 'hasAttribute', '' + name);
    }
    hasAttributeNS(namespace, localName) {
      return CALL(this.@wrapped, 'hasAttributeNS', '' + namespace, '' + localName);
    }
    getElementsByTagName(localName) {
      return WRAP(CALL(this.@wrapped, 'getElementsByTagName', '' + localName));
    }
    getElementsByTagNameNS(namespace, localName) {
      return WRAP(CALL(this.@wrapped, 'getElementsByTagNameNS', '' + namespace, '' + localName));
    }
    getElementsByClassName(classNames) {
      return WRAP(CALL(this.@wrapped, 'getElementsByClassName', '' + classNames));
    }
    prepend(nodes) {
      CALL(this.@wrapped, 'prepend', UNWRAP(nodes));
    }
    append(nodes) {
      CALL(this.@wrapped, 'append', UNWRAP(nodes));
    }
    before(nodes) {
      CALL(this.@wrapped, 'before', UNWRAP(nodes));
    }
    after(nodes) {
      CALL(this.@wrapped, 'after', UNWRAP(nodes));
    }
    replace(nodes) {
      CALL(this.@wrapped, 'replace', UNWRAP(nodes));
    }
    remove() {
      CALL(this.@wrapped, 'remove');
    }
  }
  export class ProcessingInstruction extends CharacterData {
    get target() {
      return GET(this.@wrapped, 'target');
    }
    get sheet() {
      return WRAP(GET(this.@wrapped, 'sheet'));
    }
  }
  export class Text extends CharacterData {
    get wholeText() {
      return GET(this.@wrapped, 'wholeText');
    }
    splitText(offset) {
      return WRAP(CALL(this.@wrapped, 'splitText', offset >>> 0));
    }
  }
  export class XMLDocument extends Document {
  }
  export class DedicatedWorkerGlobalScope extends WorkerGlobalScope {
    get onmessage() {
      return WRAP(GET(this.@wrapped, 'onmessage'));
    }
    set onmessage(v) {
      SET(this.@wrapped, 'onmessage', CALLBACK(v));
    }
    postMessage(message, ...transfer) {
      CALL(this.@wrapped, 'postMessage', UNWRAP(message));
    }
  }
  export class HTMLElement extends Element {
    get title() {
      return GET(this.@wrapped, 'title');
    }
    set title(v) {
      SET(this.@wrapped, 'title', '' + v);
    }
    get lang() {
      return GET(this.@wrapped, 'lang');
    }
    set lang(v) {
      SET(this.@wrapped, 'lang', '' + v);
    }
    get translate() {
      return GET(this.@wrapped, 'translate');
    }
    set translate(v) {
      SET(this.@wrapped, 'translate', !!v);
    }
    get dir() {
      return GET(this.@wrapped, 'dir');
    }
    set dir(v) {
      SET(this.@wrapped, 'dir', '' + v);
    }
    get itemScope() {
      return GET(this.@wrapped, 'itemScope');
    }
    set itemScope(v) {
      SET(this.@wrapped, 'itemScope', !!v);
    }
    get itemId() {
      return GET(this.@wrapped, 'itemId');
    }
    set itemId(v) {
      SET(this.@wrapped, 'itemId', '' + v);
    }
    get itemValue() {
      return WRAP(GET(this.@wrapped, 'itemValue'));
    }
    set itemValue(v) {
      SET(this.@wrapped, 'itemValue', UNWRAP(v));
    }
    get hidden() {
      return GET(this.@wrapped, 'hidden');
    }
    set hidden(v) {
      SET(this.@wrapped, 'hidden', !!v);
    }
    get tabIndex() {
      return GET(this.@wrapped, 'tabIndex');
    }
    set tabIndex(v) {
      SET(this.@wrapped, 'tabIndex', v >> 0);
    }
    get accessKey() {
      return GET(this.@wrapped, 'accessKey');
    }
    set accessKey(v) {
      SET(this.@wrapped, 'accessKey', '' + v);
    }
    get draggable() {
      return GET(this.@wrapped, 'draggable');
    }
    set draggable(v) {
      SET(this.@wrapped, 'draggable', !!v);
    }
    get contentEditable() {
      return GET(this.@wrapped, 'contentEditable');
    }
    set contentEditable(v) {
      SET(this.@wrapped, 'contentEditable', '' + v);
    }
    get contextMenu() {
      return WRAP(GET(this.@wrapped, 'contextMenu'));
    }
    set contextMenu(v) {
      SET(this.@wrapped, 'contextMenu', UNWRAP(v));
    }
    get spellcheck() {
      return GET(this.@wrapped, 'spellcheck');
    }
    set spellcheck(v) {
      SET(this.@wrapped, 'spellcheck', !!v);
    }
    get onabort() {
      return WRAP(GET(this.@wrapped, 'onabort'));
    }
    set onabort(v) {
      SET(this.@wrapped, 'onabort', CALLBACK_OR_NULL(v));
    }
    get onblur() {
      return WRAP(GET(this.@wrapped, 'onblur'));
    }
    set onblur(v) {
      SET(this.@wrapped, 'onblur', CALLBACK_OR_NULL(v));
    }
    get oncancel() {
      return WRAP(GET(this.@wrapped, 'oncancel'));
    }
    set oncancel(v) {
      SET(this.@wrapped, 'oncancel', CALLBACK_OR_NULL(v));
    }
    get oncanplay() {
      return WRAP(GET(this.@wrapped, 'oncanplay'));
    }
    set oncanplay(v) {
      SET(this.@wrapped, 'oncanplay', CALLBACK_OR_NULL(v));
    }
    get oncanplaythrough() {
      return WRAP(GET(this.@wrapped, 'oncanplaythrough'));
    }
    set oncanplaythrough(v) {
      SET(this.@wrapped, 'oncanplaythrough', CALLBACK_OR_NULL(v));
    }
    get onchange() {
      return WRAP(GET(this.@wrapped, 'onchange'));
    }
    set onchange(v) {
      SET(this.@wrapped, 'onchange', CALLBACK_OR_NULL(v));
    }
    get onclick() {
      return WRAP(GET(this.@wrapped, 'onclick'));
    }
    set onclick(v) {
      SET(this.@wrapped, 'onclick', CALLBACK_OR_NULL(v));
    }
    get onclose() {
      return WRAP(GET(this.@wrapped, 'onclose'));
    }
    set onclose(v) {
      SET(this.@wrapped, 'onclose', CALLBACK_OR_NULL(v));
    }
    get oncontextmenu() {
      return WRAP(GET(this.@wrapped, 'oncontextmenu'));
    }
    set oncontextmenu(v) {
      SET(this.@wrapped, 'oncontextmenu', CALLBACK_OR_NULL(v));
    }
    get oncuechange() {
      return WRAP(GET(this.@wrapped, 'oncuechange'));
    }
    set oncuechange(v) {
      SET(this.@wrapped, 'oncuechange', CALLBACK_OR_NULL(v));
    }
    get ondblclick() {
      return WRAP(GET(this.@wrapped, 'ondblclick'));
    }
    set ondblclick(v) {
      SET(this.@wrapped, 'ondblclick', CALLBACK_OR_NULL(v));
    }
    get ondrag() {
      return WRAP(GET(this.@wrapped, 'ondrag'));
    }
    set ondrag(v) {
      SET(this.@wrapped, 'ondrag', CALLBACK_OR_NULL(v));
    }
    get ondragend() {
      return WRAP(GET(this.@wrapped, 'ondragend'));
    }
    set ondragend(v) {
      SET(this.@wrapped, 'ondragend', CALLBACK_OR_NULL(v));
    }
    get ondragenter() {
      return WRAP(GET(this.@wrapped, 'ondragenter'));
    }
    set ondragenter(v) {
      SET(this.@wrapped, 'ondragenter', CALLBACK_OR_NULL(v));
    }
    get ondragleave() {
      return WRAP(GET(this.@wrapped, 'ondragleave'));
    }
    set ondragleave(v) {
      SET(this.@wrapped, 'ondragleave', CALLBACK_OR_NULL(v));
    }
    get ondragover() {
      return WRAP(GET(this.@wrapped, 'ondragover'));
    }
    set ondragover(v) {
      SET(this.@wrapped, 'ondragover', CALLBACK_OR_NULL(v));
    }
    get ondragstart() {
      return WRAP(GET(this.@wrapped, 'ondragstart'));
    }
    set ondragstart(v) {
      SET(this.@wrapped, 'ondragstart', CALLBACK_OR_NULL(v));
    }
    get ondrop() {
      return WRAP(GET(this.@wrapped, 'ondrop'));
    }
    set ondrop(v) {
      SET(this.@wrapped, 'ondrop', CALLBACK_OR_NULL(v));
    }
    get ondurationchange() {
      return WRAP(GET(this.@wrapped, 'ondurationchange'));
    }
    set ondurationchange(v) {
      SET(this.@wrapped, 'ondurationchange', CALLBACK_OR_NULL(v));
    }
    get onemptied() {
      return WRAP(GET(this.@wrapped, 'onemptied'));
    }
    set onemptied(v) {
      SET(this.@wrapped, 'onemptied', CALLBACK_OR_NULL(v));
    }
    get onended() {
      return WRAP(GET(this.@wrapped, 'onended'));
    }
    set onended(v) {
      SET(this.@wrapped, 'onended', CALLBACK_OR_NULL(v));
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', UNWRAP(v));
    }
    get onfocus() {
      return WRAP(GET(this.@wrapped, 'onfocus'));
    }
    set onfocus(v) {
      SET(this.@wrapped, 'onfocus', CALLBACK_OR_NULL(v));
    }
    get oninput() {
      return WRAP(GET(this.@wrapped, 'oninput'));
    }
    set oninput(v) {
      SET(this.@wrapped, 'oninput', CALLBACK_OR_NULL(v));
    }
    get oninvalid() {
      return WRAP(GET(this.@wrapped, 'oninvalid'));
    }
    set oninvalid(v) {
      SET(this.@wrapped, 'oninvalid', CALLBACK_OR_NULL(v));
    }
    get onkeydown() {
      return WRAP(GET(this.@wrapped, 'onkeydown'));
    }
    set onkeydown(v) {
      SET(this.@wrapped, 'onkeydown', CALLBACK_OR_NULL(v));
    }
    get onkeypress() {
      return WRAP(GET(this.@wrapped, 'onkeypress'));
    }
    set onkeypress(v) {
      SET(this.@wrapped, 'onkeypress', CALLBACK_OR_NULL(v));
    }
    get onkeyup() {
      return WRAP(GET(this.@wrapped, 'onkeyup'));
    }
    set onkeyup(v) {
      SET(this.@wrapped, 'onkeyup', CALLBACK_OR_NULL(v));
    }
    get onload() {
      return WRAP(GET(this.@wrapped, 'onload'));
    }
    set onload(v) {
      SET(this.@wrapped, 'onload', CALLBACK_OR_NULL(v));
    }
    get onloadeddata() {
      return WRAP(GET(this.@wrapped, 'onloadeddata'));
    }
    set onloadeddata(v) {
      SET(this.@wrapped, 'onloadeddata', CALLBACK_OR_NULL(v));
    }
    get onloadedmetadata() {
      return WRAP(GET(this.@wrapped, 'onloadedmetadata'));
    }
    set onloadedmetadata(v) {
      SET(this.@wrapped, 'onloadedmetadata', CALLBACK_OR_NULL(v));
    }
    get onloadstart() {
      return WRAP(GET(this.@wrapped, 'onloadstart'));
    }
    set onloadstart(v) {
      SET(this.@wrapped, 'onloadstart', CALLBACK_OR_NULL(v));
    }
    get onmousedown() {
      return WRAP(GET(this.@wrapped, 'onmousedown'));
    }
    set onmousedown(v) {
      SET(this.@wrapped, 'onmousedown', CALLBACK_OR_NULL(v));
    }
    get onmousemove() {
      return WRAP(GET(this.@wrapped, 'onmousemove'));
    }
    set onmousemove(v) {
      SET(this.@wrapped, 'onmousemove', CALLBACK_OR_NULL(v));
    }
    get onmouseout() {
      return WRAP(GET(this.@wrapped, 'onmouseout'));
    }
    set onmouseout(v) {
      SET(this.@wrapped, 'onmouseout', CALLBACK_OR_NULL(v));
    }
    get onmouseover() {
      return WRAP(GET(this.@wrapped, 'onmouseover'));
    }
    set onmouseover(v) {
      SET(this.@wrapped, 'onmouseover', CALLBACK_OR_NULL(v));
    }
    get onmouseup() {
      return WRAP(GET(this.@wrapped, 'onmouseup'));
    }
    set onmouseup(v) {
      SET(this.@wrapped, 'onmouseup', CALLBACK_OR_NULL(v));
    }
    get onmousewheel() {
      return WRAP(GET(this.@wrapped, 'onmousewheel'));
    }
    set onmousewheel(v) {
      SET(this.@wrapped, 'onmousewheel', CALLBACK_OR_NULL(v));
    }
    get onpause() {
      return WRAP(GET(this.@wrapped, 'onpause'));
    }
    set onpause(v) {
      SET(this.@wrapped, 'onpause', CALLBACK_OR_NULL(v));
    }
    get onplay() {
      return WRAP(GET(this.@wrapped, 'onplay'));
    }
    set onplay(v) {
      SET(this.@wrapped, 'onplay', CALLBACK_OR_NULL(v));
    }
    get onplaying() {
      return WRAP(GET(this.@wrapped, 'onplaying'));
    }
    set onplaying(v) {
      SET(this.@wrapped, 'onplaying', CALLBACK_OR_NULL(v));
    }
    get onprogress() {
      return WRAP(GET(this.@wrapped, 'onprogress'));
    }
    set onprogress(v) {
      SET(this.@wrapped, 'onprogress', CALLBACK_OR_NULL(v));
    }
    get onratechange() {
      return WRAP(GET(this.@wrapped, 'onratechange'));
    }
    set onratechange(v) {
      SET(this.@wrapped, 'onratechange', CALLBACK_OR_NULL(v));
    }
    get onreset() {
      return WRAP(GET(this.@wrapped, 'onreset'));
    }
    set onreset(v) {
      SET(this.@wrapped, 'onreset', CALLBACK_OR_NULL(v));
    }
    get onscroll() {
      return WRAP(GET(this.@wrapped, 'onscroll'));
    }
    set onscroll(v) {
      SET(this.@wrapped, 'onscroll', CALLBACK_OR_NULL(v));
    }
    get onseeked() {
      return WRAP(GET(this.@wrapped, 'onseeked'));
    }
    set onseeked(v) {
      SET(this.@wrapped, 'onseeked', CALLBACK_OR_NULL(v));
    }
    get onseeking() {
      return WRAP(GET(this.@wrapped, 'onseeking'));
    }
    set onseeking(v) {
      SET(this.@wrapped, 'onseeking', CALLBACK_OR_NULL(v));
    }
    get onselect() {
      return WRAP(GET(this.@wrapped, 'onselect'));
    }
    set onselect(v) {
      SET(this.@wrapped, 'onselect', CALLBACK_OR_NULL(v));
    }
    get onshow() {
      return WRAP(GET(this.@wrapped, 'onshow'));
    }
    set onshow(v) {
      SET(this.@wrapped, 'onshow', CALLBACK_OR_NULL(v));
    }
    get onstalled() {
      return WRAP(GET(this.@wrapped, 'onstalled'));
    }
    set onstalled(v) {
      SET(this.@wrapped, 'onstalled', CALLBACK_OR_NULL(v));
    }
    get onsubmit() {
      return WRAP(GET(this.@wrapped, 'onsubmit'));
    }
    set onsubmit(v) {
      SET(this.@wrapped, 'onsubmit', CALLBACK_OR_NULL(v));
    }
    get onsuspend() {
      return WRAP(GET(this.@wrapped, 'onsuspend'));
    }
    set onsuspend(v) {
      SET(this.@wrapped, 'onsuspend', CALLBACK_OR_NULL(v));
    }
    get ontimeupdate() {
      return WRAP(GET(this.@wrapped, 'ontimeupdate'));
    }
    set ontimeupdate(v) {
      SET(this.@wrapped, 'ontimeupdate', CALLBACK_OR_NULL(v));
    }
    get onvolumechange() {
      return WRAP(GET(this.@wrapped, 'onvolumechange'));
    }
    set onvolumechange(v) {
      SET(this.@wrapped, 'onvolumechange', CALLBACK_OR_NULL(v));
    }
    get onwaiting() {
      return WRAP(GET(this.@wrapped, 'onwaiting'));
    }
    set onwaiting(v) {
      SET(this.@wrapped, 'onwaiting', CALLBACK_OR_NULL(v));
    }
    get dataset() {
      return WRAP(GET(this.@wrapped, 'dataset'));
    }
    get itemType() {
      return WRAP(GET(this.@wrapped, 'itemType'));
    }
    get itemRef() {
      return WRAP(GET(this.@wrapped, 'itemRef'));
    }
    get itemProp() {
      return WRAP(GET(this.@wrapped, 'itemProp'));
    }
    get properties() {
      return WRAP(GET(this.@wrapped, 'properties'));
    }
    get accessKeyLabel() {
      return GET(this.@wrapped, 'accessKeyLabel');
    }
    get dropzone() {
      return WRAP(GET(this.@wrapped, 'dropzone'));
    }
    get isContentEditable() {
      return GET(this.@wrapped, 'isContentEditable');
    }
    get commandType() {
      return GET(this.@wrapped, 'commandType');
    }
    get commandLabel() {
      return GET(this.@wrapped, 'commandLabel');
    }
    get commandIcon() {
      return GET(this.@wrapped, 'commandIcon');
    }
    get commandHidden() {
      return GET(this.@wrapped, 'commandHidden');
    }
    get commandDisabled() {
      return GET(this.@wrapped, 'commandDisabled');
    }
    get commandChecked() {
      return GET(this.@wrapped, 'commandChecked');
    }
    get style() {
      return WRAP(GET(this.@wrapped, 'style'));
    }
    click() {
      CALL(this.@wrapped, 'click');
    }
    focus() {
      CALL(this.@wrapped, 'focus');
    }
    blur() {
      CALL(this.@wrapped, 'blur');
    }
  }
  export class HTMLEmbedElement extends HTMLElement {
    get src() {
      return GET(this.@wrapped, 'src');
    }
    set src(v) {
      SET(this.@wrapped, 'src', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', '' + v);
    }
    get height() {
      return GET(this.@wrapped, 'height');
    }
    set height(v) {
      SET(this.@wrapped, 'height', '' + v);
    }
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
  }
  export class HTMLFieldSetElement extends HTMLElement {
    get disabled() {
      return GET(this.@wrapped, 'disabled');
    }
    set disabled(v) {
      SET(this.@wrapped, 'disabled', !!v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    get elements() {
      return WRAP(GET(this.@wrapped, 'elements'));
    }
    get willValidate() {
      return GET(this.@wrapped, 'willValidate');
    }
    get validity() {
      return WRAP(GET(this.@wrapped, 'validity'));
    }
    get validationMessage() {
      return GET(this.@wrapped, 'validationMessage');
    }
    checkValidity() {
      return CALL(this.@wrapped, 'checkValidity');
    }
    setCustomValidity(error) {
      CALL(this.@wrapped, 'setCustomValidity', '' + error);
    }
  }
  export class HTMLFontElement extends HTMLElement {
    get color() {
      return GET(this.@wrapped, 'color');
    }
    set color(v) {
      SET(this.@wrapped, 'color', '' + v);
    }
    get face() {
      return GET(this.@wrapped, 'face');
    }
    set face(v) {
      SET(this.@wrapped, 'face', '' + v);
    }
    get size() {
      return GET(this.@wrapped, 'size');
    }
    set size(v) {
      SET(this.@wrapped, 'size', '' + v);
    }
  }
  export class HTMLFormElement extends HTMLElement {
    get acceptCharset() {
      return GET(this.@wrapped, 'acceptCharset');
    }
    set acceptCharset(v) {
      SET(this.@wrapped, 'acceptCharset', '' + v);
    }
    get action() {
      return GET(this.@wrapped, 'action');
    }
    set action(v) {
      SET(this.@wrapped, 'action', '' + v);
    }
    get autocomplete() {
      return GET(this.@wrapped, 'autocomplete');
    }
    set autocomplete(v) {
      SET(this.@wrapped, 'autocomplete', '' + v);
    }
    get enctype() {
      return GET(this.@wrapped, 'enctype');
    }
    set enctype(v) {
      SET(this.@wrapped, 'enctype', '' + v);
    }
    get encoding() {
      return GET(this.@wrapped, 'encoding');
    }
    set encoding(v) {
      SET(this.@wrapped, 'encoding', '' + v);
    }
    get method() {
      return GET(this.@wrapped, 'method');
    }
    set method(v) {
      SET(this.@wrapped, 'method', '' + v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get noValidate() {
      return GET(this.@wrapped, 'noValidate');
    }
    set noValidate(v) {
      SET(this.@wrapped, 'noValidate', !!v);
    }
    get target() {
      return GET(this.@wrapped, 'target');
    }
    set target(v) {
      SET(this.@wrapped, 'target', '' + v);
    }
    submit() {
      CALL(this.@wrapped, 'submit');
    }
    reset() {
      CALL(this.@wrapped, 'reset');
    }
    checkValidity() {
      return CALL(this.@wrapped, 'checkValidity');
    }
  }
  export class HTMLFrameElement extends HTMLElement {
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get scrolling() {
      return GET(this.@wrapped, 'scrolling');
    }
    set scrolling(v) {
      SET(this.@wrapped, 'scrolling', '' + v);
    }
    get src() {
      return GET(this.@wrapped, 'src');
    }
    set src(v) {
      SET(this.@wrapped, 'src', '' + v);
    }
    get frameBorder() {
      return GET(this.@wrapped, 'frameBorder');
    }
    set frameBorder(v) {
      SET(this.@wrapped, 'frameBorder', '' + v);
    }
    get longDesc() {
      return GET(this.@wrapped, 'longDesc');
    }
    set longDesc(v) {
      SET(this.@wrapped, 'longDesc', '' + v);
    }
    get noResize() {
      return GET(this.@wrapped, 'noResize');
    }
    set noResize(v) {
      SET(this.@wrapped, 'noResize', !!v);
    }
    get marginHeight() {
      return GET(this.@wrapped, 'marginHeight');
    }
    set marginHeight(v) {
      SET(this.@wrapped, 'marginHeight', '' + v);
    }
    get marginWidth() {
      return GET(this.@wrapped, 'marginWidth');
    }
    set marginWidth(v) {
      SET(this.@wrapped, 'marginWidth', '' + v);
    }
    get contentDocument() {
      return WRAP(GET(this.@wrapped, 'contentDocument'));
    }
    get contentWindow() {
      return WRAP(GET(this.@wrapped, 'contentWindow'));
    }
  }
  export class HTMLFrameSetElement extends HTMLElement {
    get cols() {
      return GET(this.@wrapped, 'cols');
    }
    set cols(v) {
      SET(this.@wrapped, 'cols', '' + v);
    }
    get rows() {
      return GET(this.@wrapped, 'rows');
    }
    set rows(v) {
      SET(this.@wrapped, 'rows', '' + v);
    }
    get onafterprint() {
      return WRAP(GET(this.@wrapped, 'onafterprint'));
    }
    set onafterprint(v) {
      SET(this.@wrapped, 'onafterprint', CALLBACK(v));
    }
    get onbeforeprint() {
      return WRAP(GET(this.@wrapped, 'onbeforeprint'));
    }
    set onbeforeprint(v) {
      SET(this.@wrapped, 'onbeforeprint', CALLBACK(v));
    }
    get onbeforeunload() {
      return WRAP(GET(this.@wrapped, 'onbeforeunload'));
    }
    set onbeforeunload(v) {
      SET(this.@wrapped, 'onbeforeunload', CALLBACK(v));
    }
    get onblur() {
      return WRAP(GET(this.@wrapped, 'onblur'));
    }
    set onblur(v) {
      SET(this.@wrapped, 'onblur', CALLBACK(v));
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', CALLBACK(v));
    }
    get onfocus() {
      return WRAP(GET(this.@wrapped, 'onfocus'));
    }
    set onfocus(v) {
      SET(this.@wrapped, 'onfocus', CALLBACK(v));
    }
    get onhashchange() {
      return WRAP(GET(this.@wrapped, 'onhashchange'));
    }
    set onhashchange(v) {
      SET(this.@wrapped, 'onhashchange', CALLBACK(v));
    }
    get onload() {
      return WRAP(GET(this.@wrapped, 'onload'));
    }
    set onload(v) {
      SET(this.@wrapped, 'onload', CALLBACK(v));
    }
    get onmessage() {
      return WRAP(GET(this.@wrapped, 'onmessage'));
    }
    set onmessage(v) {
      SET(this.@wrapped, 'onmessage', CALLBACK(v));
    }
    get onoffline() {
      return WRAP(GET(this.@wrapped, 'onoffline'));
    }
    set onoffline(v) {
      SET(this.@wrapped, 'onoffline', CALLBACK(v));
    }
    get ononline() {
      return WRAP(GET(this.@wrapped, 'ononline'));
    }
    set ononline(v) {
      SET(this.@wrapped, 'ononline', CALLBACK(v));
    }
    get onpagehide() {
      return WRAP(GET(this.@wrapped, 'onpagehide'));
    }
    set onpagehide(v) {
      SET(this.@wrapped, 'onpagehide', CALLBACK(v));
    }
    get onpageshow() {
      return WRAP(GET(this.@wrapped, 'onpageshow'));
    }
    set onpageshow(v) {
      SET(this.@wrapped, 'onpageshow', CALLBACK(v));
    }
    get onpopstate() {
      return WRAP(GET(this.@wrapped, 'onpopstate'));
    }
    set onpopstate(v) {
      SET(this.@wrapped, 'onpopstate', CALLBACK(v));
    }
    get onresize() {
      return WRAP(GET(this.@wrapped, 'onresize'));
    }
    set onresize(v) {
      SET(this.@wrapped, 'onresize', CALLBACK(v));
    }
    get onscroll() {
      return WRAP(GET(this.@wrapped, 'onscroll'));
    }
    set onscroll(v) {
      SET(this.@wrapped, 'onscroll', CALLBACK(v));
    }
    get onstorage() {
      return WRAP(GET(this.@wrapped, 'onstorage'));
    }
    set onstorage(v) {
      SET(this.@wrapped, 'onstorage', CALLBACK(v));
    }
    get onunload() {
      return WRAP(GET(this.@wrapped, 'onunload'));
    }
    set onunload(v) {
      SET(this.@wrapped, 'onunload', CALLBACK(v));
    }
  }
  export class HTMLHRElement extends HTMLElement {
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get color() {
      return GET(this.@wrapped, 'color');
    }
    set color(v) {
      SET(this.@wrapped, 'color', '' + v);
    }
    get noShade() {
      return GET(this.@wrapped, 'noShade');
    }
    set noShade(v) {
      SET(this.@wrapped, 'noShade', !!v);
    }
    get size() {
      return GET(this.@wrapped, 'size');
    }
    set size(v) {
      SET(this.@wrapped, 'size', '' + v);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', '' + v);
    }
  }
  export class HTMLHeadElement extends HTMLElement {
  }
  export class HTMLHeadingElement extends HTMLElement {
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
  }
  export class HTMLHtmlElement extends HTMLElement {
    get version() {
      return GET(this.@wrapped, 'version');
    }
    set version(v) {
      SET(this.@wrapped, 'version', '' + v);
    }
  }
  export class HTMLIFrameElement extends HTMLElement {
    get src() {
      return GET(this.@wrapped, 'src');
    }
    set src(v) {
      SET(this.@wrapped, 'src', '' + v);
    }
    get srcdoc() {
      return GET(this.@wrapped, 'srcdoc');
    }
    set srcdoc(v) {
      SET(this.@wrapped, 'srcdoc', '' + v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get seamless() {
      return GET(this.@wrapped, 'seamless');
    }
    set seamless(v) {
      SET(this.@wrapped, 'seamless', !!v);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', '' + v);
    }
    get height() {
      return GET(this.@wrapped, 'height');
    }
    set height(v) {
      SET(this.@wrapped, 'height', '' + v);
    }
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get scrolling() {
      return GET(this.@wrapped, 'scrolling');
    }
    set scrolling(v) {
      SET(this.@wrapped, 'scrolling', '' + v);
    }
    get frameBorder() {
      return GET(this.@wrapped, 'frameBorder');
    }
    set frameBorder(v) {
      SET(this.@wrapped, 'frameBorder', '' + v);
    }
    get longDesc() {
      return GET(this.@wrapped, 'longDesc');
    }
    set longDesc(v) {
      SET(this.@wrapped, 'longDesc', '' + v);
    }
    get marginHeight() {
      return GET(this.@wrapped, 'marginHeight');
    }
    set marginHeight(v) {
      SET(this.@wrapped, 'marginHeight', '' + v);
    }
    get marginWidth() {
      return GET(this.@wrapped, 'marginWidth');
    }
    set marginWidth(v) {
      SET(this.@wrapped, 'marginWidth', '' + v);
    }
    get sandbox() {
      return WRAP(GET(this.@wrapped, 'sandbox'));
    }
    get contentDocument() {
      return WRAP(GET(this.@wrapped, 'contentDocument'));
    }
    get contentWindow() {
      return WRAP(GET(this.@wrapped, 'contentWindow'));
    }
  }
  export var HTMLImageElement = class Image extends HTMLElement {
      };
  export class HTMLInputElement extends HTMLElement {
    get accept() {
      return GET(this.@wrapped, 'accept');
    }
    set accept(v) {
      SET(this.@wrapped, 'accept', '' + v);
    }
    get alt() {
      return GET(this.@wrapped, 'alt');
    }
    set alt(v) {
      SET(this.@wrapped, 'alt', '' + v);
    }
    get autocomplete() {
      return GET(this.@wrapped, 'autocomplete');
    }
    set autocomplete(v) {
      SET(this.@wrapped, 'autocomplete', '' + v);
    }
    get autofocus() {
      return GET(this.@wrapped, 'autofocus');
    }
    set autofocus(v) {
      SET(this.@wrapped, 'autofocus', !!v);
    }
    get defaultChecked() {
      return GET(this.@wrapped, 'defaultChecked');
    }
    set defaultChecked(v) {
      SET(this.@wrapped, 'defaultChecked', !!v);
    }
    get checked() {
      return GET(this.@wrapped, 'checked');
    }
    set checked(v) {
      SET(this.@wrapped, 'checked', !!v);
    }
    get dirName() {
      return GET(this.@wrapped, 'dirName');
    }
    set dirName(v) {
      SET(this.@wrapped, 'dirName', '' + v);
    }
    get disabled() {
      return GET(this.@wrapped, 'disabled');
    }
    set disabled(v) {
      SET(this.@wrapped, 'disabled', !!v);
    }
    get formAction() {
      return GET(this.@wrapped, 'formAction');
    }
    set formAction(v) {
      SET(this.@wrapped, 'formAction', '' + v);
    }
    get formEnctype() {
      return GET(this.@wrapped, 'formEnctype');
    }
    set formEnctype(v) {
      SET(this.@wrapped, 'formEnctype', '' + v);
    }
    get formMethod() {
      return GET(this.@wrapped, 'formMethod');
    }
    set formMethod(v) {
      SET(this.@wrapped, 'formMethod', '' + v);
    }
    get formNoValidate() {
      return GET(this.@wrapped, 'formNoValidate');
    }
    set formNoValidate(v) {
      SET(this.@wrapped, 'formNoValidate', !!v);
    }
    get formTarget() {
      return GET(this.@wrapped, 'formTarget');
    }
    set formTarget(v) {
      SET(this.@wrapped, 'formTarget', '' + v);
    }
    get height() {
      return GET(this.@wrapped, 'height');
    }
    set height(v) {
      SET(this.@wrapped, 'height', v >>> 0);
    }
    get indeterminate() {
      return GET(this.@wrapped, 'indeterminate');
    }
    set indeterminate(v) {
      SET(this.@wrapped, 'indeterminate', !!v);
    }
    get inputMode() {
      return GET(this.@wrapped, 'inputMode');
    }
    set inputMode(v) {
      SET(this.@wrapped, 'inputMode', '' + v);
    }
    get max() {
      return GET(this.@wrapped, 'max');
    }
    set max(v) {
      SET(this.@wrapped, 'max', '' + v);
    }
    get maxLength() {
      return GET(this.@wrapped, 'maxLength');
    }
    set maxLength(v) {
      SET(this.@wrapped, 'maxLength', v >> 0);
    }
    get min() {
      return GET(this.@wrapped, 'min');
    }
    set min(v) {
      SET(this.@wrapped, 'min', '' + v);
    }
    get multiple() {
      return GET(this.@wrapped, 'multiple');
    }
    set multiple(v) {
      SET(this.@wrapped, 'multiple', !!v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get pattern() {
      return GET(this.@wrapped, 'pattern');
    }
    set pattern(v) {
      SET(this.@wrapped, 'pattern', '' + v);
    }
    get placeholder() {
      return GET(this.@wrapped, 'placeholder');
    }
    set placeholder(v) {
      SET(this.@wrapped, 'placeholder', '' + v);
    }
    get readOnly() {
      return GET(this.@wrapped, 'readOnly');
    }
    set readOnly(v) {
      SET(this.@wrapped, 'readOnly', !!v);
    }
    get required() {
      return GET(this.@wrapped, 'required');
    }
    set required(v) {
      SET(this.@wrapped, 'required', !!v);
    }
    get size() {
      return GET(this.@wrapped, 'size');
    }
    set size(v) {
      SET(this.@wrapped, 'size', v >>> 0);
    }
    get src() {
      return GET(this.@wrapped, 'src');
    }
    set src(v) {
      SET(this.@wrapped, 'src', '' + v);
    }
    get step() {
      return GET(this.@wrapped, 'step');
    }
    set step(v) {
      SET(this.@wrapped, 'step', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get defaultValue() {
      return GET(this.@wrapped, 'defaultValue');
    }
    set defaultValue(v) {
      SET(this.@wrapped, 'defaultValue', '' + v);
    }
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', '' + v);
    }
    get valueAsDate() {
      return WRAP(GET(this.@wrapped, 'valueAsDate'));
    }
    set valueAsDate(v) {
      SET(this.@wrapped, 'valueAsDate', UNWRAP(v));
    }
    get valueAsNumber() {
      return GET(this.@wrapped, 'valueAsNumber');
    }
    set valueAsNumber(v) {
      SET(this.@wrapped, 'valueAsNumber', +v || 0);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', v >>> 0);
    }
    get selectionStart() {
      return GET(this.@wrapped, 'selectionStart');
    }
    set selectionStart(v) {
      SET(this.@wrapped, 'selectionStart', v >>> 0);
    }
    get selectionEnd() {
      return GET(this.@wrapped, 'selectionEnd');
    }
    set selectionEnd(v) {
      SET(this.@wrapped, 'selectionEnd', v >>> 0);
    }
    get selectionDirection() {
      return GET(this.@wrapped, 'selectionDirection');
    }
    set selectionDirection(v) {
      SET(this.@wrapped, 'selectionDirection', '' + v);
    }
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get useMap() {
      return GET(this.@wrapped, 'useMap');
    }
    set useMap(v) {
      SET(this.@wrapped, 'useMap', '' + v);
    }
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
    get files() {
      return WRAP(GET(this.@wrapped, 'files'));
    }
    get list() {
      return WRAP(GET(this.@wrapped, 'list'));
    }
    get willValidate() {
      return GET(this.@wrapped, 'willValidate');
    }
    get validity() {
      return WRAP(GET(this.@wrapped, 'validity'));
    }
    get validationMessage() {
      return GET(this.@wrapped, 'validationMessage');
    }
    get labels() {
      return WRAP(GET(this.@wrapped, 'labels'));
    }
    stepUp(n) {
      CALL(this.@wrapped, 'stepUp', n >> 0);
    }
    stepDown(n) {
      CALL(this.@wrapped, 'stepDown', n >> 0);
    }
    checkValidity() {
      return CALL(this.@wrapped, 'checkValidity');
    }
    setCustomValidity(error) {
      CALL(this.@wrapped, 'setCustomValidity', '' + error);
    }
    select() {
      CALL(this.@wrapped, 'select');
    }
    setRangeText(replacement, start, end, selectionMode) {
      CALL(this.@wrapped, 'setRangeText', '' + replacement, start >>> 0, end >>> 0, UNWRAP(selectionMode));
    }
    setSelectionRange(start, end, direction) {
      CALL(this.@wrapped, 'setSelectionRange', start >>> 0, end >>> 0, '' + direction);
    }
  }
  export class HTMLKeygenElement extends HTMLElement {
    get autofocus() {
      return GET(this.@wrapped, 'autofocus');
    }
    set autofocus(v) {
      SET(this.@wrapped, 'autofocus', !!v);
    }
    get challenge() {
      return GET(this.@wrapped, 'challenge');
    }
    set challenge(v) {
      SET(this.@wrapped, 'challenge', '' + v);
    }
    get disabled() {
      return GET(this.@wrapped, 'disabled');
    }
    set disabled(v) {
      SET(this.@wrapped, 'disabled', !!v);
    }
    get keytype() {
      return GET(this.@wrapped, 'keytype');
    }
    set keytype(v) {
      SET(this.@wrapped, 'keytype', '' + v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    get willValidate() {
      return GET(this.@wrapped, 'willValidate');
    }
    get validity() {
      return WRAP(GET(this.@wrapped, 'validity'));
    }
    get validationMessage() {
      return GET(this.@wrapped, 'validationMessage');
    }
    get labels() {
      return WRAP(GET(this.@wrapped, 'labels'));
    }
    checkValidity() {
      return CALL(this.@wrapped, 'checkValidity');
    }
    setCustomValidity(error) {
      CALL(this.@wrapped, 'setCustomValidity', '' + error);
    }
  }
  export class HTMLLIElement extends HTMLElement {
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', v >> 0);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
  }
  export class HTMLLabelElement extends HTMLElement {
    get htmlFor() {
      return GET(this.@wrapped, 'htmlFor');
    }
    set htmlFor(v) {
      SET(this.@wrapped, 'htmlFor', '' + v);
    }
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
    get control() {
      return WRAP(GET(this.@wrapped, 'control'));
    }
  }
  export class HTMLLegendElement extends HTMLElement {
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
  }
  export class HTMLLinkElement extends HTMLElement {
    get disabled() {
      return GET(this.@wrapped, 'disabled');
    }
    set disabled(v) {
      SET(this.@wrapped, 'disabled', !!v);
    }
    get href() {
      return GET(this.@wrapped, 'href');
    }
    set href(v) {
      SET(this.@wrapped, 'href', '' + v);
    }
    get rel() {
      return GET(this.@wrapped, 'rel');
    }
    set rel(v) {
      SET(this.@wrapped, 'rel', '' + v);
    }
    get media() {
      return GET(this.@wrapped, 'media');
    }
    set media(v) {
      SET(this.@wrapped, 'media', '' + v);
    }
    get hreflang() {
      return GET(this.@wrapped, 'hreflang');
    }
    set hreflang(v) {
      SET(this.@wrapped, 'hreflang', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get charset() {
      return GET(this.@wrapped, 'charset');
    }
    set charset(v) {
      SET(this.@wrapped, 'charset', '' + v);
    }
    get rev() {
      return GET(this.@wrapped, 'rev');
    }
    set rev(v) {
      SET(this.@wrapped, 'rev', '' + v);
    }
    get target() {
      return GET(this.@wrapped, 'target');
    }
    set target(v) {
      SET(this.@wrapped, 'target', '' + v);
    }
    get relList() {
      return WRAP(GET(this.@wrapped, 'relList'));
    }
    get sizes() {
      return WRAP(GET(this.@wrapped, 'sizes'));
    }
    get sheet() {
      return WRAP(GET(this.@wrapped, 'sheet'));
    }
  }
  export class HTMLMapElement extends HTMLElement {
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get areas() {
      return WRAP(GET(this.@wrapped, 'areas'));
    }
    get images() {
      return WRAP(GET(this.@wrapped, 'images'));
    }
  }
  export class HTMLMarqueeElement extends HTMLElement {
    get behavior() {
      return GET(this.@wrapped, 'behavior');
    }
    set behavior(v) {
      SET(this.@wrapped, 'behavior', '' + v);
    }
    get bgColor() {
      return GET(this.@wrapped, 'bgColor');
    }
    set bgColor(v) {
      SET(this.@wrapped, 'bgColor', '' + v);
    }
    get direction() {
      return GET(this.@wrapped, 'direction');
    }
    set direction(v) {
      SET(this.@wrapped, 'direction', '' + v);
    }
    get height() {
      return GET(this.@wrapped, 'height');
    }
    set height(v) {
      SET(this.@wrapped, 'height', '' + v);
    }
    get hspace() {
      return GET(this.@wrapped, 'hspace');
    }
    set hspace(v) {
      SET(this.@wrapped, 'hspace', v >>> 0);
    }
    get loop() {
      return GET(this.@wrapped, 'loop');
    }
    set loop(v) {
      SET(this.@wrapped, 'loop', v >> 0);
    }
    get scrollAmount() {
      return GET(this.@wrapped, 'scrollAmount');
    }
    set scrollAmount(v) {
      SET(this.@wrapped, 'scrollAmount', v >>> 0);
    }
    get scrollDelay() {
      return GET(this.@wrapped, 'scrollDelay');
    }
    set scrollDelay(v) {
      SET(this.@wrapped, 'scrollDelay', v >>> 0);
    }
    get trueSpeed() {
      return GET(this.@wrapped, 'trueSpeed');
    }
    set trueSpeed(v) {
      SET(this.@wrapped, 'trueSpeed', !!v);
    }
    get vspace() {
      return GET(this.@wrapped, 'vspace');
    }
    set vspace(v) {
      SET(this.@wrapped, 'vspace', v >>> 0);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', '' + v);
    }
    get onbounce() {
      return WRAP(GET(this.@wrapped, 'onbounce'));
    }
    set onbounce(v) {
      SET(this.@wrapped, 'onbounce', CALLBACK(v));
    }
    get onfinish() {
      return WRAP(GET(this.@wrapped, 'onfinish'));
    }
    set onfinish(v) {
      SET(this.@wrapped, 'onfinish', CALLBACK(v));
    }
    get onstart() {
      return WRAP(GET(this.@wrapped, 'onstart'));
    }
    set onstart(v) {
      SET(this.@wrapped, 'onstart', CALLBACK(v));
    }
    start() {
      CALL(this.@wrapped, 'start');
    }
    stop() {
      CALL(this.@wrapped, 'stop');
    }
  }
  export class HTMLMediaElement extends HTMLElement {
    get src() {
      return GET(this.@wrapped, 'src');
    }
    set src(v) {
      SET(this.@wrapped, 'src', '' + v);
    }
    get crossOrigin() {
      return GET(this.@wrapped, 'crossOrigin');
    }
    set crossOrigin(v) {
      SET(this.@wrapped, 'crossOrigin', '' + v);
    }
    get preload() {
      return GET(this.@wrapped, 'preload');
    }
    set preload(v) {
      SET(this.@wrapped, 'preload', '' + v);
    }
    get currentTime() {
      return GET(this.@wrapped, 'currentTime');
    }
    set currentTime(v) {
      SET(this.@wrapped, 'currentTime', +v || 0);
    }
    get defaultPlaybackRate() {
      return GET(this.@wrapped, 'defaultPlaybackRate');
    }
    set defaultPlaybackRate(v) {
      SET(this.@wrapped, 'defaultPlaybackRate', +v || 0);
    }
    get playbackRate() {
      return GET(this.@wrapped, 'playbackRate');
    }
    set playbackRate(v) {
      SET(this.@wrapped, 'playbackRate', +v || 0);
    }
    get autoplay() {
      return GET(this.@wrapped, 'autoplay');
    }
    set autoplay(v) {
      SET(this.@wrapped, 'autoplay', !!v);
    }
    get loop() {
      return GET(this.@wrapped, 'loop');
    }
    set loop(v) {
      SET(this.@wrapped, 'loop', !!v);
    }
    get mediaGroup() {
      return GET(this.@wrapped, 'mediaGroup');
    }
    set mediaGroup(v) {
      SET(this.@wrapped, 'mediaGroup', '' + v);
    }
    get controller() {
      return WRAP(GET(this.@wrapped, 'controller'));
    }
    set controller(v) {
      SET(this.@wrapped, 'controller', UNWRAP(v));
    }
    get controls() {
      return GET(this.@wrapped, 'controls');
    }
    set controls(v) {
      SET(this.@wrapped, 'controls', !!v);
    }
    get volume() {
      return GET(this.@wrapped, 'volume');
    }
    set volume(v) {
      SET(this.@wrapped, 'volume', +v || 0);
    }
    get muted() {
      return GET(this.@wrapped, 'muted');
    }
    set muted(v) {
      SET(this.@wrapped, 'muted', !!v);
    }
    get defaultMuted() {
      return GET(this.@wrapped, 'defaultMuted');
    }
    set defaultMuted(v) {
      SET(this.@wrapped, 'defaultMuted', !!v);
    }
    get error() {
      return WRAP(GET(this.@wrapped, 'error'));
    }
    get currentSrc() {
      return GET(this.@wrapped, 'currentSrc');
    }
    get networkState() {
      return GET(this.@wrapped, 'networkState');
    }
    get buffered() {
      return WRAP(GET(this.@wrapped, 'buffered'));
    }
    get readyState() {
      return GET(this.@wrapped, 'readyState');
    }
    get seeking() {
      return GET(this.@wrapped, 'seeking');
    }
    get duration() {
      return GET(this.@wrapped, 'duration');
    }
    get startDate() {
      return WRAP(GET(this.@wrapped, 'startDate'));
    }
    get paused() {
      return GET(this.@wrapped, 'paused');
    }
    get played() {
      return WRAP(GET(this.@wrapped, 'played'));
    }
    get seekable() {
      return WRAP(GET(this.@wrapped, 'seekable'));
    }
    get ended() {
      return GET(this.@wrapped, 'ended');
    }
    get audioTracks() {
      return WRAP(GET(this.@wrapped, 'audioTracks'));
    }
    get videoTracks() {
      return WRAP(GET(this.@wrapped, 'videoTracks'));
    }
    get textTracks() {
      return WRAP(GET(this.@wrapped, 'textTracks'));
    }
    load() {
      CALL(this.@wrapped, 'load');
    }
    canPlayType(type) {
      return CALL(this.@wrapped, 'canPlayType', '' + type);
    }
    play() {
      CALL(this.@wrapped, 'play');
    }
    pause() {
      CALL(this.@wrapped, 'pause');
    }
    addTextTrack(kind, label, language) {
      return WRAP(CALL(this.@wrapped, 'addTextTrack', '' + kind, '' + label, '' + language));
    }
  }
  constants(HTMLMediaElement, {
    NETWORK_EMPTY: 0,
    NETWORK_IDLE: 1,
    NETWORK_LOADING: 2,
    NETWORK_NO_SOURCE: 3,
    HAVE_NOTHING: 0,
    HAVE_METADATA: 1,
    HAVE_CURRENT_DATA: 2,
    HAVE_FUTURE_DATA: 3,
    HAVE_ENOUGH_DATA: 4
  });
  export class HTMLMenuElement extends HTMLElement {
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get label() {
      return GET(this.@wrapped, 'label');
    }
    set label(v) {
      SET(this.@wrapped, 'label', '' + v);
    }
    get compact() {
      return GET(this.@wrapped, 'compact');
    }
    set compact(v) {
      SET(this.@wrapped, 'compact', !!v);
    }
  }
  export class HTMLMetaElement extends HTMLElement {
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get httpEquiv() {
      return GET(this.@wrapped, 'httpEquiv');
    }
    set httpEquiv(v) {
      SET(this.@wrapped, 'httpEquiv', '' + v);
    }
    get content() {
      return GET(this.@wrapped, 'content');
    }
    set content(v) {
      SET(this.@wrapped, 'content', '' + v);
    }
    get scheme() {
      return GET(this.@wrapped, 'scheme');
    }
    set scheme(v) {
      SET(this.@wrapped, 'scheme', '' + v);
    }
  }
  export class HTMLMeterElement extends HTMLElement {
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', +v || 0);
    }
    get min() {
      return GET(this.@wrapped, 'min');
    }
    set min(v) {
      SET(this.@wrapped, 'min', +v || 0);
    }
    get max() {
      return GET(this.@wrapped, 'max');
    }
    set max(v) {
      SET(this.@wrapped, 'max', +v || 0);
    }
    get low() {
      return GET(this.@wrapped, 'low');
    }
    set low(v) {
      SET(this.@wrapped, 'low', +v || 0);
    }
    get high() {
      return GET(this.@wrapped, 'high');
    }
    set high(v) {
      SET(this.@wrapped, 'high', +v || 0);
    }
    get optimum() {
      return GET(this.@wrapped, 'optimum');
    }
    set optimum(v) {
      SET(this.@wrapped, 'optimum', +v || 0);
    }
    get labels() {
      return WRAP(GET(this.@wrapped, 'labels'));
    }
  }
  export class HTMLModElement extends HTMLElement {
    get cite() {
      return GET(this.@wrapped, 'cite');
    }
    set cite(v) {
      SET(this.@wrapped, 'cite', '' + v);
    }
    get dateTime() {
      return GET(this.@wrapped, 'dateTime');
    }
    set dateTime(v) {
      SET(this.@wrapped, 'dateTime', '' + v);
    }
  }
  export class HTMLOListElement extends HTMLElement {
    get reversed() {
      return GET(this.@wrapped, 'reversed');
    }
    set reversed(v) {
      SET(this.@wrapped, 'reversed', !!v);
    }
    get start() {
      return GET(this.@wrapped, 'start');
    }
    set start(v) {
      SET(this.@wrapped, 'start', v >> 0);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get compact() {
      return GET(this.@wrapped, 'compact');
    }
    set compact(v) {
      SET(this.@wrapped, 'compact', !!v);
    }
  }
  export class HTMLObjectElement extends HTMLElement {
    get data() {
      return GET(this.@wrapped, 'data');
    }
    set data(v) {
      SET(this.@wrapped, 'data', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get typeMustMatch() {
      return GET(this.@wrapped, 'typeMustMatch');
    }
    set typeMustMatch(v) {
      SET(this.@wrapped, 'typeMustMatch', !!v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get useMap() {
      return GET(this.@wrapped, 'useMap');
    }
    set useMap(v) {
      SET(this.@wrapped, 'useMap', '' + v);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', '' + v);
    }
    get height() {
      return GET(this.@wrapped, 'height');
    }
    set height(v) {
      SET(this.@wrapped, 'height', '' + v);
    }
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get archive() {
      return GET(this.@wrapped, 'archive');
    }
    set archive(v) {
      SET(this.@wrapped, 'archive', '' + v);
    }
    get code() {
      return GET(this.@wrapped, 'code');
    }
    set code(v) {
      SET(this.@wrapped, 'code', '' + v);
    }
    get declare() {
      return GET(this.@wrapped, 'declare');
    }
    set declare(v) {
      SET(this.@wrapped, 'declare', !!v);
    }
    get hspace() {
      return GET(this.@wrapped, 'hspace');
    }
    set hspace(v) {
      SET(this.@wrapped, 'hspace', v >>> 0);
    }
    get standby() {
      return GET(this.@wrapped, 'standby');
    }
    set standby(v) {
      SET(this.@wrapped, 'standby', '' + v);
    }
    get vspace() {
      return GET(this.@wrapped, 'vspace');
    }
    set vspace(v) {
      SET(this.@wrapped, 'vspace', v >>> 0);
    }
    get codeBase() {
      return GET(this.@wrapped, 'codeBase');
    }
    set codeBase(v) {
      SET(this.@wrapped, 'codeBase', '' + v);
    }
    get codeType() {
      return GET(this.@wrapped, 'codeType');
    }
    set codeType(v) {
      SET(this.@wrapped, 'codeType', '' + v);
    }
    get border() {
      return GET(this.@wrapped, 'border');
    }
    set border(v) {
      SET(this.@wrapped, 'border', '' + v);
    }
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
    get contentDocument() {
      return WRAP(GET(this.@wrapped, 'contentDocument'));
    }
    get contentWindow() {
      return WRAP(GET(this.@wrapped, 'contentWindow'));
    }
    get willValidate() {
      return GET(this.@wrapped, 'willValidate');
    }
    get validity() {
      return WRAP(GET(this.@wrapped, 'validity'));
    }
    get validationMessage() {
      return GET(this.@wrapped, 'validationMessage');
    }
    checkValidity() {
      return CALL(this.@wrapped, 'checkValidity');
    }
    setCustomValidity(error) {
      CALL(this.@wrapped, 'setCustomValidity', '' + error);
    }
  }
  export class HTMLOptGroupElement extends HTMLElement {
    get disabled() {
      return GET(this.@wrapped, 'disabled');
    }
    set disabled(v) {
      SET(this.@wrapped, 'disabled', !!v);
    }
    get label() {
      return GET(this.@wrapped, 'label');
    }
    set label(v) {
      SET(this.@wrapped, 'label', '' + v);
    }
  }
  export var HTMLOptionElement = class Option extends HTMLElement {
      };
  export class HTMLOutputElement extends HTMLElement {
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get defaultValue() {
      return GET(this.@wrapped, 'defaultValue');
    }
    set defaultValue(v) {
      SET(this.@wrapped, 'defaultValue', '' + v);
    }
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', '' + v);
    }
    get htmlFor() {
      return WRAP(GET(this.@wrapped, 'htmlFor'));
    }
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    get willValidate() {
      return GET(this.@wrapped, 'willValidate');
    }
    get validity() {
      return WRAP(GET(this.@wrapped, 'validity'));
    }
    get validationMessage() {
      return GET(this.@wrapped, 'validationMessage');
    }
    get labels() {
      return WRAP(GET(this.@wrapped, 'labels'));
    }
    checkValidity() {
      return CALL(this.@wrapped, 'checkValidity');
    }
    setCustomValidity(error) {
      CALL(this.@wrapped, 'setCustomValidity', '' + error);
    }
  }
  export class HTMLParagraphElement extends HTMLElement {
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
  }
  export class HTMLParamElement extends HTMLElement {
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get valueType() {
      return GET(this.@wrapped, 'valueType');
    }
    set valueType(v) {
      SET(this.@wrapped, 'valueType', '' + v);
    }
  }
  export class HTMLPreElement extends HTMLElement {
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', v >> 0);
    }
  }
  export class HTMLProgressElement extends HTMLElement {
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', +v || 0);
    }
    get max() {
      return GET(this.@wrapped, 'max');
    }
    set max(v) {
      SET(this.@wrapped, 'max', +v || 0);
    }
    get position() {
      return GET(this.@wrapped, 'position');
    }
    get labels() {
      return WRAP(GET(this.@wrapped, 'labels'));
    }
  }
  export class HTMLQuoteElement extends HTMLElement {
    get cite() {
      return GET(this.@wrapped, 'cite');
    }
    set cite(v) {
      SET(this.@wrapped, 'cite', '' + v);
    }
  }
  export class HTMLScriptElement extends HTMLElement {
    get src() {
      return GET(this.@wrapped, 'src');
    }
    set src(v) {
      SET(this.@wrapped, 'src', '' + v);
    }
    get async() {
      return GET(this.@wrapped, 'async');
    }
    set async(v) {
      SET(this.@wrapped, 'async', !!v);
    }
    get defer() {
      return GET(this.@wrapped, 'defer');
    }
    set defer(v) {
      SET(this.@wrapped, 'defer', !!v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get charset() {
      return GET(this.@wrapped, 'charset');
    }
    set charset(v) {
      SET(this.@wrapped, 'charset', '' + v);
    }
    get text() {
      return GET(this.@wrapped, 'text');
    }
    set text(v) {
      SET(this.@wrapped, 'text', '' + v);
    }
    get event() {
      return GET(this.@wrapped, 'event');
    }
    set event(v) {
      SET(this.@wrapped, 'event', '' + v);
    }
    get htmlFor() {
      return GET(this.@wrapped, 'htmlFor');
    }
    set htmlFor(v) {
      SET(this.@wrapped, 'htmlFor', '' + v);
    }
  }
  export class HTMLSelectElement extends HTMLElement {
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    get options() {
      return WRAP(GET(this.@wrapped, 'options'));
    }
    get selectedOptions() {
      return WRAP(GET(this.@wrapped, 'selectedOptions'));
    }
    get willValidate() {
      return GET(this.@wrapped, 'willValidate');
    }
    get validity() {
      return WRAP(GET(this.@wrapped, 'validity'));
    }
    get validationMessage() {
      return GET(this.@wrapped, 'validationMessage');
    }
    get labels() {
      return WRAP(GET(this.@wrapped, 'labels'));
    }
    item(index) {
      return WRAP(CALL(this.@wrapped, 'item', index >>> 0));
    }
    namedItem(name) {
      return WRAP(CALL(this.@wrapped, 'namedItem', '' + name));
    }
    add(element, before) {
      CALL(this.@wrapped, 'add', UNWRAP(element), UNWRAP(before));
    }
    remove(index) {
      CALL(this.@wrapped, 'remove', index >> 0);
    }
    checkValidity() {
      return CALL(this.@wrapped, 'checkValidity');
    }
    setCustomValidity(error) {
      CALL(this.@wrapped, 'setCustomValidity', '' + error);
    }
  }
  export class HTMLSourceElement extends HTMLElement {
    get src() {
      return GET(this.@wrapped, 'src');
    }
    set src(v) {
      SET(this.@wrapped, 'src', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get media() {
      return GET(this.@wrapped, 'media');
    }
    set media(v) {
      SET(this.@wrapped, 'media', '' + v);
    }
  }
  export class HTMLSpanElement extends HTMLElement {
  }
  export class HTMLStyleElement extends HTMLElement {
    get disabled() {
      return GET(this.@wrapped, 'disabled');
    }
    set disabled(v) {
      SET(this.@wrapped, 'disabled', !!v);
    }
    get media() {
      return GET(this.@wrapped, 'media');
    }
    set media(v) {
      SET(this.@wrapped, 'media', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get scoped() {
      return GET(this.@wrapped, 'scoped');
    }
    set scoped(v) {
      SET(this.@wrapped, 'scoped', !!v);
    }
    get sheet() {
      return WRAP(GET(this.@wrapped, 'sheet'));
    }
  }
  export class HTMLTableCaptionElement extends HTMLElement {
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
  }
  export class HTMLTableCellElement extends HTMLElement {
    get colSpan() {
      return GET(this.@wrapped, 'colSpan');
    }
    set colSpan(v) {
      SET(this.@wrapped, 'colSpan', v >>> 0);
    }
    get rowSpan() {
      return GET(this.@wrapped, 'rowSpan');
    }
    set rowSpan(v) {
      SET(this.@wrapped, 'rowSpan', v >>> 0);
    }
    get abbr() {
      return GET(this.@wrapped, 'abbr');
    }
    set abbr(v) {
      SET(this.@wrapped, 'abbr', '' + v);
    }
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get axis() {
      return GET(this.@wrapped, 'axis');
    }
    set axis(v) {
      SET(this.@wrapped, 'axis', '' + v);
    }
    get height() {
      return GET(this.@wrapped, 'height');
    }
    set height(v) {
      SET(this.@wrapped, 'height', '' + v);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', '' + v);
    }
    get ch() {
      return GET(this.@wrapped, 'ch');
    }
    set ch(v) {
      SET(this.@wrapped, 'ch', '' + v);
    }
    get chOff() {
      return GET(this.@wrapped, 'chOff');
    }
    set chOff(v) {
      SET(this.@wrapped, 'chOff', '' + v);
    }
    get noWrap() {
      return GET(this.@wrapped, 'noWrap');
    }
    set noWrap(v) {
      SET(this.@wrapped, 'noWrap', !!v);
    }
    get vAlign() {
      return GET(this.@wrapped, 'vAlign');
    }
    set vAlign(v) {
      SET(this.@wrapped, 'vAlign', '' + v);
    }
    get bgColor() {
      return GET(this.@wrapped, 'bgColor');
    }
    set bgColor(v) {
      SET(this.@wrapped, 'bgColor', '' + v);
    }
    get headers() {
      return WRAP(GET(this.@wrapped, 'headers'));
    }
    get cellIndex() {
      return GET(this.@wrapped, 'cellIndex');
    }
  }
  export class HTMLTableColElement extends HTMLElement {
    get span() {
      return GET(this.@wrapped, 'span');
    }
    set span(v) {
      SET(this.@wrapped, 'span', v >>> 0);
    }
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get ch() {
      return GET(this.@wrapped, 'ch');
    }
    set ch(v) {
      SET(this.@wrapped, 'ch', '' + v);
    }
    get chOff() {
      return GET(this.@wrapped, 'chOff');
    }
    set chOff(v) {
      SET(this.@wrapped, 'chOff', '' + v);
    }
    get vAlign() {
      return GET(this.@wrapped, 'vAlign');
    }
    set vAlign(v) {
      SET(this.@wrapped, 'vAlign', '' + v);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', '' + v);
    }
  }
  export class HTMLTableDataCellElement extends HTMLTableCellElement {
  }
  export class HTMLTableElement extends HTMLElement {
    get caption() {
      return WRAP(GET(this.@wrapped, 'caption'));
    }
    set caption(v) {
      SET(this.@wrapped, 'caption', UNWRAP(v));
    }
    get tHead() {
      return WRAP(GET(this.@wrapped, 'tHead'));
    }
    set tHead(v) {
      SET(this.@wrapped, 'tHead', UNWRAP(v));
    }
    get tFoot() {
      return WRAP(GET(this.@wrapped, 'tFoot'));
    }
    set tFoot(v) {
      SET(this.@wrapped, 'tFoot', UNWRAP(v));
    }
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get border() {
      return GET(this.@wrapped, 'border');
    }
    set border(v) {
      SET(this.@wrapped, 'border', '' + v);
    }
    get frame() {
      return GET(this.@wrapped, 'frame');
    }
    set frame(v) {
      SET(this.@wrapped, 'frame', '' + v);
    }
    get rules() {
      return GET(this.@wrapped, 'rules');
    }
    set rules(v) {
      SET(this.@wrapped, 'rules', '' + v);
    }
    get summary() {
      return GET(this.@wrapped, 'summary');
    }
    set summary(v) {
      SET(this.@wrapped, 'summary', '' + v);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', '' + v);
    }
    get bgColor() {
      return GET(this.@wrapped, 'bgColor');
    }
    set bgColor(v) {
      SET(this.@wrapped, 'bgColor', '' + v);
    }
    get cellPadding() {
      return GET(this.@wrapped, 'cellPadding');
    }
    set cellPadding(v) {
      SET(this.@wrapped, 'cellPadding', '' + v);
    }
    get cellSpacing() {
      return GET(this.@wrapped, 'cellSpacing');
    }
    set cellSpacing(v) {
      SET(this.@wrapped, 'cellSpacing', '' + v);
    }
    get tBodies() {
      return WRAP(GET(this.@wrapped, 'tBodies'));
    }
    get rows() {
      return WRAP(GET(this.@wrapped, 'rows'));
    }
    createCaption() {
      return WRAP(CALL(this.@wrapped, 'createCaption'));
    }
    deleteCaption() {
      CALL(this.@wrapped, 'deleteCaption');
    }
    createTHead() {
      return WRAP(CALL(this.@wrapped, 'createTHead'));
    }
    deleteTHead() {
      CALL(this.@wrapped, 'deleteTHead');
    }
    createTFoot() {
      return WRAP(CALL(this.@wrapped, 'createTFoot'));
    }
    deleteTFoot() {
      CALL(this.@wrapped, 'deleteTFoot');
    }
    createTBody() {
      return WRAP(CALL(this.@wrapped, 'createTBody'));
    }
    insertRow(index) {
      return WRAP(CALL(this.@wrapped, 'insertRow', index >> 0));
    }
    deleteRow(index) {
      CALL(this.@wrapped, 'deleteRow', index >> 0);
    }
  }
  export class HTMLTableHeaderCellElement extends HTMLTableCellElement {
    get scope() {
      return GET(this.@wrapped, 'scope');
    }
    set scope(v) {
      SET(this.@wrapped, 'scope', '' + v);
    }
  }
  export class HTMLTableRowElement extends HTMLElement {
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get ch() {
      return GET(this.@wrapped, 'ch');
    }
    set ch(v) {
      SET(this.@wrapped, 'ch', '' + v);
    }
    get chOff() {
      return GET(this.@wrapped, 'chOff');
    }
    set chOff(v) {
      SET(this.@wrapped, 'chOff', '' + v);
    }
    get vAlign() {
      return GET(this.@wrapped, 'vAlign');
    }
    set vAlign(v) {
      SET(this.@wrapped, 'vAlign', '' + v);
    }
    get bgColor() {
      return GET(this.@wrapped, 'bgColor');
    }
    set bgColor(v) {
      SET(this.@wrapped, 'bgColor', '' + v);
    }
    get rowIndex() {
      return GET(this.@wrapped, 'rowIndex');
    }
    get sectionRowIndex() {
      return GET(this.@wrapped, 'sectionRowIndex');
    }
    get cells() {
      return WRAP(GET(this.@wrapped, 'cells'));
    }
    insertCell(index) {
      return WRAP(CALL(this.@wrapped, 'insertCell', index >> 0));
    }
    deleteCell(index) {
      CALL(this.@wrapped, 'deleteCell', index >> 0);
    }
  }
  export class HTMLTableSectionElement extends HTMLElement {
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get ch() {
      return GET(this.@wrapped, 'ch');
    }
    set ch(v) {
      SET(this.@wrapped, 'ch', '' + v);
    }
    get chOff() {
      return GET(this.@wrapped, 'chOff');
    }
    set chOff(v) {
      SET(this.@wrapped, 'chOff', '' + v);
    }
    get vAlign() {
      return GET(this.@wrapped, 'vAlign');
    }
    set vAlign(v) {
      SET(this.@wrapped, 'vAlign', '' + v);
    }
    get rows() {
      return WRAP(GET(this.@wrapped, 'rows'));
    }
    insertRow(index) {
      return WRAP(CALL(this.@wrapped, 'insertRow', index >> 0));
    }
    deleteRow(index) {
      CALL(this.@wrapped, 'deleteRow', index >> 0);
    }
  }
  export class HTMLTextAreaElement extends HTMLElement {
    get autocomplete() {
      return GET(this.@wrapped, 'autocomplete');
    }
    set autocomplete(v) {
      SET(this.@wrapped, 'autocomplete', '' + v);
    }
    get autofocus() {
      return GET(this.@wrapped, 'autofocus');
    }
    set autofocus(v) {
      SET(this.@wrapped, 'autofocus', !!v);
    }
    get cols() {
      return GET(this.@wrapped, 'cols');
    }
    set cols(v) {
      SET(this.@wrapped, 'cols', v >>> 0);
    }
    get dirName() {
      return GET(this.@wrapped, 'dirName');
    }
    set dirName(v) {
      SET(this.@wrapped, 'dirName', '' + v);
    }
    get disabled() {
      return GET(this.@wrapped, 'disabled');
    }
    set disabled(v) {
      SET(this.@wrapped, 'disabled', !!v);
    }
    get inputMode() {
      return GET(this.@wrapped, 'inputMode');
    }
    set inputMode(v) {
      SET(this.@wrapped, 'inputMode', '' + v);
    }
    get maxLength() {
      return GET(this.@wrapped, 'maxLength');
    }
    set maxLength(v) {
      SET(this.@wrapped, 'maxLength', v >> 0);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get placeholder() {
      return GET(this.@wrapped, 'placeholder');
    }
    set placeholder(v) {
      SET(this.@wrapped, 'placeholder', '' + v);
    }
    get readOnly() {
      return GET(this.@wrapped, 'readOnly');
    }
    set readOnly(v) {
      SET(this.@wrapped, 'readOnly', !!v);
    }
    get required() {
      return GET(this.@wrapped, 'required');
    }
    set required(v) {
      SET(this.@wrapped, 'required', !!v);
    }
    get rows() {
      return GET(this.@wrapped, 'rows');
    }
    set rows(v) {
      SET(this.@wrapped, 'rows', v >>> 0);
    }
    get wrap() {
      return GET(this.@wrapped, 'wrap');
    }
    set wrap(v) {
      SET(this.@wrapped, 'wrap', '' + v);
    }
    get defaultValue() {
      return GET(this.@wrapped, 'defaultValue');
    }
    set defaultValue(v) {
      SET(this.@wrapped, 'defaultValue', '' + v);
    }
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', '' + v);
    }
    get selectionStart() {
      return GET(this.@wrapped, 'selectionStart');
    }
    set selectionStart(v) {
      SET(this.@wrapped, 'selectionStart', v >>> 0);
    }
    get selectionEnd() {
      return GET(this.@wrapped, 'selectionEnd');
    }
    set selectionEnd(v) {
      SET(this.@wrapped, 'selectionEnd', v >>> 0);
    }
    get selectionDirection() {
      return GET(this.@wrapped, 'selectionDirection');
    }
    set selectionDirection(v) {
      SET(this.@wrapped, 'selectionDirection', '' + v);
    }
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    get textLength() {
      return GET(this.@wrapped, 'textLength');
    }
    get willValidate() {
      return GET(this.@wrapped, 'willValidate');
    }
    get validity() {
      return WRAP(GET(this.@wrapped, 'validity'));
    }
    get validationMessage() {
      return GET(this.@wrapped, 'validationMessage');
    }
    get labels() {
      return WRAP(GET(this.@wrapped, 'labels'));
    }
    checkValidity() {
      return CALL(this.@wrapped, 'checkValidity');
    }
    setCustomValidity(error) {
      CALL(this.@wrapped, 'setCustomValidity', '' + error);
    }
    select() {
      CALL(this.@wrapped, 'select');
    }
    setRangeText(replacement, start, end, selectionMode) {
      CALL(this.@wrapped, 'setRangeText', '' + replacement, start >>> 0, end >>> 0, UNWRAP(selectionMode));
    }
    setSelectionRange(start, end, direction) {
      CALL(this.@wrapped, 'setSelectionRange', start >>> 0, end >>> 0, '' + direction);
    }
  }
  export class HTMLTimeElement extends HTMLElement {
    get datetime() {
      return GET(this.@wrapped, 'datetime');
    }
    set datetime(v) {
      SET(this.@wrapped, 'datetime', '' + v);
    }
  }
  export class HTMLTitleElement extends HTMLElement {
    get text() {
      return GET(this.@wrapped, 'text');
    }
    set text(v) {
      SET(this.@wrapped, 'text', '' + v);
    }
  }
  export class HTMLTrackElement extends HTMLElement {
    get kind() {
      return GET(this.@wrapped, 'kind');
    }
    set kind(v) {
      SET(this.@wrapped, 'kind', '' + v);
    }
    get src() {
      return GET(this.@wrapped, 'src');
    }
    set src(v) {
      SET(this.@wrapped, 'src', '' + v);
    }
    get srclang() {
      return GET(this.@wrapped, 'srclang');
    }
    set srclang(v) {
      SET(this.@wrapped, 'srclang', '' + v);
    }
    get label() {
      return GET(this.@wrapped, 'label');
    }
    set label(v) {
      SET(this.@wrapped, 'label', '' + v);
    }
    get default() {
      return GET(this.@wrapped, 'default');
    }
    set default(v) {
      SET(this.@wrapped, 'default', !!v);
    }
    get readyState() {
      return GET(this.@wrapped, 'readyState');
    }
    get track() {
      return WRAP(GET(this.@wrapped, 'track'));
    }
  }
  constants(HTMLTrackElement, { NONE: 0, LOADING: 1, LOADED: 2, ERROR: 3 });
  export class HTMLUListElement extends HTMLElement {
    get compact() {
      return GET(this.@wrapped, 'compact');
    }
    set compact(v) {
      SET(this.@wrapped, 'compact', !!v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
  }
  export class HTMLUnknownElement extends HTMLElement {
  }
  export class HTMLVideoElement extends HTMLMediaElement {
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', v >>> 0);
    }
    get height() {
      return GET(this.@wrapped, 'height');
    }
    set height(v) {
      SET(this.@wrapped, 'height', v >>> 0);
    }
    get poster() {
      return GET(this.@wrapped, 'poster');
    }
    set poster(v) {
      SET(this.@wrapped, 'poster', '' + v);
    }
    get videoWidth() {
      return GET(this.@wrapped, 'videoWidth');
    }
    get videoHeight() {
      return GET(this.@wrapped, 'videoHeight');
    }
  }
  export class ShadowRoot extends DocumentFragment {
    constructor(host) {
      this.@wrapped = CONSTRUCT(ShadowRoot, UNWRAP(host));
    }
    get applyAuthorStyles() {
      return WRAP(GET(this.@wrapped, 'applyAuthorStyles'));
    }
    set applyAuthorStyles(v) {
      SET(this.@wrapped, 'applyAuthorStyles', UNWRAP(v));
    }
    get resetStyleInheritance() {
      return WRAP(GET(this.@wrapped, 'resetStyleInheritance'));
    }
    set resetStyleInheritance(v) {
      SET(this.@wrapped, 'resetStyleInheritance', UNWRAP(v));
    }
    get innerHTML() {
      return GET(this.@wrapped, 'innerHTML');
    }
    set innerHTML(v) {
      SET(this.@wrapped, 'innerHTML', '' + v);
    }
    get activeElement() {
      return WRAP(GET(this.@wrapped, 'activeElement'));
    }
    get styleSheets() {
      return WRAP(GET(this.@wrapped, 'styleSheets'));
    }
    getElementById(elementId) {
      return WRAP(CALL(this.@wrapped, 'getElementById', '' + elementId));
    }
    getElementsByClassName(tagName) {
      return WRAP(CALL(this.@wrapped, 'getElementsByClassName', '' + tagName));
    }
    getElementsByTagName(className) {
      return WRAP(CALL(this.@wrapped, 'getElementsByTagName', '' + className));
    }
    getElementsByTagNameNS(namespace, localName) {
      return WRAP(CALL(this.@wrapped, 'getElementsByTagNameNS', '' + namespace, '' + localName));
    }
    getSelection() {
      return WRAP(CALL(this.@wrapped, 'getSelection'));
    }
    addStyleSheet(element) {
      return WRAP(CALL(this.@wrapped, 'addStyleSheet', UNWRAP(element)));
    }
    removeStyleSheet(styleSheet) {
      return WRAP(CALL(this.@wrapped, 'removeStyleSheet', UNWRAP(styleSheet)));
    }
  }
  export class SharedWorkerGlobalScope extends WorkerGlobalScope {
    get onconnect() {
      return WRAP(GET(this.@wrapped, 'onconnect'));
    }
    set onconnect(v) {
      SET(this.@wrapped, 'onconnect', CALLBACK(v));
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    get applicationCache() {
      return WRAP(GET(this.@wrapped, 'applicationCache'));
    }
  }
  export class XMLHttpRequest extends XMLHttpRequestEventTarget {
    constructor() {
      this.@wrapped = CONSTRUCT(XMLHttpRequest);
    }
    get onreadystatechange() {
      return WRAP(GET(this.@wrapped, 'onreadystatechange'));
    }
    set onreadystatechange(v) {
      SET(this.@wrapped, 'onreadystatechange', CALLBACK(v));
    }
    get timeout() {
      return GET(this.@wrapped, 'timeout');
    }
    set timeout(v) {
      SET(this.@wrapped, 'timeout', v >>> 0);
    }
    get withCredentials() {
      return GET(this.@wrapped, 'withCredentials');
    }
    set withCredentials(v) {
      SET(this.@wrapped, 'withCredentials', !!v);
    }
    get responseType() {
      return WRAP(GET(this.@wrapped, 'responseType'));
    }
    set responseType(v) {
      SET(this.@wrapped, 'responseType', UNWRAP(v));
    }
    get readyState() {
      return GET(this.@wrapped, 'readyState');
    }
    get upload() {
      return WRAP(GET(this.@wrapped, 'upload'));
    }
    get status() {
      return GET(this.@wrapped, 'status');
    }
    get statusText() {
      return WRAP(GET(this.@wrapped, 'statusText'));
    }
    get response() {
      return WRAP(GET(this.@wrapped, 'response'));
    }
    get responseText() {
      return GET(this.@wrapped, 'responseText');
    }
    get responseXML() {
      return WRAP(GET(this.@wrapped, 'responseXML'));
    }
    open(method, url, async, user, password) {
      CALL(this.@wrapped, 'open', UNWRAP(method), '' + url, !!async, '' + user, '' + password);
    }
    setRequestHeader(header, value) {
      CALL(this.@wrapped, 'setRequestHeader', UNWRAP(header), UNWRAP(value));
    }
    send(data) {
      CALL(this.@wrapped, 'send', UNWRAP(data));
    }
    abort() {
      CALL(this.@wrapped, 'abort');
    }
    getResponseHeader(header) {
      return WRAP(CALL(this.@wrapped, 'getResponseHeader', UNWRAP(header)));
    }
    getAllResponseHeaders() {
      return WRAP(CALL(this.@wrapped, 'getAllResponseHeaders'));
    }
    overrideMimeType(mime) {
      CALL(this.@wrapped, 'overrideMimeType', '' + mime);
    }
  }
  constants(XMLHttpRequest, { UNSENT: 0, OPENED: 1, HEADERS_RECEIVED: 2, LOADING: 3, DONE: 4 });
  export class AnonXMLHttpRequest extends XMLHttpRequest {
    constructor() {
      this.@wrapped = CONSTRUCT(AnonXMLHttpRequest);
    }
  }
  export class HTMLAnchorElement extends HTMLElement {
    get href() {
      return GET(this.@wrapped, 'href');
    }
    set href(v) {
      SET(this.@wrapped, 'href', '' + v);
    }
    get target() {
      return GET(this.@wrapped, 'target');
    }
    set target(v) {
      SET(this.@wrapped, 'target', '' + v);
    }
    get download() {
      return GET(this.@wrapped, 'download');
    }
    set download(v) {
      SET(this.@wrapped, 'download', '' + v);
    }
    get ping() {
      return GET(this.@wrapped, 'ping');
    }
    set ping(v) {
      SET(this.@wrapped, 'ping', '' + v);
    }
    get rel() {
      return GET(this.@wrapped, 'rel');
    }
    set rel(v) {
      SET(this.@wrapped, 'rel', '' + v);
    }
    get media() {
      return GET(this.@wrapped, 'media');
    }
    set media(v) {
      SET(this.@wrapped, 'media', '' + v);
    }
    get hreflang() {
      return GET(this.@wrapped, 'hreflang');
    }
    set hreflang(v) {
      SET(this.@wrapped, 'hreflang', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get text() {
      return GET(this.@wrapped, 'text');
    }
    set text(v) {
      SET(this.@wrapped, 'text', '' + v);
    }
    get protocol() {
      return GET(this.@wrapped, 'protocol');
    }
    set protocol(v) {
      SET(this.@wrapped, 'protocol', '' + v);
    }
    get host() {
      return GET(this.@wrapped, 'host');
    }
    set host(v) {
      SET(this.@wrapped, 'host', '' + v);
    }
    get hostname() {
      return GET(this.@wrapped, 'hostname');
    }
    set hostname(v) {
      SET(this.@wrapped, 'hostname', '' + v);
    }
    get port() {
      return GET(this.@wrapped, 'port');
    }
    set port(v) {
      SET(this.@wrapped, 'port', '' + v);
    }
    get pathname() {
      return GET(this.@wrapped, 'pathname');
    }
    set pathname(v) {
      SET(this.@wrapped, 'pathname', '' + v);
    }
    get search() {
      return GET(this.@wrapped, 'search');
    }
    set search(v) {
      SET(this.@wrapped, 'search', '' + v);
    }
    get hash() {
      return GET(this.@wrapped, 'hash');
    }
    set hash(v) {
      SET(this.@wrapped, 'hash', '' + v);
    }
    get coords() {
      return GET(this.@wrapped, 'coords');
    }
    set coords(v) {
      SET(this.@wrapped, 'coords', '' + v);
    }
    get charset() {
      return GET(this.@wrapped, 'charset');
    }
    set charset(v) {
      SET(this.@wrapped, 'charset', '' + v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get rev() {
      return GET(this.@wrapped, 'rev');
    }
    set rev(v) {
      SET(this.@wrapped, 'rev', '' + v);
    }
    get shape() {
      return GET(this.@wrapped, 'shape');
    }
    set shape(v) {
      SET(this.@wrapped, 'shape', '' + v);
    }
    get relList() {
      return WRAP(GET(this.@wrapped, 'relList'));
    }
  }
  export class HTMLAppletElement extends HTMLElement {
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
    get alt() {
      return GET(this.@wrapped, 'alt');
    }
    set alt(v) {
      SET(this.@wrapped, 'alt', '' + v);
    }
    get archive() {
      return GET(this.@wrapped, 'archive');
    }
    set archive(v) {
      SET(this.@wrapped, 'archive', '' + v);
    }
    get code() {
      return GET(this.@wrapped, 'code');
    }
    set code(v) {
      SET(this.@wrapped, 'code', '' + v);
    }
    get codeBase() {
      return GET(this.@wrapped, 'codeBase');
    }
    set codeBase(v) {
      SET(this.@wrapped, 'codeBase', '' + v);
    }
    get height() {
      return GET(this.@wrapped, 'height');
    }
    set height(v) {
      SET(this.@wrapped, 'height', '' + v);
    }
    get hspace() {
      return GET(this.@wrapped, 'hspace');
    }
    set hspace(v) {
      SET(this.@wrapped, 'hspace', v >>> 0);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get _object() {
      return GET(this.@wrapped, '_object');
    }
    set _object(v) {
      SET(this.@wrapped, '_object', '' + v);
    }
    get vspace() {
      return GET(this.@wrapped, 'vspace');
    }
    set vspace(v) {
      SET(this.@wrapped, 'vspace', v >>> 0);
    }
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', '' + v);
    }
  }
  export class HTMLAreaElement extends HTMLElement {
    get alt() {
      return GET(this.@wrapped, 'alt');
    }
    set alt(v) {
      SET(this.@wrapped, 'alt', '' + v);
    }
    get coords() {
      return GET(this.@wrapped, 'coords');
    }
    set coords(v) {
      SET(this.@wrapped, 'coords', '' + v);
    }
    get shape() {
      return GET(this.@wrapped, 'shape');
    }
    set shape(v) {
      SET(this.@wrapped, 'shape', '' + v);
    }
    get href() {
      return GET(this.@wrapped, 'href');
    }
    set href(v) {
      SET(this.@wrapped, 'href', '' + v);
    }
    get target() {
      return GET(this.@wrapped, 'target');
    }
    set target(v) {
      SET(this.@wrapped, 'target', '' + v);
    }
    get download() {
      return GET(this.@wrapped, 'download');
    }
    set download(v) {
      SET(this.@wrapped, 'download', '' + v);
    }
    get ping() {
      return GET(this.@wrapped, 'ping');
    }
    set ping(v) {
      SET(this.@wrapped, 'ping', '' + v);
    }
    get rel() {
      return GET(this.@wrapped, 'rel');
    }
    set rel(v) {
      SET(this.@wrapped, 'rel', '' + v);
    }
    get media() {
      return GET(this.@wrapped, 'media');
    }
    set media(v) {
      SET(this.@wrapped, 'media', '' + v);
    }
    get hreflang() {
      return GET(this.@wrapped, 'hreflang');
    }
    set hreflang(v) {
      SET(this.@wrapped, 'hreflang', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get protocol() {
      return GET(this.@wrapped, 'protocol');
    }
    set protocol(v) {
      SET(this.@wrapped, 'protocol', '' + v);
    }
    get host() {
      return GET(this.@wrapped, 'host');
    }
    set host(v) {
      SET(this.@wrapped, 'host', '' + v);
    }
    get hostname() {
      return GET(this.@wrapped, 'hostname');
    }
    set hostname(v) {
      SET(this.@wrapped, 'hostname', '' + v);
    }
    get port() {
      return GET(this.@wrapped, 'port');
    }
    set port(v) {
      SET(this.@wrapped, 'port', '' + v);
    }
    get pathname() {
      return GET(this.@wrapped, 'pathname');
    }
    set pathname(v) {
      SET(this.@wrapped, 'pathname', '' + v);
    }
    get search() {
      return GET(this.@wrapped, 'search');
    }
    set search(v) {
      SET(this.@wrapped, 'search', '' + v);
    }
    get hash() {
      return GET(this.@wrapped, 'hash');
    }
    set hash(v) {
      SET(this.@wrapped, 'hash', '' + v);
    }
    get noHref() {
      return GET(this.@wrapped, 'noHref');
    }
    set noHref(v) {
      SET(this.@wrapped, 'noHref', !!v);
    }
    get relList() {
      return WRAP(GET(this.@wrapped, 'relList'));
    }
  }
  export var HTMLAudioElement = class Audio extends HTMLMediaElement {
      };
  export class HTMLBRElement extends HTMLElement {
    get clear() {
      return GET(this.@wrapped, 'clear');
    }
    set clear(v) {
      SET(this.@wrapped, 'clear', '' + v);
    }
  }
  export class HTMLBaseElement extends HTMLElement {
    get href() {
      return GET(this.@wrapped, 'href');
    }
    set href(v) {
      SET(this.@wrapped, 'href', '' + v);
    }
    get target() {
      return GET(this.@wrapped, 'target');
    }
    set target(v) {
      SET(this.@wrapped, 'target', '' + v);
    }
  }
  export class HTMLBaseFontElement extends HTMLElement {
    get color() {
      return GET(this.@wrapped, 'color');
    }
    set color(v) {
      SET(this.@wrapped, 'color', '' + v);
    }
    get face() {
      return GET(this.@wrapped, 'face');
    }
    set face(v) {
      SET(this.@wrapped, 'face', '' + v);
    }
    get size() {
      return GET(this.@wrapped, 'size');
    }
    set size(v) {
      SET(this.@wrapped, 'size', v >> 0);
    }
  }
  export class HTMLBodyElement extends HTMLElement {
    get onafterprint() {
      return WRAP(GET(this.@wrapped, 'onafterprint'));
    }
    set onafterprint(v) {
      SET(this.@wrapped, 'onafterprint', CALLBACK_OR_NULL(v));
    }
    get onbeforeprint() {
      return WRAP(GET(this.@wrapped, 'onbeforeprint'));
    }
    set onbeforeprint(v) {
      SET(this.@wrapped, 'onbeforeprint', CALLBACK_OR_NULL(v));
    }
    get onbeforeunload() {
      return WRAP(GET(this.@wrapped, 'onbeforeunload'));
    }
    set onbeforeunload(v) {
      SET(this.@wrapped, 'onbeforeunload', CALLBACK_OR_NULL(v));
    }
    get onblur() {
      return WRAP(GET(this.@wrapped, 'onblur'));
    }
    set onblur(v) {
      SET(this.@wrapped, 'onblur', CALLBACK_OR_NULL(v));
    }
    get onerror() {
      return WRAP(GET(this.@wrapped, 'onerror'));
    }
    set onerror(v) {
      SET(this.@wrapped, 'onerror', UNWRAP(v));
    }
    get onfocus() {
      return WRAP(GET(this.@wrapped, 'onfocus'));
    }
    set onfocus(v) {
      SET(this.@wrapped, 'onfocus', CALLBACK_OR_NULL(v));
    }
    get onhashchange() {
      return WRAP(GET(this.@wrapped, 'onhashchange'));
    }
    set onhashchange(v) {
      SET(this.@wrapped, 'onhashchange', CALLBACK_OR_NULL(v));
    }
    get onload() {
      return WRAP(GET(this.@wrapped, 'onload'));
    }
    set onload(v) {
      SET(this.@wrapped, 'onload', CALLBACK_OR_NULL(v));
    }
    get onmessage() {
      return WRAP(GET(this.@wrapped, 'onmessage'));
    }
    set onmessage(v) {
      SET(this.@wrapped, 'onmessage', CALLBACK_OR_NULL(v));
    }
    get onoffline() {
      return WRAP(GET(this.@wrapped, 'onoffline'));
    }
    set onoffline(v) {
      SET(this.@wrapped, 'onoffline', CALLBACK_OR_NULL(v));
    }
    get ononline() {
      return WRAP(GET(this.@wrapped, 'ononline'));
    }
    set ononline(v) {
      SET(this.@wrapped, 'ononline', CALLBACK_OR_NULL(v));
    }
    get onpopstate() {
      return WRAP(GET(this.@wrapped, 'onpopstate'));
    }
    set onpopstate(v) {
      SET(this.@wrapped, 'onpopstate', CALLBACK_OR_NULL(v));
    }
    get onpagehide() {
      return WRAP(GET(this.@wrapped, 'onpagehide'));
    }
    set onpagehide(v) {
      SET(this.@wrapped, 'onpagehide', CALLBACK_OR_NULL(v));
    }
    get onpageshow() {
      return WRAP(GET(this.@wrapped, 'onpageshow'));
    }
    set onpageshow(v) {
      SET(this.@wrapped, 'onpageshow', CALLBACK_OR_NULL(v));
    }
    get onresize() {
      return WRAP(GET(this.@wrapped, 'onresize'));
    }
    set onresize(v) {
      SET(this.@wrapped, 'onresize', CALLBACK_OR_NULL(v));
    }
    get onscroll() {
      return WRAP(GET(this.@wrapped, 'onscroll'));
    }
    set onscroll(v) {
      SET(this.@wrapped, 'onscroll', CALLBACK_OR_NULL(v));
    }
    get onstorage() {
      return WRAP(GET(this.@wrapped, 'onstorage'));
    }
    set onstorage(v) {
      SET(this.@wrapped, 'onstorage', CALLBACK_OR_NULL(v));
    }
    get onunload() {
      return WRAP(GET(this.@wrapped, 'onunload'));
    }
    set onunload(v) {
      SET(this.@wrapped, 'onunload', CALLBACK_OR_NULL(v));
    }
    get text() {
      return GET(this.@wrapped, 'text');
    }
    set text(v) {
      SET(this.@wrapped, 'text', '' + v);
    }
    get link() {
      return GET(this.@wrapped, 'link');
    }
    set link(v) {
      SET(this.@wrapped, 'link', '' + v);
    }
    get vLink() {
      return GET(this.@wrapped, 'vLink');
    }
    set vLink(v) {
      SET(this.@wrapped, 'vLink', '' + v);
    }
    get aLink() {
      return GET(this.@wrapped, 'aLink');
    }
    set aLink(v) {
      SET(this.@wrapped, 'aLink', '' + v);
    }
    get bgColor() {
      return GET(this.@wrapped, 'bgColor');
    }
    set bgColor(v) {
      SET(this.@wrapped, 'bgColor', '' + v);
    }
    get background() {
      return GET(this.@wrapped, 'background');
    }
    set background(v) {
      SET(this.@wrapped, 'background', '' + v);
    }
  }
  export class HTMLButtonElement extends HTMLElement {
    get autofocus() {
      return GET(this.@wrapped, 'autofocus');
    }
    set autofocus(v) {
      SET(this.@wrapped, 'autofocus', !!v);
    }
    get disabled() {
      return GET(this.@wrapped, 'disabled');
    }
    set disabled(v) {
      SET(this.@wrapped, 'disabled', !!v);
    }
    get formAction() {
      return GET(this.@wrapped, 'formAction');
    }
    set formAction(v) {
      SET(this.@wrapped, 'formAction', '' + v);
    }
    get formEnctype() {
      return GET(this.@wrapped, 'formEnctype');
    }
    set formEnctype(v) {
      SET(this.@wrapped, 'formEnctype', '' + v);
    }
    get formMethod() {
      return GET(this.@wrapped, 'formMethod');
    }
    set formMethod(v) {
      SET(this.@wrapped, 'formMethod', '' + v);
    }
    get formNoValidate() {
      return GET(this.@wrapped, 'formNoValidate');
    }
    set formNoValidate(v) {
      SET(this.@wrapped, 'formNoValidate', !!v);
    }
    get formTarget() {
      return GET(this.@wrapped, 'formTarget');
    }
    set formTarget(v) {
      SET(this.@wrapped, 'formTarget', '' + v);
    }
    get name() {
      return GET(this.@wrapped, 'name');
    }
    set name(v) {
      SET(this.@wrapped, 'name', '' + v);
    }
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', '' + v);
    }
    get form() {
      return WRAP(GET(this.@wrapped, 'form'));
    }
    get willValidate() {
      return GET(this.@wrapped, 'willValidate');
    }
    get validity() {
      return WRAP(GET(this.@wrapped, 'validity'));
    }
    get validationMessage() {
      return GET(this.@wrapped, 'validationMessage');
    }
    get labels() {
      return WRAP(GET(this.@wrapped, 'labels'));
    }
    checkValidity() {
      return CALL(this.@wrapped, 'checkValidity');
    }
    setCustomValidity(error) {
      CALL(this.@wrapped, 'setCustomValidity', '' + error);
    }
  }
  export class HTMLCanvasElement extends HTMLElement {
    get width() {
      return GET(this.@wrapped, 'width');
    }
    set width(v) {
      SET(this.@wrapped, 'width', v >>> 0);
    }
    get height() {
      return GET(this.@wrapped, 'height');
    }
    set height(v) {
      SET(this.@wrapped, 'height', v >>> 0);
    }
    toDataURL(type, args) {
      return CALL(this.@wrapped, 'toDataURL', '' + type, UNWRAP(args));
    }
    toDataURLHD(type, args) {
      return CALL(this.@wrapped, 'toDataURLHD', '' + type, UNWRAP(args));
    }
    toBlob(_callback, type, args) {
      CALL(this.@wrapped, 'toBlob', CALLBACK(_callback), '' + type, UNWRAP(args));
    }
    toBlobHD(_callback, type, args) {
      CALL(this.@wrapped, 'toBlobHD', CALLBACK(_callback), '' + type, UNWRAP(args));
    }
    getContext(contextId, args) {
      return WRAP(CALL(this.@wrapped, 'getContext', '' + contextId, UNWRAP(args)));
    }
  }
  export class HTMLCommandElement extends HTMLElement {
    get type() {
      return GET(this.@wrapped, 'type');
    }
    set type(v) {
      SET(this.@wrapped, 'type', '' + v);
    }
    get label() {
      return GET(this.@wrapped, 'label');
    }
    set label(v) {
      SET(this.@wrapped, 'label', '' + v);
    }
    get icon() {
      return GET(this.@wrapped, 'icon');
    }
    set icon(v) {
      SET(this.@wrapped, 'icon', '' + v);
    }
    get disabled() {
      return GET(this.@wrapped, 'disabled');
    }
    set disabled(v) {
      SET(this.@wrapped, 'disabled', !!v);
    }
    get checked() {
      return GET(this.@wrapped, 'checked');
    }
    set checked(v) {
      SET(this.@wrapped, 'checked', !!v);
    }
    get radiogroup() {
      return GET(this.@wrapped, 'radiogroup');
    }
    set radiogroup(v) {
      SET(this.@wrapped, 'radiogroup', '' + v);
    }
    get command() {
      return WRAP(GET(this.@wrapped, 'command'));
    }
  }
  export class HTMLContentElement extends HTMLElement {
    get select() {
      return GET(this.@wrapped, 'select');
    }
    set select(v) {
      SET(this.@wrapped, 'select', '' + v);
    }
    get resetStyleInheritance() {
      return GET(this.@wrapped, 'resetStyleInheritance');
    }
    set resetStyleInheritance(v) {
      SET(this.@wrapped, 'resetStyleInheritance', !!v);
    }
  }
  export class HTMLDListElement extends HTMLElement {
    get compact() {
      return GET(this.@wrapped, 'compact');
    }
    set compact(v) {
      SET(this.@wrapped, 'compact', !!v);
    }
  }
  export class HTMLDataElement extends HTMLElement {
    get value() {
      return GET(this.@wrapped, 'value');
    }
    set value(v) {
      SET(this.@wrapped, 'value', '' + v);
    }
  }
  export class HTMLDataListElement extends HTMLElement {
    get options() {
      return WRAP(GET(this.@wrapped, 'options'));
    }
  }
  export class HTMLDetailsElement extends HTMLElement {
    get open() {
      return GET(this.@wrapped, 'open');
    }
    set open(v) {
      SET(this.@wrapped, 'open', !!v);
    }
  }
  export class HTMLDialogElement extends HTMLElement {
    get open() {
      return GET(this.@wrapped, 'open');
    }
    set open(v) {
      SET(this.@wrapped, 'open', !!v);
    }
    get returnValue() {
      return GET(this.@wrapped, 'returnValue');
    }
    set returnValue(v) {
      SET(this.@wrapped, 'returnValue', '' + v);
    }
    show(anchor) {
      CALL(this.@wrapped, 'show', UNWRAP(anchor));
    }
    showModal(anchor) {
      CALL(this.@wrapped, 'showModal', UNWRAP(anchor));
    }
    close(returnValue) {
      CALL(this.@wrapped, 'close', '' + returnValue);
    }
  }
  export class HTMLDirectoryElement extends HTMLElement {
    get compact() {
      return GET(this.@wrapped, 'compact');
    }
    set compact(v) {
      SET(this.@wrapped, 'compact', !!v);
    }
  }
  export class HTMLDivElement extends HTMLElement {
    get align() {
      return GET(this.@wrapped, 'align');
    }
    set align(v) {
      SET(this.@wrapped, 'align', '' + v);
    }
  }
}
