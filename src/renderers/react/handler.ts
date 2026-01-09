import React, { ReactNode } from "react";
import { RenderStrategy } from "../../types/renderer";

//Base structural nodes
export const DocumentHandler: RenderStrategy<ReactNode> = {
    type: "Document",
    render: (_node, children, ctx) => React.createElement(
        React.Fragment,
        null,
        ...children,
        ctx.renderFootnotes()
    )
};

export const ParagraphHandler: RenderStrategy<ReactNode> = {
    type: "Paragraph",
    render: (_node, children) => React.createElement("p", null, ...children)
};

//Container nodes
export const CodeBlockHandler: RenderStrategy<ReactNode> = {
    type: "CodeBlock",
    render: (node) => React.createElement(
        "pre",
        null,
        React.createElement(
            "code",
            { className: `lang-${node.lang}` },
            node.content || ""
        )
    )
};

export const HeaderHandler: RenderStrategy<ReactNode> = {
    type: "Header",
    render: (node, children) => {
        if (!node.level) return React.createElement("p", null, ...children);
        return React.createElement(
            `h${node.level}`,
            { style: { borderBottom: node.level <= 2 ? "1px solid #d1d9e0b3" : undefined } },
            ...children
        );
    }
};

export const QuoteHandler: RenderStrategy<ReactNode> = {
    type: "Quote",
    render: (_node, children) => React.createElement(
        "blockquote",
        { style: { margin: "0", padding: "0 1em", color: "#59636e", borderLeft: ".25em solid #d1d9e0" } },
        ...children
    )
};

//For list nodes
export const ListHandler: RenderStrategy<ReactNode> = {
    type: "List",
    render: (node, children) => React.createElement(
        node.ordered ? "ol" : "ul",
        null,
        ...children
    )
};

export const ListItemHandler: RenderStrategy<ReactNode> = {
    type: "ListItem",
    render: (_node, children) => React.createElement("li", null, ...children)
};

export const TaskItemHandler: RenderStrategy<ReactNode> = {
    type: "TaskItem",
    render: (node, children) => React.createElement(
        "li",
        { style: { listStyleType: "none" } },
        React.createElement("input", {
            type: "checkbox",
            disabled: true,
            checked: !!node.checked,
            readOnly: true
        }),
        ...children
    )
};

//Styling nodes
export const BoldHandler: RenderStrategy<ReactNode> = {
    type: "Bold",
    render: (_node, children) => React.createElement("strong", null, ...children)
};

export const ItalicHandler: RenderStrategy<ReactNode> = {
    type: "Italic",
    render: (_node, children) => React.createElement("em", null, ...children)
};

export const StrikethroughHandler: RenderStrategy<ReactNode> = {
    type: "Strikethrough",
    render: (_node, children) => React.createElement("s", null, ...children)
};

export const InlineCodeHandler: RenderStrategy<ReactNode> = {
    type: "InlineCode",
    render: (node) => React.createElement("code", null, node.content || "")
};

//Media nodes
export const LinkHandler: RenderStrategy<ReactNode> = {
    type: "Link",
    render: (node) => React.createElement(
        "a",
        { href: node.href, target: "_blank", rel: "noopener" },
        node.text
    )
};

export const ImageHandler: RenderStrategy<ReactNode> = {
    type: "Image",
    render: (node) => React.createElement("img", {
        src: node.src || "",
        alt: node.alt || ""
    })
};

//Leaf nodes
export const HorizontalLineHandler: RenderStrategy<ReactNode> = {
    type: "HorizontalLine",
    render: () => React.createElement("hr")
};

export const TextHandler: RenderStrategy<ReactNode> = {
    type: "Text",
    render: (node) => node.value || ""
};

//Table nodes
export const TableHandler: RenderStrategy<ReactNode> = {
    type: "Table",
    render: (node, children, ctx) => ctx.renderTable(node, children)
};

//For HTML
export const HTMLBlockHandler: RenderStrategy<ReactNode> = {
    type: "HTMLBlock",
    render: (node, _children, ctx) => {
        const val = node.value || "";
        return ctx.options.converterOptions?.allowDangerousHtml
            ? React.createElement("div", { dangerouslySetInnerHTML: { __html: val } })
            : React.createElement("code", null, val);
    }
};

export const HTMLInlineHandler: RenderStrategy<ReactNode> = {
    type: "HTMLInline",
    render: (node, _children, ctx) => {
        const val = node.value || "";
        return ctx.options.converterOptions?.allowDangerousHtml
            ? React.createElement("span", { dangerouslySetInnerHTML: { __html: val } })
            : React.createElement("code", null, val);
    }
};

//For footnote
export const FootnoteRefHandler: RenderStrategy<ReactNode> = {
    type: "FootnoteRef",
    render: (node, _children, ctx) => {
        if (!node.id) return null;
        const idx = ctx.footnoteResolver.getUsedRefById(node.id);
        return React.createElement(
            "sup",
            { id: `fnref:${idx}` },
            React.createElement(
                "a",
                { href: `#fn:${idx}`, className: "footnote-ref" },
                `[${idx}]`
            )
        );
    }
};