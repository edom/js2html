"use strict";

if (typeof com !== "object") { com = {}; }
if (typeof com.spacetimecat !== "object") { com.spacetimecat = {}; }

com.spacetimecat.js2html = (function () {

    var escape = function (string) {
        return (
            string
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
        );
    };

    var createTextNode = function (content) {
        return {
            // private
            "type": "text",
            "content": content,
            // public
            "toDom": function (doc) {
                return doc.createTextNode(this.content);
            },
            "toString": function () {
                return escape(this.content);
            },
        };
    };

    var createElement = function (tag) {
        return {
            // private
            "type": "element",
            "tag": tag,
            "attributeMap": {},
            "attributeNames": [],
            "children": [],
            // Fake DOM
            "appendChild": function (child) {
                this.children.push(child);
                return this;
            },
            "getAttribute": function (name) {
                return this.attributeMap[name];
            },
            "setAttribute": function (name, value) {
                if (name in this.attributeMap) { return; }
                this.attributeNames.push(name);
                this.attributeMap[name] = value;
            },

            // public

            // value = e.attr(name) // get attribute
            // e.attr(name, value) // set attribute
            // e.attr(name, null) // set boolean attribute
            "attr": function (name, value) {
                if (value !== undefined) {
                    this.setAttribute(name, value);
                    return this;
                } else {
                    return this.getAttribute(name);
                }
            },

            // e.with(child1, child2, child3, ...) // append children
            // If child is a HTMLElement, it is appended directly.
            // If child is a string, it is turned to a TextNode and appended.
            "with": function () {
                var k;
                var arg;
                for (k in arguments) {
                    arg = arguments[k];
                    if (typeof(arg) === "string") {
                        arg = createTextNode(arg);
                    }
                    this.appendChild(arg);
                }
                return this;
            },

            // e.withText(content) // append a text node child
            "withText": function (value) {
                this.appendChild(createTextNode(value));
                return this;
            },

            // dom = e.toDom(document) // extract browser DOM object recursively
            "toDom": function (doc) {
                var e = doc.createElement(this.tag);
                for (var k in this.attributeNames) {
                    var name = this.attributeNames[k];
                    var value = this.attributeMap[name];
                    e.setAttribute(name, value);
                }
                for (var k in this.children) {
                    var child = this.children[k].toDom(doc);
                    e.appendChild(child);
                }
                return e;
            },

            "toString": function () {
                var add = function (x, y) { return x + y; };
                var e = this;
                var attributes = this.attributeNames.map(function (name) {
                    var value = e.attributeMap[name];
                    return " " + name + ((value === null) ? "" : ("=\"" + escape(value) + "\""));
                }).reduce(add, "");
                var inner = (this.children
                    .map(function (x) { return x.toString(); })
                    .reduce(add, "")
                );
                return "<" + this.tag + attributes + ">" + inner + "</" + this.tag + ">";
            },
        };
    }

    // Globalize the bindings, call the function, and restore the global.
    // This assumes that "window" is the global object.
    var withGlobal = function (bindings, fun) {
        var replace = function (target, source) {
            var restores = [];
            for (var k in source) {
                (function () {
                    var property = k;
                    var defined = property in target;
                    var original = target[property];
                    restores.push(function () {
                        if (defined) { target[property] = original; }
                        else { delete target[property]; }
                    });
                    target[property] = source[property];
                })();
            }
            var call = function (f) { f(); }
            var restore = function () { restores.forEach(call); };
            return restore;
        };
        var restore = replace(window, bindings);
        try { return fun(); } finally { restore(); }
    };

    // Execute the given function with HTML Building DSL bindings bound globally.
    var bindings = {};

    // https://developer.mozilla.org/en/docs/Web/HTML/Element
    // 2017-07-07T19:00:00+0700
    (
        "html " +
        "base head link meta style title " +
        "address article aside footer h1 h2 h3 h4 h5 h6 header hgroup nav section " +
        "blockquote dd div dl dt figcaption figure hr li main ol p pre ul " +
        "a abbr b bdi bdo br cite code data dfn em i kbd mark q rp rt rtc ruby s samp small span strong sub sup time u var wbr " +
        "area audio img map track video " +
        "embed object param source " +
        "canvas noscript script " +
        "del ins " +
        "caption col colgroup table tbody td tfoot th thead tr " +
        "button datalist fieldset form input label legend meter optgroup option output progress select textarea " +
        "details dialog menu menuitem summary " +
        "content element shadow slot template"
    ).split(" ").forEach(function (tag) {
        bindings[tag] = function () {
            var e = createElement(tag);
            e.with.apply(e, arguments);
            return e;
        };
    });

    bindings.buildHtml = function (fun) {
        return withGlobal(bindings, fun);
    };

    return bindings;
})();
