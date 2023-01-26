const regex = /^\s*<[\s\S]+>$/g;

const jGua = class dotGua extends Array {

   static parseHTML(html) {
      return new DOMParser().parseFromString(html, 'text/html')?.body;
   }

   static createTag(tagName) {
      if(typeof tagName != 'string') return tagName;
      if(tagName.includes(' ')) tagName = tagName?.split(' ')[0];
      return document.createElement(tagName);
   }

   constructor(selector) {
      if(!selector) return super();
      if(!Array.isArray(selector)) selector = [selector];
      super(...selector);
   }

   each(fn) {
      this.forEach(fn);
      return this;
   }

   addClass(classNames) {
      return this.each(e => e.classList.add(...(classNames.split(' '))));
   }

   removeClass(classNames) {
      return this.each(e => e.classList.remove(...(classNames.split(' '))));
   }

   hasClass(classNames) {
      return this.some(e => e.classList.contains(...(classNames.split(' '))));
   }

   toggleClass(className, value) {
      if(typeof value != 'boolean') value = !this.hasClass(className);
      return this.each(e => e.classList.toggle(className, value));
   }

   text(text) {
      if(typeof text != 'string') return this;
      return !text ? this[0]?.innerText: this.each(e => e.innerText = text);
   }

   html(html) {
      if(typeof html != 'string') return this;
      return !html ? this[0]?.innerHTML: this.each(e => e.innerHTML = html);
   }

   attr(key, value) {
      if(!key || typeof key != 'string' || (!!value && typeof value != 'string')) return this;
      if(!value) return this[0]?.getAttribute(key)||this;
      return this.each(e => e.setAttribute(key,value))
   }

   append(child) {
      if(Array.isArray(child)) child = child[0];
      if(typeof child == 'string' && child.startsWith('<')) 
             child    = dotGua.parseHTML(child) || child;
         let fragment = document.createDocumentFragment();
      fragment.append(child.cloneNode && child.cloneNode(true) || child);
      return this.each(e => e.append(fragment.cloneNode(true)));
   }

   remove(child) {
      if(child instanceof dotGua) child = child[0];
      if(!(child instanceof HTMLElement)) 
         if(!child) return (this[0]?.remove(), this);
         else return this;
      return this.each(e => e.removeChild(child));
   }

   on(event, callback, opts) {
      return this.each(e => e.addEventListener(event, callback, opts));
   }

   off(event, callback, opts) {
      return this.each(e => e.removeEventListener(event, callback, opts));
   }

   emit(event, ...args) {
      return this.each(e => e.dispatchEvent(new CustomEvent(event, {detail: args})));
   }

   once(event, callback) {
      const _callback = (...args) => {
         this.off(event, _callback);
         return callback(...args);
      }
      return this.on(event, _callback);
   }
}

const getKey = key => ((key = key?.toLowerCase()||key), ({
   'innertext' : 'text',
   'innerhtml' : 'html',
   'attributes': 'attr',
   'class'     : 'classname',
   'appendto'  : 'parent'
})[key]||key);

class dotGua {
   static init(selector) {
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

   static createElement(tagName, opts, inner) {
      if(!tagName || typeof tagName != 'string') return;
      const element = this.init(jGua.createTag(tagName));
      if(typeof opts == 'string') element.addClass(opts);
      else if(typeof opts == 'object' && !Array.isArray(opts)) {
         for(let key in opts) {
            let val = opts[key];
            
            if(key.startsWith('once')) {
               element.once(key.slice(4),val);
               continue;
            } 
            else if(key.startsWith('on')) {
               element.on(key.slice(2),val);
               continue;
            }
            switch(getKey(key)) {
               case 'text': element.text(val); break;
               case 'html': element.html(val); break;
               case 'attr': 
                  if(typeof val == 'object' && !Array.isArray(val))
                     for(let attr of Object.keys(val))
                        element.attr(attr, val[attr]);                  
               break;
               case 'classname': element.addClass(val); break;
               case 'parent'   : 
                  if(val instanceof HTMLElement) val.append(element[0]);
               default: element[0][key] = opts[key];
            }
         }
      } 

      if(!!inner) element.append(inner);
      return element;
   }
}

module.exports           = dotGua.init;
module.exports.__proto__ = dotGua;