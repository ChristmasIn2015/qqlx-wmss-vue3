/**
 * Bundle of call-printer
 * Generated: 2020-06-04
 * Version: 1.1.1
 * License: MIT
 * Author: 2631541504@qq.com
 */

function getStyleObj(dom) {
  return dom ? window.getComputedStyle(dom) : {};
}
function toHyphenCase(name) {
  return name.replace(/[A-Z]/g, function (char) {
    return "-".concat(char.toLowerCase());
  });
}
function stringifyStyle(styleObj) {
  return Object.keys(styleObj).reduce(function (pre, styleName) {
    var style = styleObj[styleName];
    return style !== undefined && style !== null && !/^\d+$/.test(styleName) ? "".concat(pre).concat(toHyphenCase(styleName), ":").concat(style, ";") : pre;
  }, '').replace(/"/g, "'");
}
function stringifyAttrs(el, extraAttrs) {
  var attrsMap = Array.prototype.map.call(el.attributes, function (at) {
    return {
      name: at.nodeName,
      value: at.nodeValue
    };
  }).filter(function (it) {
    return it.value && (!extraAttrs || !extraAttrs[it.name]);
  });
  var extraNames = extraAttrs ? Object.keys(extraAttrs).map(function (name) {
    return {
      name: name,
      value: extraAttrs[name]
    };
  }) : [];
  return attrsMap.concat(extraNames).reduce(function (pre, _ref) {
    var name = _ref.name,
        value = _ref.value;
    return value ? "".concat(pre).concat(name, "=\"").concat(value, "\" ") : pre;
  }, '');
}
function stringifyNode(el) {
  if (el.nodeName === '#text' || el.nodeName === '#comment') return el.nodeValue || '';
  var styleStr = stringifyStyle(getStyleObj(el));
  var attrs = stringifyAttrs(el, {
    style: styleStr
  });
  var tagName = el.nodeName.toLowerCase();

  if (['br', 'hr', 'input', 'img'].includes(tagName)) {
    return "<".concat(tagName, " ").concat(attrs, "/>");
  }

  var children = Array.prototype.reduce.call(el.childNodes, function (pre, node) {
    return pre + stringifyNode(node);
  }, '');
  return "<".concat(tagName, " ").concat(attrs, ">").concat(children, "</").concat(tagName, ">");
}

/**
 * @param { string | Element} [content]     the content you want print.
 *
 *                                          如果值类型为元素节点，将打印对应节点
 *                                          if content is an Element, it will print this element;
 *
 *                                          如果值类型为字符串，将打印解析得到的 html
 *                                          else if content is a string, it will print this string as a html file.
 *
 * @param { CallPrinterOptions } [options]
 * */
function callPrinter(content, options) {
  if (!content) window.print();else {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'display: none');
    iframe.setAttribute('src', 'javascript');
    console.log(iframe)
    
    document.body.appendChild(iframe);
    var subWindow = iframe.contentWindow;
    var $content;
    if (typeof content === 'string') $content = content;else $content = stringifyNode(content);
    subWindow.document.body.innerHTML = $content;
    setTimeout(function () {
      subWindow.print();
      document.body.removeChild(iframe);
    }, options && options.delay || 100);
  }
}

export { callPrinter, getStyleObj, stringifyAttrs, stringifyNode, stringifyStyle, toHyphenCase };
