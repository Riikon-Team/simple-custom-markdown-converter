import { RenderStrategy } from "../../types/renderer"
import { escapeHtml, getClassName } from "../../utilities/renderer-utils";

//Base structural nodes
export const DocumentHandler: RenderStrategy<string> = {
    type: "Document",
    render: (_node, children, ctx) => children.join("") + ctx.renderFootnotes()
}

export const ParagraphHandler: RenderStrategy<string> = {
    type: "Paragraph",
    render: (node, children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<p${cls ? ` class="${cls}"` : ""}>${children.join("")}</p>`;
    }
}

//Container nodes
export const CodeBlockHandler: RenderStrategy<string> = {
    type: "CodeBlock",
    render: (node, _children, ctx) => {
        const cls = getClassName(ctx, node, `lang-${node.lang}`);
        return `<pre><code${cls ? ` class="${cls}"` : ""}>${escapeHtml(node.content || "")}</code></pre>`;
    }
}

export const HeaderHandler: RenderStrategy<string> = {
    type: "Header",
    render: (node, children, ctx) => {
        if (node.level) {
            const cls = getClassName(ctx, node);
            const classAttr = cls ? ` class="${cls}"` : "";
            const style = node.level <= 2 ? ' style="border-bottom: 1px solid #d1d9e0b3"' : '';
            return `<h${node.level}${classAttr}${style}>${children.join("")}</h${node.level}>`;
        }
        return `<p>${children.join("")}</p>`;
    }
}

export const QuoteHandler: RenderStrategy<string> = {
    type: "Quote",
    render: (node, children, ctx) => {
        const cls = getClassName(ctx, node);
        const classAttr = cls ? ` class="${cls}"` : "";
        return `<blockquote${classAttr} style="margin:0; padding:0 1em; color:#59636e; border-left:.25em solid #d1d9e0;">${children.join("")}</blockquote>`;
    }
}

//For list nodes
export const ListHandler: RenderStrategy<string> = {
    type: "List",
    render: (node, children, ctx) => {
        const cls = getClassName(ctx, node);
        const classAttr = cls ? ` class="${cls}"` : "";
        return node.ordered ? `<ol${classAttr}>${children.join("")}</ol>` : `<ul${classAttr}>${children.join("")}</ul>`;
    }
}

export const ListItemHandler: RenderStrategy<string> = {
    type: "ListItem",
    render: (node, children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<li${cls ? ` class="${cls}"` : ""}>${children.join("")}</li>`;
    }
}

export const TaskItemHandler: RenderStrategy<string> = {
    type: "TaskItem",
    render: (node, children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<li${cls ? ` class="${cls}"` : ""} style="list-style-type: none"><input type="checkbox" disabled ${node.checked ? "checked" : ""}>${children.join("")}</li>`;
    }
}
//Styling nodes
export const BoldHandler: RenderStrategy<string> = {
    type: "Bold",
    render: (node, children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<strong${cls ? ` class="${cls}"` : ""}>${children.join("")}</strong>`;
    }
}

export const ItalicHandler: RenderStrategy<string> = {
    type: "Italic",
    render: (node, children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<em${cls ? ` class="${cls}"` : ""}>${children.join("")}</em>`;
    }
}

export const StrikethroughHandler: RenderStrategy<string> = {
    type: "Strikethrough",
    render: (node, children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<s${cls ? ` class="${cls}"` : ""}>${children.join("")}</s>`;
    }
}

export const InlineCodeHandler: RenderStrategy<string> = {
    type: "InlineCode",
    render: (node, _children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<code${cls ? ` class="${cls}"` : ""}>${escapeHtml(node.content || "")}</code>`;
    }
}

//Media nodes
export const LinkHandler: RenderStrategy<string> = {
    type: "Link",
    render: (node, _children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<a href="${node.href}"${cls ? ` class="${cls}"` : ""} target="_blank" rel="noopener">${node.text}</a>`;
    }
}

export const ImageHandler: RenderStrategy<string> = {
    type: "Image",
    render: (node, _children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<img src="${node.src || ""}" alt="${node.alt || ""}"${cls ? ` class="${cls}"` : ""}/>`;
    }
}

//Leaf nodes
export const HorizontalLineHandler: RenderStrategy<string> = {
    type: "HorizontalLine",
    render: (node, _children, ctx) => {
        const cls = getClassName(ctx, node);
        return `<hr${cls ? ` class="${cls}"` : ""}>`;
    }
}

export const TextHandler: RenderStrategy<string> = {
    type: "Text",
    render: (node) => node.value || ""
}

//Table nodes
export const TableHandler: RenderStrategy<string> = {
    type: "Table",
    render: (node, children, ctx) => ctx.renderTable(node, children)
}

//For HTML
export const HTMLBlockHandler: RenderStrategy<string> = {
    type: "HTMLBlock",
    render: (node, _children, ctx) => {
        const val = node.value || "";
        const cls = getClassName(ctx, node);
        const content = ctx.options.converterOptions?.allowDangerousHtml ? val : escapeHtml(val);
        return cls ? `<div${cls ? ` class="${cls}"` : ""}>${content}</div>` : content;
    }
}

export const HTMLInlineHandler: RenderStrategy<string> = {
    type: "HTMLInline",
    render: (node, _children, ctx) => {
        const val = node.value || "";
        const cls = getClassName(ctx, node);
        const content = ctx.options.converterOptions?.allowDangerousHtml ? val : escapeHtml(val);
        return cls ? `<span${cls ? ` class="${cls}"` : ""}>${content}</span>` : content;
    }
}

//For footnote
export const FootnoteRefHandler: RenderStrategy<string> = {
    type: "FootnoteRef",
    render: (node, _children, ctx) => {
        if (node.id) {
            const idx = ctx.footnoteResolver.getUsedRefById(node.id);
            const cls = getClassName(ctx, node, "footnote-ref");
            return `<sup id="fnref:${idx}"><a href="#fn:${idx}"${cls ? ` class="${cls}"` : ""}>[${idx}]</a></sup>`;
        }
        return ""
    }
}