const regex          = /^\s*<.*>$/g,
      parseHTMLRegex = /<([^\n]+).*>(.*)?<\/\1>/g,
      jGua           = class dotGua extends Array {
         
         /**
          * @param selector A string containing a selector expression to match elements against.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/
          */
         constructor(selector) {
            let _ = selector;
            if(!selector) return super();
            if(!Array.isArray(selector)) selector = [selector];
            super(...(selector));
         }

         /**
          * @param { string } tagName - The name of the tag you want to create.
          * @param { boolean } [init=false] - If `true`, the element will be wrapped inside a `dotGua` object.
          * @returns { HTMLElement | dotGua }
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/static-createtag
          */
         static createTag(tagName,init=false) {
            if(typeof tagName != 'string') return tagName;

            if(tagName.includes(' ')) 
               tagName = tagName?.split(' ')[0];

            let    element        = document.createElement(tagName);
            return (typeof init === 'boolean') && !!init ? new dotGua([element]) : element;
         }

         /**
          * @param { string } html The HTML string to parse.
          * @returns { HTMLElement | undefined }
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/static-parsehtml
          */
         static parseHTML(html) {
            let content                            = [],
                fragment                           = new DocumentFragment();
            if  (typeof html === 'string') content = html.match(parseHTMLRegex);
            content.forEach(e => fragment.append(new DOMParser().parseFromString(e, 'text/html').body.children?.[0]||e));

            return [...(fragment.children||[])];
         } 

         /**
          * @param { dotGua | any[] } elements The elements to add to the end of the array.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/add
          */
         add(selector) {
            if(!Array.isArray(selector)) {
               if(typeof selector == 'function') 
                  return document.addEventListener('DOMContentLoaded', selector);

               if(!selector) return new jGua();
               if(selector instanceof HTMLElement) selector = [selector];
               if(selector instanceof NodeList || Array.isArray(selector)) 
                  selector = [...selector];

               if(typeof selector === 'string') 
                  if   (new RegExp(regex).test(selector)) selector = jGua.parseHTML(selector);
                  else selector                                    = [...document.querySelectorAll(selector)];
            }  
            
            selector.forEach(e => {
               if(typeof e === 'string') e = [...document.querySelectorAll(e)];

               if(e instanceof HTMLElement) this.push(e);
               else if (Array.isArray(e)) e.forEach(_ => this.push(_));
            });
            
            return this;
         }

         /**
          * @param { string } classNames The class names to add to the elements.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/addclass
          */
         addClass(classNames) {
            if(!classNames) return this;
            return this.each(e => e.classList.add(...(classNames.split(' '))));
         }

         /**
          * @param target The element to insert after.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/after
          */
         after(target) {
            if(Array.isArray(target)) target = target[0];
            new dotGua(target).insertAfter(this);
            return this;
         }

         /**
          * @param child The child to append to the element.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/append
          */
         append(...childs) {
            if(!Array.isArray(childs)) childs = [childs];

            return this.each(e => {
               if(!e.append) return;
               childs.forEach(child => {

                  if(typeof child === 'string' && child.match(parseHTMLRegex)) 
                     child = dotGua.parseHTML(child);

                  if((new dotGua([child])).parent().has(child)) return;
                  if(!Array.isArray(child)) e.append(!child.clone ? child : child.clone(true));
                  else child.forEach((_child) => e.append(!_child.clone ? _child : _child.clone(true)));

                  if(child.emit) child.emit('append');
               });
            });
         }

         /**
          * @param { string } key The attribute name.
          * @param value The value to set the attribute to. If this is omitted, the attribute is removed.
          * @returns { any | dotGua } if `value` is empty it reads the attribute `key` of the first element. else it returns `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/attr
         */
         attr(key, value) {
            if(!key || typeof key != 'string' || (!!value && typeof value != 'string')) return this;
            if(!value) return this[0]?.getAttribute(key)||this;
            return this.each(e => e.setAttribute(key,value));
         }

         /**
          * @param { object }eventObj An object containing the events and their respective functions.
          * @returns { dotGua } `this`
          */
         bind(eventObj) {
            if(typeof eventObj !== 'object' || Array.isArray(eventObj)) return this;

            let keys = Object.keys(eventObj).filter(e => typeof eventObj[e] === 'function');
            keys.forEach(e => this.on(e, eventObj[e]));

            return this;
         }

         /**
          * @param target The element to insert before.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/before
          */
         before(target) {
            if(Array.isArray(target)) target = target[0];
            new dotGua(target).insertBefore(this);
            return this;
         }

         /**
          * @param { string } selector A string containing a selector expression to match elements against.
          * @returns { dotGua } child nodes
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/children
          */
         children(selector) {
            let parent = this[0];
            return new dotGua([...((parent?.childNodes||parent?.children)||[])]).grep(selector);
         }

         /**
          * @param { boolean } deep A Boolean indicating whether to copy all descendant nodes.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/clone
          */
         clone(deep=true) {
            if(!(this[0] instanceof HTMLElement)) return this;
            return new dotGua(this[0].cloneNode(deep));
         }
         
         /**
          * @param { string } propName The name of the property you want to get/set.
          * @param [value] The value to set the property to.
          * @returns { dotGua | any } when `value` is given returns `this`, else returns value from the `propName` property.
          */
         css(propName, value) {
            if(!this.length || typeof propName !== 'string') return this;

            let getCS = (window.getComputedStyle ? window : document.defaultView).getComputedStyle(this[0]);

            propName = Object.keys(this[0].style).find(e => e.toLowerCase() == propName.toLowerCase()) || propName;

            let camelCasing                           = /([A-Z])[^A-Z]*/g;
            if  (camelCasing.test(propName)) propName = propName.replace(camelCasing, '-$&');
            
            propName = Object.keys(getCS).find(e => e.toLowerCase() == propName.toLowerCase()) || propName.toLowerCase();
            if(typeof value === 'undefined') return getCS.getPropertyValue(propName);

            return this.each(e => e.style[propName] = value);
         }

         /**
          * @param { function } fn The function to execute on each element.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/each
          */
         each(fn) {
            this.forEach(typeof fn === 'function' ? fn : () => {});
            return this;
         }

         /**
          * @param { string } event The name of the event to trigger.
          * @param [args] The arguments to pass to the event handler.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/emit
          */
         emit(event, ...args) {
            return this.each(e => e.dispatchEvent && e.dispatchEvent(new CustomEvent(event, { detail: args })));
         }

         /**
          * @returns { dotGua } A new dotGua object.
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/first
          */
         first() {
            return this.nth(0);
         }

         /**
          * @param selector The selector to use to filter the elements.
          * @returns { dotGua } `this`
          */
         grep(selector) {
            if(typeof selector !== 'string') return this;
            let _ = [...(document.querySelectorAll(selector)||[])];
            return this.filter(e => _.includes(e));
         }

         /**
          * @param selector A string containing a selector expression to match elements against.
          * @returns { dotGua | boolean} `this`, when empty `false`
          */
         has(selector) {
            let _ = this.children().grep(selector);
            return _.length ? _: false;
         }

         /**
          * @param { string } classNames The class name(s) to check for.
          * @returns { boolean } `boolean`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/hasclass
          */
         hasClass(classNames) {
            if(!classNames) return this;
            return this.some(e => e.classList.contains(...(classNames.split(' '))));
         }

         /**
          * @param { string } [html] The HTML string to set as the content of each element in the set.
          * @returns { string | undefined | dotGua } if `html` is empty it reads the innerHTML of the first element. else it returns `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/html
          */
         html(html) {
            if(!!html && typeof html != 'string') return this;
            return !html ? this[0]?.innerHTML: this.each(e => e.innerHTML = html);
         }

         /**
          * @param { HTMLElement | string } selector The selector to search for.
          * @returns { number } index of an element
          */
         index(selector) {
            let index = this.indexOf(selector);
            if(index < 0 && typeof selector === 'string') {
               let filtered = this.grep(selector);
                   index    = this.indexOf(filtered[0]);
            }
            return index;
         }

         /**
          * @param child The child to insert.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/insertbefore
          */
         insertBefore(child, reference) {
            if(!(reference instanceof HTMLElement || reference instanceof dotGua)) reference = this[0];
            if(!!this[0]) reference                                                          = this[0];
               reference                                                                     = new dotGua(reference);

            if (Array.isArray(child)) child = child[0];
            if(!reference.length || !(child instanceof HTMLElement)) return this;
            
            let parent = reference.parent()[0];
            if(!parent) return this;

            parent.insertBefore(child, reference[0]);
            
            return this;
         }

         /**
          * @param child The element to insert.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/insertafter
          */
         insertAfter(child) {
            return this.insertBefore(child, this[0]);
         }

         /**
          * @returns { dotGua } A new dotGua object.
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/last
          */
         last() {
            return new dotGua(this.slice(-1));
         }

         /**
          * @returns { dotGua } A new dotGua object.
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/next
          */
         next() {
            return new dotGua(this[0]?.nextElementSibling);
         }

         /**
          * @param n The index of the element to return.
          * @returns { dotGua } A new dotGua object.
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/nth
          */
         nth(n) {
            return new dotGua(this?.[n]);
         }

         /**
          * @param { string } event The event you want to remove.
          * @param { function } callback The function to be called when the event is triggered.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/off
          */
         off(event, callback) {
            return this.each(e => e.removeEventListener(event, callback));
         }

         /**
          * @param { string } event The event to listen for.
          * @param { function } callback The function to be called when the event is triggered.
          * @param { object | boolean } opts An optional object that can be used to specify options for the event listener.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/on
          */
         on(event, callback, opts={}) {
            return this.each(e => e.addEventListener(event, callback, opts));
         }

         /**
          * @param { string } event The name of the event to listen for.
          * @param { function } callback The function to be called when the event is triggered.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/once
          */
         once(event, callback) {
            return this.on(event, callback, {
               once: true
            });
         }

         /**
          * @param { dotGua | HTMLElement } parent The parent element to append the elements to.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/parent
          */
         parent(parent) {
            if(!(parent instanceof dotGua || parent instanceof HTMLElement)) return new dotGua(this[0]?.parentElement);
            return this.each(e => {
               if(e.parentElement) new dotGua(e.parentElement).remove(e);
               (new dotGua(parent)).append(e);
            });
         }

         /**
          * @returns { dotGua } A new dotGua object.
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/prev
          */
         prev() {
            return new dotGua(this[0]?.previousElementSibling);
         }

         /**
          * @param { HTMLElement | dotGua | undefined } child The child to be removed. when empty the first element in the set gets removed.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/remove
          */
         remove(child) {
            if(child instanceof dotGua) child = child[0];
            if(!(child instanceof HTMLElement)) {
               if(!child && typeof child === 'undefined') 
                  new dotGua(this[0]).emit('remove').remove();
               return this;
            }
            return this.each(e => e?.removeChild(new dotGua(child).emit('remove')[0]));
         }

         /**
          * @param { string } classNames A string of class names separated by spaces.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/removeclass
          */
         removeClass(classNames) {
            if(!classNames) return this;
            return this.each(e => e.classList.remove(...(classNames.split(' '))));
         }

         /**
          * @param {dotGua | any | any[]} inner The inner content to render.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/render
          */
         render(...inner) {
            if  (!Array.isArray(inner)) inner = [inner];
            let parent                        = this.first();

            if(!parent?.length) return this;

            parent.children().each(e => e.remove());
            inner.forEach(e => {
               if(typeof e == 'string' && e.match(parseHTMLRegex)?.length) e = dotGua.parseHTML(e);
               if(!(e instanceof dotGua)) e                                  = new dotGua(e);

               e.parent(parent);
            });

            return this;
         }

         /**
          * @param { number } [start] - The index at which to begin the selection.
          * @param { number } [end] - The index at which to end the selection.
          * @param { string } selector - The selector to filter the elements by.
          * @returns { dotGua } filtered `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/slice
          */
         slice(start, end, selector=null) {
            return [...(this.grep(selector))].slice(start,end);
         }

         /**
          * @param { string } [text] The Text string to set as the content of each element in the set.
          * @returns { string | undefined | dotGua } if `text` is empty it reads the innerText of the first element. else it returns `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/text
          */
         text(text) {
            if(!!text && typeof text != 'string') return this;
            return !text ? this[0]?.innerText: this.each(e => e.innerText = text);
         }

         /**
          * @param { string } classNames The class name to toggle.
          * @param { boolean } value The value to set the class to. If not set, the class will be toggled.
          * @returns { dotGua } `this`
          * @link https://dotgua.gitbook.io/.gua/dotgua-array/toggleclass
          */
         toggleClass(classNames, value) {
            if(!classNames) return this;
            if(typeof value != 'boolean') value = !this.hasClass(classNames);
            return this.each(e => e.classList.toggle(classNames, value));
         }

         /**
          * @returns { dotGua } `this`
          */
         unique() {
            let set = new Set();
            this.each(e => set.add(e));
            return new dotGua(...set);
         }
      }

const getKey = key => ((key = key?.toLowerCase()||key), (() => {
   let obj = {
      attr     : 'attributes',
      childs   : 'children',
      events   : ['listeners','bind'],
      css      : 'style',
      html     : 'innerhtml',
      text     : 'innertext',
      classname: /^class(?:es)?$/,
      parent   : /^(?:append(?:to)?)|parent(?:element|elmt)$/
   };
   return Object.keys(obj).find( (e) => obj[e] instanceof RegExp ? obj[e].test(key) : obj[e] === key || obj[e].split ? obj[e]?.split(',').includes(key) : false || e === key);
})()||key);

class dotGua {

   /**
    * @param { string | function } selector the selector to be used.
    * @returns { dotGua } new `dotGua` Object
    * @link https://dotgua.gitbook.io/.gua/dotgua/init
    */
   static init(selector) {
      if(typeof selector == 'function') 
         return document.addEventListener('DOMContentLoaded', selector);

      let result = new jGua();

      if(!selector) return result;
      return result.add(selector);
   }

   /**
    * @param arr The value to be converted to an array.
    * @returns { array } arr[]
    * @link https://dotgua.gitbook.io/.gua/dotgua/makearray
    */
   static makeArray(arr) {
      if(!Array.isArray(arr)) arr = [arr];
      return arr;
   }

   /**
    * @param { string } tagName The tag name of the element you want to create.
    * @param { string | object } opts when being a `string` `opts` gets treaded like a className. 
    * @param { any | any[] } inner The inner HTML of the element.
    * @returns { dotGua } new `dotGua` Object with created Element
    * @link https://dotgua.gitbook.io/.gua/dotgua/createelement
    */
   static createElement(tagName, opts, inner) {
      if(!tagName || typeof tagName != 'string') return;
      if(!opts || !['object', 'string'].includes(typeof opts)) opts = {};

      const element = this.init(jGua.createTag(tagName));

      let isOptsAString = (typeof opts === 'string');

      if(!!inner) {

         if(isOptsAString) {
            if(Array.isArray(inner)) inner.forEach(e => element.append(dotGua.init(e)));
            else element.append(dotGua.init(inner)); 
         } else {
            let optsKeys    = Object.keys(opts),
                getChildKey = (!!optsKeys.length&&(optsKeys?.find(e => getKey(e) === 'childs')))||'children';

            if(!opts.hasOwnProperty(getChildKey)) opts[getChildKey] = [];

            opts[getChildKey] = this.makeArray(opts[getChildKey]);

            if(Array.isArray(inner)) opts[getChildKey] = opts[getChildKey].concat(inner);
            else opts[getChildKey].push(inner);
         }
      }

      if(isOptsAString) element.addClass(opts);
      else if(typeof opts === 'object' && !Array.isArray(opts) && Object.keys(opts).length) 
         for(let key in opts) {
            let val = opts[key];
            
            if(key.startsWith('on')) {
               if(key.startsWith('once')) element.once(key.slice(4),val);
               else element.on(key.slice(2),val);
               continue;
            }
            
            switch(getKey(key)) {
               case 'attr': 
                  if(typeof val === 'object' && !Array.isArray(val))
                     for(let attr of Object.keys(val))
                        element.attr(attr, val[attr]);   
               break;   
               case 'childs': 
                  if(!Array.isArray(val)) val = [val];
                  element.append(...val);
               break;
               case 'classname': element.addClass(val); break;
               case 'css'      : 
                  if(typeof val === 'string') {
                     let getStyleRegex = /([\w-]*:\s*[^\n;]*);?/g;
                         val           = Object.fromEntries(val.split(getStyleRegex).map(e => e.trim()).filter(Boolean).map(e => e.split(':')));
                  }
                  if(typeof val === 'object' && !Array.isArray(val))
                     for(let style of Object.keys(val))
                        element.css(style, val[style]);
               case 'events': 
                  element.bind(val);             
               break;
               case 'html'  : element.html(val); break;
               case 'parent': element.parent(val); break;
               case 'text'  : element.text(val); break;
                    default : element[0][key] = opts[key]; break;
            }
         }

      return element;
   }

   /**
    * @param {function | any} callback A function that takes two parameters, resolve and reject.
    * @returns { Promise } a Promise
    */
   static when(callback) {
      let payload                                   = callback;
      if  (typeof callback !== 'function') callback = (r,re) => {
         try { r(payload) }
         catch (error) { re(error); }
      };
      return new Promise(callback);
   }
}

module.exports           = dotGua.init;
module.exports.__proto__ = dotGua;