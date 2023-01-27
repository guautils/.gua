![code size in bytes](https://img.shields.io/github/repo-size/guautils/.gua?color=%237073fd&style=for-the-badge)
![Lines of code](https://img.shields.io/tokei/lines/github/guautils/.gua?color=%236a6dfd&style=for-the-badge)
![package.json version](https://img.shields.io/github/package-json/v/guautils/.gua?color=%236a6dfd&style=for-the-badge)
![commit activity](https://img.shields.io/github/commit-activity/w/guautils/.gua?label=commits&color=%236a6dfd&style=for-the-badge)
![sponsors](https://img.shields.io/github/sponsors/guautils?color=%236a6dfd&style=for-the-badge)
![Project Banner](./imgs/readme_banner.png)

# What is `.gua`

`.gua` is my fusion of jquery with React and a sprinkle of my own ideas.

I want to challenge myself and also make a useful tool for later projects i might do.

I try to update this Repo regularly but cant promise the impossible.

# Why dont just use React and/or jquery

:^ I'm too dumb for React and jquery is older than my grand grand grand grandma..

> I want to challenge myself and see what I am capable of.

[Support me on Ko-fi](https://ko-fi.com/T6T56CO8O)

## Example Code

```js
// dotgua v0.0.127
const dot = require('dotgua');

dot(() => {
   const appMount = dot.createElement('div', 'app-mount'),
         container = dot.createElement('div', {
            id      : 'container',
            attr    : { 'data-abc': 'something' }
            onclick : () => container.remove(),
            parent  : appMount
         });
   container.render('<p>paragraph #1</p>');

   for(let i=1; i<4; i++) appMount.append(`<p>paragraph #${i}</p>`);
   appMount.parent(document.body);
});
```
> will return
```html
<div class="app-mount">
   <div id="container" data-abc="something">
      <p>paragraph #1</p>
   </div>
   <p>paragraph #1</p>
   <p>paragraph #2</p>
   <p>paragraph #3</p>
</div>
```