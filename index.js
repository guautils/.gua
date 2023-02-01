// dev comms are in german, because i am german
// and i need to know what i was doing back then :^


const 
//#region   === Regular Expressions ===   
   validSelector         = /(\s*(\*|[.#]?[\w-]+|\[[\w-]+[~^|$*]?=(?:(['"]).+\3)\])[,\s>+~]?)+/g,
   validStyleDeclaration = /((?!\d)[\w-]+:\s*[^\n;]*);?/g,
   validHTMLString       = /<([^\s]+)\s*([\w\d-]+(?:=('|").*\3)?\s*)*(?:>.*<\/\1>|[^<\w\d-]?\/>)/g,
   isCamelCasing         = /([A-Z])[^A-Z]*/g;
//#endregion


let keysAndAliases = {
   attr     : 'attributes',
   childs   : 'children',
   events   : 'listeners,bind',
   css      : 'style',
   html     : 'innerhtml',
   text     : 'innertext',
   classname: /^class(es)?$/,
   parent   : /^append(to)?|parent(element|elmt)$/
};

//#region   === Functions ===   

function querySelector(query) {
   if(typeof query === 'string' && bonny.isValidSelector(query)) 
      return bonny.makeArray(document.querySelectorAll(query));

   return [];
}

function getKey(key) {
   key = key?.toLowerCase()||key;
   return Object
      .keys(keysAndAliases)
      .find((e) => {
         let  val                         = keysAndAliases[e];
         if   (val instanceof RegExp) val = val.test(key);
         else if(val.split) val           = val.split(',').map(e => e.trim()).includes(key);
         else val                         = (val === key);
         return val;
      })||key;
}

/** @returns { bonny } */
function init(selector) {
   if(selector instanceof bonny) return selector;

   if(typeof selector === 'function')
      return document.addEventListener('DOMContentLoaded', selector);
   
   const dot = new bonny();
   if(!selector) return dot;
   return dot.add(selector);
}

function setProp(element, props) {
   function loopWithFunc(obj, func) {
      if(typeof obj === 'object' && !Array.isArray(obj))
         for(let key of Object.keys(obj)) element[func](key, obj[key]);
   }

   for(let key in props) {
      let val = props[key];

      if(key.startsWith('on') && key !== 'on') {
         let evHandler = 'on' + (key.startsWith('once')?'ce':'');
         element[evHandler](key.slice(evHandler.length),val);
         continue;
      }

      switch(getKey(key)) {
      case 'attr'     : loopWithFunc(val, 'attr'); break;
      case 'childs'   : element.append(...bonny.makeArray(val)); break;
      case 'classname': element.addClass(val); break;
      case 'css'      : 
         if(typeof val === 'string') val = Object.fromEntries(val.split(validStyleDeclaration).map(e => e.trim()).filter(Boolean).map(e => e.split(':')));
         loopWithFunc(val, 'css'); 
      break; /* eslint-disable-line */
      case 'events': element.bind(val); break;
      case 'html'  : element.html(val); break;
      case 'parent': element.parent(val); break;
      case 'text'  : element.text(val); break;
      default : element[0][key] = val; break;
      }
   }
}

//#endregion

// upcoming functions
class experimentalBonny extends Array {
   /** @deprecated */
   map() {}

   /** @deprecated */
   offset() {}

   /** @deprecated */
   offsetParent() {}

   /** @deprecated */
   outerHeight() {}

   /** @deprecated */
   outerWidth() {}

   /** @deprecated */
   prevAll() {}

   /** @deprecated */
   prevUntil() {}

   /** @deprecated */
   prop() {}

   /** @deprecated */
   removeData() {}

   /** @deprecated */
   removeProp() {}

   /** @deprecated */
   replaceWith() {}

   /** @deprecated */
   resize() {}

   /** @deprecated */
   scrollLeft() {}

   /** @deprecated */
   scrollTop() {}

   /** @deprecated */
   select() {}

   /** @deprecated */
   serialize() {}

   /** @deprecated */
   unbind() {}

   /** @deprecated */
   unwrap() {}

   /** @deprecated */
   val() {}

   /** @deprecated */
   wrap() {}

   /** @deprecated */
   wrapAll() {}

   /** @deprecated */
   wrapUntil() {}

   /** @deprecated */
   wrapInner() {}
}

class bonny extends experimentalBonny {

   constructor(array) { 
      super(...bonny.makeArray(array).filter(Boolean)); 
   }

   //#region   === Statics ===    

   /** @returns { bonny } */
   static createElement(tagName, props={}, ...children) {

      let element = init();

      if(!tagName || typeof tagName != 'string') return element;
      if(!props || !['object', 'string'].includes(typeof props)) props = {};

      element = new bonny(bonny.createTag(tagName));

      if(children) {
         if(!props || typeof props === 'string')  {
            if(Array.isArray(children)) children.forEach(e => element.append(init(e)));
            else element.append(children); 
         } else {
            const propsKeys                                  = Object.keys(props),
               getChildKey                                   = (!!propsKeys.length&&(propsKeys?.find(e => getKey(e) === 'childs')))||'children';
            if    (!props?.[getChildKey]) props[getChildKey] = [];
            props[getChildKey]                               = this.makeArray(props[getChildKey]);
            props[getChildKey].push(...bonny.makeArray(children));
         }
      }

      if(typeof props === 'string') element.addClass(props);
      else if(typeof props === 'object' && !Array.isArray(props) && Object.keys(props).length) {
         setProp(element , props);
      }

      return element;
   }

   /** @returns { bonny } */
   static cloneElement(element, props={}, ...children) {
      element = init(element).clone(true);

      if(children) element.render(bonny.makeArray(children));
      if(!element.length) return element;

      if(typeof props === 'string') element.addClass(props);
      else if(!!props && typeof props === 'object' && !Array.isArray(props) && Object.keys(props).length) 
         setProp(element , props);
      

      return element;
   }

   /** @returns { bonny | HTMLElement } */
   static createTag(tag, initElement=false) {
      if(!tag || typeof tag !== 'string') return tag;
      if(tag.includes(' ')) tag = tag?.split(' ')[0];

      const tagElement = document.createElement(tag);
      return (typeof initElement === 'boolean') && !!initElement ? init(tagElement): tagElement;
   }

   /** @returns { boolean } */
   static isValidHTMLString(str) {
      return (typeof str === 'string') && !!str.match(validHTMLString)?.[0];
   }

   /** @returns { boolean } */
   static isValidSelector(str) {
      return (typeof str === 'string') && (str.match(validSelector)?.[0] === str);
   }

   /** @returns { boolean } */
   static isValidStyleDeclaration(str) {
      return (typeof str === 'string') && !!str.match(validStyleDeclaration)?.[0];
   }

   /** @returns { array } */
   static makeArray(arr) {
      if(arr instanceof HTMLCollection || arr instanceof NodeList || arr instanceof bonny) return [...arr];
      return (Array.isArray(arr)) ? arr: [arr];
   }

   /** @returns { array } */
   static parseHTML(html) {
      if(!html || typeof html !== 'string') return [];
      
      let arr      = html.match(validHTMLString),
         fragment  = new DocumentFragment();

      if(!arr?.length || !Array.isArray(arr)) return [];

      arr.forEach(e => fragment.append(new DOMParser().parseFromString(e, 'text/html').body.children?.[0]||e));
      return bonny.makeArray(fragment.children||[]);
   }

   /** @returns { Promise } */
   static when(callback) {
      let oldCallback = callback;

      if (typeof callback !== 'function') 
         callback = (r,re) => {
            try { return r(oldCallback); }
            catch (err) { return re(err); }
         };
      return new Promise(callback);
   }

   //#endregion


   //#region   === Getter ===   

   get bounds() {
      return this[0]?.getBoundingClientRect() || {};
   }

   get height() {
      return this.first().size['height'] || -1;
   }

   get position() {
      let element = this[0];
      if(!(element instanceof HTMLElement)) return { 
         x    : -1, y     : -1,
         top  : -1, left  : -1,
         right: -1, bottom: -1
      };

      const { x, y, top, left, right, bottom } = this.bounds;
      return { x, y, top, left, right, bottom };
   }

   get size() {
      let element = this[0];
      if(!(element instanceof HTMLElement)) return {width:-1,height:-1};
      const { width, height } = this.bounds;
      return {width, height};
   }

   get width() {
      return this.first().size['width'] || -1;
   }

   //#endregion

   /** @returns { bonny } */
   add(selector) {
      if(!selector) return this;
      if(!Array.isArray(selector)) {
         if(typeof selector === 'string')
            if   (bonny.isValidHTMLString(selector)) selector = bonny.parseHTML(selector);
            else if(bonny.isValidSelector(selector)) selector = querySelector(selector);
         selector                                             = bonny.makeArray(selector);
      }

      selector.forEach(element => {
         if(this.includes(element)) return;

         if(typeof element === 'string' && bonny.isValidSelector(element)) 
            element = querySelector(element);

         if(element instanceof HTMLElement) 
            this.push(element);
         else if (Array.isArray(element))
            element.forEach(el => this.add(el));
      });
      
      return this;
   }

   /** @returns { bonny } */
   addClass(classNames) {
      if(!classNames || typeof classNames !== 'string') return this;
      return this.each(e => e.classList.add(...(classNames.split(' '))));
   }

   /** @returns { bonny } */
   after(target) {
      return (init(target).insertAfter(this), this);
   }

   /** @returns { bonny } */
   append(...childs) {
      if(!childs?.length) return this;

      return this.each(e => {
         bonny.makeArray(childs).forEach(child => {
            if(typeof child === 'string' && bonny.isValidHTMLString(child)) 
               child = bonny.parseHTML(child);
               
            if(init(child).parent().has(child)) return;

            if(typeof child === 'string') e.append(child);
            else if(!Array.isArray(child)) e.append(!child.clone ? child : child.clone(true));
            else this.append(...bonny.makeArray(child));

            if(child.emit) child.emit('append');
         });
      });
   }

   /** @returns { bonny | any } */
   attr(key, value) {
      if(!key || typeof key != 'string') return this;
      if(!value && typeof value !== 'number') return this[0]?.getAttribute(key)||this;
      return this.each(e => e.setAttribute(key,value));
   }

   /** @returns { bonny } */
   bind(eventObj) {
      if(typeof eventObj === 'object' && !Array.isArray(eventObj)) {
         Object
            .keys(eventObj)
            .filter(e => typeof eventObj[e] === 'function')
            .forEach(e => this.on(e, eventObj[e]));
      }

      return this;
   }

   /** @returns { bonny } */
   before(target) {
      return (init(target).insertBefore(this), this);
   }

   /** @returns { bonny } */
   children(selector) {
      let parent = this?.[0];
      if(!parent) return this;
      return new bonny([...(bonny.makeArray(parent?.childNodes||parent?.children))]).grep(selector);
   }

   /** @returns { bonny } */
   clone(deep=true) {
      if(!(this[0] instanceof HTMLElement)) return init();
      return new bonny(this[0].cloneNode(deep));
   }

   /** @returns { bonny | any } */
   css(propName, value) {
      if(!propName || typeof propName !== 'string') return this;

      let computedStyle = (window.getComputedStyle ? window : document.defaultView).getComputedStyle(this[0]),
         styleKeys      = Object.keys(this[0].style);

      propName = styleKeys.find(e => e.toLowerCase() == propName.toLowerCase()) || propName;

      if(isCamelCasing.test(propName)) 
         propName = propName.replace(isCamelCasing, '-$&');
      
      propName = Object
         .keys(computedStyle)
         .find(e => e.toLowerCase() == propName.toLowerCase()) || propName.toLowerCase();

      if(!value && typeof value !== 'number') 
         return computedStyle.getPropertyValue(propName);

      return this.each(e => e.style[propName] = value);
   }

   /** @returns { bonny } */
   each(fn) {
      if(typeof fn === 'function') 
         this.forEach(fn);
      return this;
   }

   /** @returns { bonny } */
   emit(event, ...args) {
      return this.each(e => e.dispatchEvent && e.dispatchEvent(new CustomEvent(event, { detail: args })));
   }

   /** @returns { bonny } */
   empty() {
      return this.children().each(e => init(e).remove());
   }

   /** @returns { bonny } */
   first() {
      return this.nth(0);
   }

   /** @returns { bonny } */
   grep(selector) {
      return this.filter(e => querySelector(selector).includes(e));
   }

   /** @returns { bonny | boolean } */
   has(selector) {
      let childs = this.children().grep(selector);
      return childs.length ? childs: false;
   }

   /** @returns { boolean } */
   hasClass(classNames) {
      if(!classNames || typeof classNames !== 'string') return this;
      return this.some(e => e.classList.contains(...(classNames.split(' '))));
   }

   /** @returns { bonny | any } */
   html(html) {
      if(!!html && typeof html !== 'string') return this;
      return html==null ? this[0]?.innerHTML: this.each(e => !e && (e.innerHTML = html));
   }

   /** @returns { number } */
   index(selector) {
      let index = this.indexOf(selector);
      if(index < 0 && typeof selector === 'string') {
         let filtered = this.grep(selector);
         index        = this.indexOf(filtered[0]);
      }
      return index;
   }

   /** @returns { number } */
   innerHeight() {
      return this[0]?.innerHeight||null;
   }

   /** @returns { number } */
   innerWidth() {
      return this[0]?.innerWidth||null;
   }

   /** @returns { bonny } */
   insertBefore(child, reference) {
      if(!(reference instanceof HTMLElement || reference instanceof bonny))
         reference = this.first();

      reference = init(reference);

      child = bonny.makeArray(child);
      if(!reference.length || !(child instanceof HTMLElement)) return this;
      
      let parent = reference.parent()[0];
      if(!parent) return this;

      parent.insertBefore(child, reference[0]);
      
      return this;
   }

   /** @returns { bonny } */
   insertAfter(child) {
      return this.insertBefore(this.first(), child);
   }

   /** @returns { bonny } */
   last() {
      return new bonny(this.slice(-1));
   }

   /** @returns { bonny } */
   next() {
      return init(this[0]?.nextElementSibling);
   }

   /** @returns { bonny} */
   nextAll() {
      let nextSiblings = [];
      for(let nextSib=this;nextSib.length;nextSib = init(nextSib.next()))
         nextSiblings.push(nextSib[0]);

      return init(nextSiblings.slice(1));
   }

   /** @returns { bonny} */
   nextUntil(element) {
      element          = init(element)?.[0];
      let nextSiblings = [];
      for(let nextSib=this;(nextSib.length || element || !nextSiblings.includes(element));nextSib = init(nextSib.next()))
         nextSiblings.push(nextSib[0]);

      return init(nextSiblings.slice(1));
   }

   /** @returns { bonny} */
   nth(n) {
      return new bonny(this[n]);
   }

   /** @returns { bonny } */
   off(event, callback) {
      return this.each(e => e.removeEventListener(event, callback));
   }

   /** @returns { bonny } */
   on(event, callback, opts={}) {
      return this.each(e => e.addEventListener(event, callback, opts));
   }

   /** @returns { bonny } */
   once(event, callback) {
      return this.on(event, callback, { once: true });
   }

   /** 
    * @param { bonny | HTMLElement } parent
    * @returns { bonny } 
    */
   parent(parent) {
      if(!(parent instanceof bonny || parent instanceof HTMLElement)) 
         return init(this[0]?.parentElement);

      return this.each(e => {
         if(e.parentElement) init(e.parentElement).remove(e);
         parent.append(e);
      });
   }

   /** @returns { bonny } */
   parents() {
      let parents = new bonny([]);
      for(let lastParent = this.parent();lastParent.length;lastParent = lastParent.parent()) 
         parents.add(lastParent);
      return parents;
   }

   /** @returns { bonny } */
   parentsUntil(selector) {

      let parents = new bonny([]);

      selector = init(selector);
      if(!selector.length) return parents;

      for(let lastParent = this.parent();!(parents.includes(selector[0]) || !lastParent.length);lastParent = lastParent.parent())
         parents.add(lastParent);
      return parents;
   }

   /** @returns { bonny } */
   prev() {
      return init(this[0]?.previousElementSibling);
   }

   /** @returns { bonny } */
   remove(...childs) {
      if(!childs.length) return this.remove(this.first().emit('remove'));

      return this.each(e => init(childs).each(child => {
         child = init(child);
         if(!child.length) return;

         let parent                                  = init(e);
         if  (this.index(child.parent()) < 0) parent = child.parent()?.[0];
         
         if(!parent.length || !parent.removeClass) return;
         parent.removeClass(child[0]);
      }));
   }

   /** @returns { bonny } */
   removeAttr(attr) {
      if(!attr || typeof attr != 'string') return this;
      return this.each(e => e.removeAttribute(attr));
   }

   /** @returns { bonny } */
   removeClass(classNames) {
      if(!classNames) return this;
      return this.each(e => e.classList.remove(...(classNames.split(' '))));
   }

   /** @returns { bonny } */
   render(...inner) {

      let parent = this.first();
      if(!parent?.length) return this;

      parent.empty();

      inner.forEach(e => {
         if(typeof e == 'string') {
            parent.append(e);
         } else {
            if(!(e instanceof bonny)) e = init(e);
            e.parent(parent);
         }
      });

      return this;
   }

   /** @returns { bonny } */
   slice(start, end, selector=null) {
      return bonny.makeArray(this.grep(selector)).slice(start,end);
   }

   /** @returns { bonny | any } */
   text(text) {
      if(!!text && typeof text != 'string') return this;
      return text==null ? this[0]?.innerText: this.each(e => e.innerText = text);
   }

   /** @returns { bonny } */
   toggleClass(classNames, value) {
      if(!classNames || typeof classNames !== 'string') return this;
      if(typeof value != 'boolean') value = !this.hasClass(classNames);
      return this.each(e => e.classList.toggle(classNames, value));
   }

   /** @returns { bonny } */
   unique() {
      let set = new Set();
      this.each(e => set.add(e));
      return new bonny(bonny.makeArray(set));
   }
}

init.createElement           = bonny.createElement;
init.createTag               = bonny.createTag;
init.isValidHTMLString       = bonny.isValidHTMLString;
init.isValidSelector         = bonny.isValidSelector;
init.createElement           = bonny.createElement;
init.isValidStyleDeclaration = bonny.isValidStyleDeclaration;
init.makeArray               = bonny.makeArray;
init.when                    = bonny.when;

module.exports = init;
