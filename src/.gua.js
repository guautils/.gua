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
}

module.exports           = dotGua.init;
module.exports.__proto__ = dotGua;