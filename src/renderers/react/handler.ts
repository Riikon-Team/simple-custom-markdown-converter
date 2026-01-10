import React, { ReactNode } from "react";
import { RenderStrategy } from "../../types/renderer";
import { getClassName } from "../../utilities/renderer-utils";

//Base structural nodes
export const DocumentHandler: RenderStrategy<ReactNode> = {
    type: "Document",
    render: (node, children, ctx) => React.createElement(
        React.Fragment,
        null,
        ...children,
        ctx.renderFootnotes()
    )
};

export const ParagraphHandler: RenderStrategy<ReactNode> = {
    type: "Paragraph",
    render: (node, children, ctx) => React.createElement(
        "p",
        { className: getClassName(ctx, node) },
        ...children
    )
};

//Container nodes
export const CodeBlockHandler: RenderStrategy<ReactNode> = {
    type: "CodeBlock",
    render: (node, _children, ctx) => React.createElement(
        "pre",
        null,
        React.createElement(
            "code",
            { className: getClassName(ctx, node, `lang-${node.lang}`) },
            node.content || ""
        )
    )
};

export const HeaderHandler: RenderStrategy<ReactNode> = {
    type: "Header",
    render: (node, children, ctx) => {
        if (!node.level) return React.createElement("p", null, ...children);
        return React.createElement(
            `h${node.level}`,
            {
                className: getClassName(ctx, node),
                style: { borderBottom: node.level <= 2 ? "1px solid #d1d9e0b3" : undefined }
            },
            ...children
        );
    }
};

export const QuoteHandler: RenderStrategy<ReactNode> = {
    type: "Quote",
    render: (node, children, ctx) => React.createElement(
        "blockquote",
        {
            className: getClassName(ctx, node),
            style: { margin: "0", padding: "0 1em", color: "#59636e", borderLeft: ".25em solid #d1d9e0" }
        },
        ...children
    )
};

//For list nodes
export const ListHandler: RenderStrategy<ReactNode> = {
    type: "List",
    render: (node, children, ctx) => React.createElement(
        node.ordered ? "ol" : "ul",
        { className: getClassName(ctx, node), },
        ...children
    )
};

export const ListItemHandler: RenderStrategy<ReactNode> = {
    type: "ListItem",
    render: (node, children, ctx) => React.createElement("li", { className: getClassName(ctx, node), }, ...children)
};

export const TaskItemHandler: RenderStrategy<ReactNode> = {
    type: "TaskItem",
    render: (node, children, ctx) => React.createElement(
        "li",
        {
            className: getClassName(ctx, node),
            style: { listStyleType: "none" }
        },
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
    render: (node, children, ctx) => React.createElement("strong", { className: getClassName(ctx, node), }, ...children)
};

export const ItalicHandler: RenderStrategy<ReactNode> = {
    type: "Italic",
    render: (node, children, ctx) => React.createElement("em", { className: getClassName(ctx, node), }, ...children)
};

export const StrikethroughHandler: RenderStrategy<ReactNode> = {
    type: "Strikethrough",
    render: (node, children, ctx) => React.createElement("s", { className: getClassName(ctx, node), }, ...children)
};

export const InlineCodeHandler: RenderStrategy<ReactNode> = {
    type: "InlineCode",
    render: (node, _children, ctx) => React.createElement("code", { className: getClassName(ctx, node), }, node.content || "")
};

//Media nodes
export const LinkHandler: RenderStrategy<ReactNode> = {
    type: "Link",
    render: (node, _children, ctx) => React.createElement(
        "a",
        {
            className: getClassName(ctx, node),
            href: node.href, target: "_blank", rel: "noopener"
        },
        node.text
    )
};

export const ImageHandler: RenderStrategy<ReactNode> = {
    type: "Image",
    render: (node, _children, ctx) => React.createElement("img", {
        className: getClassName(ctx, node),
        src: node.src || "",
        alt: node.alt || ""
    })
};

//Leaf nodes
export const HorizontalLineHandler: RenderStrategy<ReactNode> = {
    type: "HorizontalLine",
    render: (node, _children, ctx) => React.createElement("hr", { className: getClassName(ctx, node), })
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
            ? React.createElement("div", { className: getClassName(ctx, node), dangerouslySetInnerHTML: { __html: val } })
            : React.createElement("code", { className: getClassName(ctx, node), }, val);
    }
};

export const HTMLInlineHandler: RenderStrategy<ReactNode> = {
    type: "HTMLInline",
    render: (node, _children, ctx) => {
        const val = node.value || "";
        return ctx.options.converterOptions?.allowDangerousHtml
            ? React.createElement("span", { className: getClassName(ctx, node), dangerouslySetInnerHTML: { __html: val } })
            : React.createElement("code", { className: getClassName(ctx, node), }, val);
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
                {
                    className: getClassName(ctx, node, "footnote-ref"),
                    href: `#fn:${idx}`,
                },
                `[${idx}]`
            )
        );
    }
};