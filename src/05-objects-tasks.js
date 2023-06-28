/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return new proto.constructor(...Object.values(JSON.parse(json)));
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const ERR = {
  MUL_KEY: 'Element, id and pseudo-element should not occur more then one time inside the selector',
  ORDER: 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
};

class CssBuilder {
  constructor() {
    this.state = 0;
  }

  element(str) { // 0 -> 1
    this.stateVert(1);
    this.elementStr = str;
    return this;
  }

  id(str) { // 1 -> 2
    this.stateVert(2);
    this.idStr = `#${str}`;
    return this;
  }

  class(str) { // 2 -> 3
    return this.multiProp('classStr', `.${str}`, 3);
  }

  attr(str) { // 3 -> 4
    return this.multiProp('attrStr', `[${str}]`, 4);
  }

  pseudoClass(str) { // 4 -> 5
    return this.multiProp('pseudoClassStr', `:${str}`, 5);
  }

  pseudoElement(str) { // 5 -> 6
    this.stateVert(6);
    this.pseudoElementStr = `::${str}`;
    return this;
  }

  stringify() {
    return `${this.elementStr || ''}${this.idStr || ''}${this.classStr || ''}${this.prop || ''}${this.attrStr || ''}${this.pseudoClassStr || ''}${this.pseudoElementStr || ''}`;
  }

  multiProp(prop, str, state) {
    this.stateVert(state, true);
    if (!this[prop]) { this[prop] = str; } else { this[prop] += str; }
    return this;
  }

  stateVert(num, include = false) {
    if (!include && this.state === num) { throw new Error(ERR.MUL_KEY); }
    if (this.state > num) { throw new Error(ERR.ORDER); }
    this.state = num;
  }
}

function cssCombine(sel1, divider, sel2) {
  return {
    sel1,
    divider,
    sel2,
    stringify() {
      return `${this.sel1.stringify()} ${this.divider} ${this.sel2.stringify()}`;
    },
  };
}

const cssSelectorBuilder = new Proxy(CssBuilder, {
  get: (Target, prop) => {
    if (prop !== 'combine') {
      const css = new Target();
      return (...args) => css[prop](...args);
    }
    return cssCombine;
  },
});

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
