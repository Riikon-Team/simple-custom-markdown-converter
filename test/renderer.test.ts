import { DefaultRenderer } from "../src/renderers/default/index";
import { FootnoteResolver } from "../src/core/resolver/footnote-resolver";
import { ASTNode } from "../src/types/parser";
import { MarkdownOptions } from "../src/types/options";

describe("DefaultRenderer (HTML)", () => {
    const createRenderer = (options: MarkdownOptions<string> = {}) => {
        return new DefaultRenderer(new FootnoteResolver(), options);
    };

    test("Renders a simple paragraph", () => {
        const node: ASTNode = {
            type: "Document",
            children: [
                {
                    type: "Paragraph",
                    children: [{ type: "Text", value: "Hello world" }]
                }
            ]
        };
        const renderer = createRenderer();
        expect(renderer.render(node)).toBe("<p>Hello world</p>");
    });

    test("Renders headers correctly", () => {
        const node: ASTNode = {
            type: "Header",
            level: 3,
            children: [{ type: "Text", value: "Title" }]
        };
        const renderer = createRenderer();
        expect(renderer.render(node)).toBe("<h3>Title</h3>");
    });

    test("supports custom render for headers", () => {
        const node: ASTNode = {
            type: "Header",
            level: 3,
            children: [{ type: "Text", value: "Title" }]
        };
        const renderer = createRenderer({
            renderOptions: {
                elements: {
                    Header: (_node: ASTNode, children: string[]) => `<h5>${children.join("")}</h5>`
                }
            }
        });
        expect(renderer.render(node)).toBe("<h5>Title</h5>");
    });

    test("escapes inline code", () => {
        const node: ASTNode = {
            type: "InlineCode",
            content: "<script>"
        };
        const renderer = createRenderer();
        expect(renderer.render(node)).toBe("<code>&lt;script&gt;</code>");
    });

    test("Renders nested bold/italic", () => {
        const node: ASTNode = {
            type: "Paragraph",
            children: [
                {
                    type: "Bold",
                    children: [
                        { type: "Text", value: "Bold " },
                        { type: "Italic", children: [{ type: "Text", value: "Italic" }] }
                    ]
                }
            ]
        };
        const renderer = createRenderer();
        expect(renderer.render(node)).toBe("<p><strong>Bold <em>Italic</em></strong></p>");
    });

    test("Render quote", () => {
        const node: ASTNode = {
            type: "Quote",
            children: [
                {
                    type: "Paragraph",
                    children: [{ type: "Text", value: "Hello?. This is a quote" }]
                },
                {
                    type: "Paragraph",
                    children: [{ type: "Text", value: "And here is a quote too" }]
                }
            ]
        };
        const renderer = createRenderer();
        const expectedStyle = "style=\"margin:0; padding:0 1em; color:#59636e; border-left:.25em solid #d1d9e0;\"";
        expect(renderer.render(node)).toBe(`<blockquote ${expectedStyle}><p>Hello?. This is a quote</p><p>And here is a quote too</p></blockquote>`);
    });

    test("Render link", () => {
        const node: ASTNode = {
            type: "Paragraph",
            children: [
                { type: "Text", value: "Check this " },
                {
                    type: "Link",
                    href: "https://google.com",
                    text: "Google"
                },
                { type: "Text", value: " link" }
            ]
        };
        const renderer = createRenderer();
        expect(renderer.render(node))
            .toBe('<p>Check this <a href="https://google.com">Google</a> link</p>');
    });

    test("Render image", () => {
        const node: ASTNode = {
            type: "Paragraph",
            children: [
                { type: "Text", value: "Here is an image: " },
                {
                    type: "Image",
                    src: "https://example.com/img.png",
                    alt: "Example image"
                }
            ]
        };
        const renderer = createRenderer();
        expect(renderer.render(node))
            .toBe('<p>Here is an image: <img src="https://example.com/img.png" alt="Example image"/></p>');
    });
});