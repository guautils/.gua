const regex = /^\s*<[\s\S]+>$/g,
      jGua  = class dotGua extends Array {
         
         /**
          * @param { string } html The HTML string to parse.
          * @returns { HTMLElement | undefined }
          */
         static parseHTML(html) {
            return new DOMParser().parseFromString(html, 'text/html').body.children?.[0]||html;
         }

         /**
          * @param { string } tagName The name of the tag you want to create.
          * @returns { HTMLElement }
          */
         static createTag(tagName) {
            if(typeof tagName != 'string') return tagName;

            if(tagName.includes(' ')) 
               tagName = tagName?.split(' ')[0];

            return document.createElement(tagName);
         }

         constructor(selector) {
            if(!selector) return super();
            if(!Array.isArray(selector)) selector = [selector];
            super(...selector);
         }

         /**
          * @param { function } fn  The function to execute on each element.
          * @returns { dotGua } `this`
          */
         each(fn) {
            this.forEach(typeof fn === 'function' ? fn : () => {});
            return this;
         }

         /**
          * @param { string } classNames The class names to add to the elements.
          * @returns { dotGua } `this`
          */
         addClass(classNames) {
            if(!classNames) return this;
            return this.each(e => e.classList.add(...(classNames.split(' '))));
         }

         /**
          * @param { string } classNames A string of class names separated by spaces.
          * @returns { dotGua } `this`
          */
         removeClass(classNames) {
            if(!classNames) return this;
            return this.each(e => e.classList.remove(...(classNames.split(' '))));
         }

         /**
          * @param { string } classNames The class name(s) to check for.
          * @returns { boolean } `boolean`
          */
         hasClass(classNames) {
            if(!classNames) return this;
            return this.some(e => e.classList.contains(...(classNames.split(' '))));
         }

         /**
          * @param { string } classNames The class name to toggle.
          * @param { boolean } value The value to set the class to. If not set, the class will be toggled.
          * @returns { dotGua } `this`
          */
         toggleClass(classNames, value) {
            if(!classNames) return this;
            if(typeof value != 'boolean') value = !this.hasClass(classNames);
            return this.each(e => e.classList.toggle(classNames, value));
         }

         /**
          * @param { string | undefined } text The Text string to set as the content of each element in the set.
          * @returns { string | undefined | dotGua } if `text` is empty it reads the innerText of the first element. else it returns `this`
          */
         text(text) {
            if(!!text && typeof text != 'string') return this;
            return !text ? this[0]?.innerText: this.each(e => e.innerText = text);
         }

         /**
          * @param { string | undefined } html The HTML string to set as the content of each element in the set.
          * @returns { string | undefined | dotGua } if `html` is empty it reads the innerHTML of the first element. else it returns `this`
          */
         html(html) {
            if(!!html && typeof html != 'string') return this;
            return !html ? this[0]?.innerHTML: this.each(e => e.innerHTML = html);
         }

         /**
          * @param { string } key The attribute name.
          * @param value The value to set the attribute to. If this is omitted, the attribute is removed.
          * @returns { any | dotGua } if `value` is empty it reads the attribute `key` of the first element. else it returns `this`
          */
         attr(key, value) {
            if(!key || typeof key != 'string' || (!!value && typeof value != 'string')) return this;
            if(!value) return this[0]?.getAttribute(key)||this;
            return this.each(e => e.setAttribute(key,value))
         }

         /**
          * @param child The child to append to the element.
          * @returns { dotGua } `this`
          */
         append(child) {
            if(typeof child === 'string' && child.startsWith('<')) child = dotGua.parseHTML(child) || child;
            return this.each((e,i) => {
               e.append((!i || !child.clone) ? (child instanceof dotGua || Array.isArray(child) ? child?.[0] : child) : child.clone(true));
               if(child.emit) child.emit('append');
            });
         }

         /**
          * @param { HTMLElement | dotGua | undefined } child The child to be removed. when empty the first element in the set gets removed.
          * @returns { dotGua } `this`
          */
         remove(child) {
            if(child instanceof dotGua) child = child[0];
            if(!(child instanceof HTMLElement)) {
               if(!child && typeof child === 'undefined') this[0]?.remove();
               return this;
            }
            return this.each(e => e?.removeChild(child));
         }

         /**
          * @param { string } event The event to listen for.
          * @param { function } callback The function to be called when the event is triggered.
          * @param { object | boolean } opts An optional object that can be used to specify options for the event listener.
          * @returns { dotGua } `this`
          */
         on(event, callback, opts) {
            return this.each(e => e.addEventListener && e.addEventListener(event, callback, opts));
         }

         /**
          * @param { string } event The event you want to remove.
          * @param { function } callback The function to be called when the event is triggered.
          * @returns { dotGua } `this`
          */
         off(event, callback) {
            return this.each(e => e.removeEventListener && e.removeEventListener(event, callback));
         }

         /**
          * @param { string } event The name of the event to trigger.
          * @param args The arguments to pass to the event handler.
          * @returns { dotGua } `this`
          */
         emit(event, ...args) {
            return this.each(e => e.dispatchEvent && e.dispatchEvent(new CustomEvent(event, { detail: args })));
         }

         /**
          * @param { string } event The name of the event to listen for.
          * @param { function } callback The function to be called when the event is triggered.
          * @returns { dotGua } `this`
          */
         once(event, callback) {
            return this.on(event, callback, {
               once: true
            });
         }

         /**
          * @param { boolean } deep A Boolean indicating whether to copy all descendant nodes.
          * @returns { dotGua } `this`
          */
         clone(deep=true) {
            if(!(this[0] instanceof HTMLElement)) return this;
            return new dotGua(this[0].cloneNode(deep));
         }

         /**
          * @param { dotGua | HTMLElement } parent The parent element to append the elements to.
          * @returns { dotGua } `this`
          */
         parent(parent) {
            if(!(parent instanceof dotGua || parent instanceof HTMLElement)) return this[0]?.parentElement;
            return this.each(e => {
               if(e.parentElement) new dotGua(e.parentElement).remove(e);
               (new dotGua(parent)).append(e);
            });
         }

         /**
          * @param { string } selector A string containing a selector expression to match elements against.
          * @returns { dotGua } child nodes
          */
         children(selector) {
            let parent                                              = this[0],
               childs                                              = new dotGua([...(parent.childNodes||parent.children)]);
            if  (!!selector && typeof selector === 'string') childs = childs.filter(e => [...document.querySelectorAll(selector)]?.includes(e));
            return childs;
         }

         /**
          * @param {dotGua | any | any[]} inner The inner content to render.
          * @returns { dotGua } `this`
          */
         render(...inner) {
            if  (!Array.isArray(inner)) inner = [inner];
            let parent                        = new dotGua(this[0]);

            if(!parent.length) return this;

            parent.children().each(e => e.remove());
            inner.forEach(e => {
               if(!(e instanceof dotGua)) e = new dotGua(e);
               e.parent(parent);
            });

            return this;
         }
      }

const getKey = key => ((key = key?.toLowerCase()||key), (() => {
   let obj = {
      attr     : 'attributes',
      childs   : 'children',
      events   : 'listeners',
      html     : 'innerhtml',
      text     : 'innertext',
      classname: /^class(?:es)?$/,
      parent   : /^(?:append(?:to)?)|parent(?:element|elmt)$/
   };
   return Object.keys(obj).find((e) =>obj[e] instanceof RegExp ? obj[e].test(key) : obj[e] === key || obj[e]?.split(',').includes(key));
})()||key);

class dotGua {

   /**
    * @param { string } selector the selector to be used.
    * @returns { dotGua } new `dotGua` Object
    */
   static init(selector) {

      if(typeof selector == 'function') {
         document.addEventListener('DOMContentLoaded', selector);
         return;
      }

      if(!selector) return new jGua();
      if(selector instanceof HTMLElement) return new jGua([selector]);
      if(selector instanceof NodeList) return new jGua([...selector]);
      if(typeof selector === 'string') {
         if(regex.test(selector) && selector.startsWith('<')) 
            return dotGua.init(jGua.parseHTML(selector));

         // don't know why this throws an error. but this kind of fixes the issue for now.
         // gonna check later what i did wrong here.
         try { return dotGua.init(document.querySelectorAll(selector) || []); } 
         catch { return dotGua.init(selector); }
      }
   }

   /**
    * @param arr The value to be converted to an array.
    * @returns { array } arr[]
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
    */
   static createElement(tagName, opts, inner) {
      if(!tagName || typeof tagName != 'string') return;
      if(!opts) opts = {};

      const element = this.init(jGua.createTag(tagName));

      let isOptsAString = typeof opts === 'string';

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
                  if(Array.isArray(val))
                     for(let child of val) element.append(child);
               break;
               case 'classname': element.addClass(val); break;
               case 'events'   : 
                  if(typeof val === 'object' && !Array.isArray(val))
                     for(let attr of Object.keys(val))
                        element.on(attr, val[attr]);                
               break;
               case 'html' : element.html(val); break;
               case 'parent': element.parent(val); break;
               case 'text' : element.text(val); break;
                    default: element[0][key] = opts[key]; break;
            }
         }

      return element;
   }
}

module.exports           = dotGua.init;
module.exports.__proto__ = dotGua;