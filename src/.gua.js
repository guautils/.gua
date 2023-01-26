const regex = /^\s*(<[\s\S]+)>$/g;

const jGua = class dotGua extends Array {

   static parseHTML(html) {
      let dummy           = document.createElement('dummy');
          dummy.innerHTML = html;
      return dummy.children?.[0]||dummy;
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
}

class dotGua {
   static init(selector) {
      if(!selector) return new jGua();
      if(selector instanceof HTMLElement) return new jGua([selector]);
      if(selector instanceof NodeList) return new jGua([...selector]);
      if(typeof selector === 'string') {
         if(regex.test(selector) && selector.startsWith('<')) 
            return dotGua.init(jGua.parseHTML(selector));

         return dotGua.init(document.querySelectorAll(selector) || []);
      }
   }

   // TODO: create function
   static createElement(tagName, opts, inner) { }
}

module.exports           = dotGua.init;
module.exports.__proto__ = dotGua;