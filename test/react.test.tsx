import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { convertMarkdownToReactNode, MarkdownComponent } from "../src/react";
import { MarkdownReactOptions } from "../src/types/options";

describe("React Renderer Testing", () => {
    const renderToString = (node: React.ReactNode) => renderToStaticMarkup(node as React.ReactElement);

    test("Basic Markdown to ReactNode", () => {
        const md = "## Hello React\nThis is **bold**";
        const result = convertMarkdownToReactNode(md);
        expect(renderToString(result)).toBe(
            '<h2 style="border-bottom:1px solid #d1d9e0b3">Hello React</h2>' +
            '<p>This is <strong>bold</strong></p>'
        );
    });

    test("Complex document with CodeBlock and Quote", () => {
        const md = "> Quote\n```js\nconst a = 1;\n```";
        const result = convertMarkdownToReactNode(md);

        expect(renderToString(result)).toBe(
            '<blockquote style="margin:0;padding:0 1em;color:#59636e;border-left:.25em solid #d1d9e0">' +
            '<p> Quote</p></blockquote>' +
            '<pre><code class="lang-js">const a = 1;</code></pre>'
        );
    });

    test("Task list rendering in React", () => {
        const md = "- [ ] Todo\n- [x] Done";
        const result = convertMarkdownToReactNode(md);

        expect(renderToString(result)).toBe(
            '<ul>' +
            '<li><input type="checkbox" disabled="" readOnly=""/>Todo</li>' +
            '<li><input type="checkbox" disabled="" readOnly="" checked=""/>Done</li>' +
            '</ul>'
        );
    });

    test("Table rendering with alignment", () => {
        const md = "| Name | Side |\n|:---:|:---:|\n| Luke | Light |";
        const result = convertMarkdownToReactNode(md);

        expect(renderToString(result)).toBe(
            '<table><thead><tr>' +
            '<th style="text-align:center">Name</th>' +
            '<th style="text-align:center">Side</th>' +
            '</tr></thead><tbody><tr>' +
            '<td style="text-align:center">Luke</td>' +
            '<td style="text-align:center">Light</td>' +
            '</tr></tbody></table>'
        );
    });

    test("Custom React elements override", () => {
        const options: MarkdownReactOptions = {
            renderOptions: {
                elements: {
                    Bold: (_node, children) => React.createElement("span", { style: { color: 'blue' } }, ...children),
                    Link: (node) => {
                        if (node.href.startsWith('@')) {
                            return React.createElement("button", { className: "mention" }, node.text);
                        }
                        return React.createElement("a", { href: node.href }, node.text);
                    }
                }
            }
        };
        
        const md = "Stay **strong** [@hero](@hero)"; 
        const result = convertMarkdownToReactNode(md, options);

        expect(renderToString(result)).toBe(
            '<p>Stay <span style="color:blue">strong</span> <button class="mention">@hero</button></p>'
        );
    });

    test("Dangerous HTML handling in React", () => {
        const md = '<div class="custom">Raw</div>';
        const secureResult = convertMarkdownToReactNode(md);
        expect(renderToString(secureResult)).toBe('<code>&lt;div class=&quot;custom&quot;&gt;Raw&lt;/div&gt;</code>');
    });

    test("Footnote resolver in React", () => {
        const md = "Text[^1]\n[^1]: Note content";
        const result = convertMarkdownToReactNode(md);

        expect(renderToString(result)).toContain('<sup id="fnref:1">');
        expect(renderToString(result)).toContain('<section class="footnotes">');
    });

    test("MarkdownComponent (React Wrapper)", () => {
        const md = "# Title";
        const html = renderToStaticMarkup(
            <MarkdownComponent content={md} options={{ converterOptions: { allowDangerousHtml: false } }} className="md-body" />
        );

        expect(html).toBe(
            '<div class="md-body">' +
            '<h1 style="border-bottom:1px solid #d1d9e0b3">Title</h1>' +
            '</div>'
        );
    });
});