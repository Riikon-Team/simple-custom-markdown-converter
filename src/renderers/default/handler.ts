import { RenderStrategy } from "../../types/renderer"

//Base structural nodes
export const DocumentHandler: RenderStrategy<string> = {
    type: "Document",
    render: (_node, children, ctx) => children.join("") + ctx.renderFootnotes()
}

export const ParagraphHandler: RenderStrategy<string> = {
    type: "Paragraph",
    render: (_node, children) => `<p>${children.join("")}</p>`
}

//Container nodes
export const CodeBlockHandler: RenderStrategy<string> = {
    type: "CodeBlock",
    render: (node) => `<pre><code class="lang-${node.lang}">${escapeHtml(node.content || "")}</code></pre>`,
}

export const HeaderHandler: RenderStrategy<string> = {
    type: "Header",
    render: (node, children) => {
        if (node.level) {
            const style = node.level <= 2 ? ' style="border-bottom: 1px solid #d1d9e0b3"' : ''
            return `<h${node.level}${style}>${children.join("")}</h${node.level}>`
        }
        return `<p>${children.join("")}</p>`
    }
}

export const QuoteHandler: RenderStrategy<string> = {
    type: "Quote",
    render: (_node, children) =>
        `<blockquote style="margin:0; padding:0 1em; color:#59636e; border-left:.25em solid #d1d9e0;">${children.join("")}</blockquote>`
}

//For list nodes
export const ListHandler: RenderStrategy<string> = {
    type: "List",
    render: (node, children) =>
        node.ordered ? `<ol>${children.join("")}</ol>` : `<ul>${children.join("")}</ul>`
}

export const ListItemHandler: RenderStrategy<string> = {
    type: "ListItem",
    render: (_node, children) => `<li>${children.join("")}</li>`
}

export const TaskItemHandler: RenderStrategy<string> = {
    type: "TaskItem",
    render: (node, children) =>
        `<li><input type="checkbox" disabled ${node.checked ? "checked" : ""}>${children.join("")}</li>`
}

//Styling nodes
export const BoldHandler: RenderStrategy<string> = {
    type: "Bold",
    render: (_node, children) => `<strong>${children.join("")}</strong>`
}

export const ItalicHandler: RenderStrategy<string> = {
    type: "Italic",
    render: (_node, children) => `<em>${children.join("")}</em>`
}

export const StrikethroughHandler: RenderStrategy<string> = {
    type: "Strikethrough",
    render: (_node, children) => `<s>${children.join("")}</s>`
}

export const InlineCodeHandler: RenderStrategy<string> = {
    type: "InlineCode",
    render: (node, _children) => `<code>${escapeHtml(node.content || "")}</code>`
}

//Media nodes
export const LinkHandler: RenderStrategy<string> = {
    type: "Link",
    render: (node) => `<a href="${node.href}">${node.text}</a>`
}

export const ImageHandler: RenderStrategy<string> = {
    type: "Image",
    render: (node) => `<img src="${node.src || ""}" alt="${node.alt || ""}"/>`
}

//Leaf nodes
export const HorizontalLineHandler: RenderStrategy<string> = {
    type: "HorizontalLine",
    render: () => `<hr>`
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
        const val = node.value || ""
        return ctx.options.converterOptions?.allowDangerousHtml ? val : escapeHtml(val)
    }
}

export const HTMLInlineHandler: RenderStrategy<string> = {
    type: "HTMLInline",
    render: (node, _children, ctx) => {
        const val = node.value || ""
        return ctx.options.converterOptions?.allowDangerousHtml ? val : escapeHtml(val)
    }
}

//For footnote
export const FootnoteRefHandler: RenderStrategy<string> = {
    type: "FootnoteRef",
    render: (node, _children, ctx) => {
        if (node.id) {
            const idx = ctx.footnoteResolver.getUsedRefById(node.id)
            return `<sup id="fnref:${idx}"><a href="#fn:${idx}" class="footnote-ref">[${idx}]</a></sup>`
        }
        return ""
    }
}



//Utilities
function escapeHtml(str: string) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
