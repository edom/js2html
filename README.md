# js2html

HTML-building JavaScript ES 5 Domain Specific Language
inspired by [j2html](https://j2html.com/).

`buildHtml` assumes that `window` is the global object.

## Usage

Copy the script.
Put this in `head`.
Replace `PATH` with where your server thinks it is.

```html
<script type="text/javascript" src="PATH/com.spacetimecat.js2html-0.0.0.js"></script>
```

If you prefer globals:

```javascript
var virtualElement = com.spacetimecat.j2html.buildHtml(function () {
    return table(
        tr(
            td("left"), td("right")
        )
    );
});
var domElement = virtualElement.toDom(document);
var sourceCode = e.toString();
```

If you avoid globals:

```javascript
var h = com.spacetimecat.j2html;
var virtualElement = h.table(
    h.tr(
        h.td("left"), h.td("right")
    )
);
var domElement = virtualElement.toDom(document);
var sourceCode = virtualElement.toString();
```

The `toString` method supports isomorphic JavaScript.
Write your view templates as plain JavaScript functions.
Run the same script on server (Nashorn, Node, etc.)
and client (Firefox, Chromium, etc.).

## Design

The namespace is `com.spacetimecat.js2html`.

There is a function for [each HTML element](https://developer.mozilla.org/en/docs/Web/HTML/Element).

```
function div : Children -> Element
function span : Children -> Element
function strong : Children -> Element

Children = String | Element

Element.toDom : HTMLDocument -> HTMLElement
Element.toString : String
```

`buildHtml(f)` copies those bindings to the global object,
calls `f`, and restores the global object.
