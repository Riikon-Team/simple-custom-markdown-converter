import { IRenderer } from "..";
import { MarkdownOptions } from "../../types/options";
import { ASTNode, TableRow } from "../../types/parser";
import { RenderStrategy } from "../../types/renderer";
import { FootnoteResolver } from "../../core/resolver/footnote-resolver";
import * as Handlers from "./handler";

export class DefaultRenderer implements IRenderer<string> {
    options: MarkdownOptions<string>
    footnoteResolver: FootnoteResolver

    private strategies: Map<string, RenderStrategy<string>> = new Map()

    constructor(footnoteResolver: FootnoteResolver, options: MarkdownOptions<string> = {}) {
        this.footnoteResolver = footnoteResolver;
        this.options = options;
        this.registerDefaultStrategies();
    }

    private registerDefaultStrategies() {
        const listDefaultStrategy = [
            Handlers.DocumentHandler,
            Handlers.ParagraphHandler,
            Handlers.HeaderHandler,
            Handlers.CodeBlockHandler,
            Handlers.QuoteHandler,
            Handlers.BoldHandler,
            Handlers.ItalicHandler,
            Handlers.StrikethroughHandler,
            Handlers.InlineCodeHandler,
            Handlers.LinkHandler,
            Handlers.ImageHandler,
            Handlers.ListHandler,
            Handlers.ListItemHandler,
            Handlers.TaskItemHandler,
            Handlers.TableHandler,
            Handlers.TextHandler,
            Handlers.HorizontalLineHandler,
            Handlers.HTMLBlockHandler,
            Handlers.HTMLInlineHandler,
            Handlers.FootnoteRefHandler
        ];
        listDefaultStrategy.forEach(s => this.strategies.set(s.type, s));
    }

    render(node: ASTNode): string {
        const userRenderer = this.options.renderOptions?.elements?.[node.type]
        const children = (node.children || []).map(child => this.render(child))
        if (userRenderer) {
            return (userRenderer as (n: ASTNode, c: string[]) => string)(node, children)
        }

        const strategy = this.strategies.get(node.type)
        if (strategy) {
            return strategy.render(node, children, this)
        }
        return children.join("")
    }

    renderFootnotes(): string {
        if (this.footnoteResolver.isResolverValid()) {
            const used = this.footnoteResolver.getUsedRef()
            if (used.length === 0) return ""

            const items = used.map((id, i) => {
                const def = this.footnoteResolver.getDef(id) ?? ""
                const idx = i + 1
                return `<li id="fn:${idx}"><p>${def} <a href="#fnref:${idx}" class="footnote-backref">↩</a></p></li>`
            })

            return `<section class="footnotes"><ol>${items.join("")}</ol></section>`
        }
        else return ""
    }

    renderTable(node: ASTNode, children: string[]): string {
        if (node.type === "Table" && node.rows) {
            const header = node.rows.filter(row => row.isHeader)
            const body = node.rows.filter(row => !row.isHeader)

            const renderRows = (row: TableRow) => {
                const tag = row.isHeader ? "th" : "td"
                const cells = row.cells.map(cell => {
                    const align = `style="text-align:${cell.align}"`
                    return `<${tag} ${align}>${cell.children.map(c => this.render(c)).join("")}</${tag}>`
                }).join("")

                return `<tr>${cells}</tr>`
            }

            const tHead = header.length ? `<thead>${header.map(renderRows).join("")}</thead>` : ""
            const tBody = body.length ? `<tbody>${body.map(renderRows).join("")}</tbody>` : ""

            return `<table>${tHead}${tBody}</table>`
        }
        else return `<p>${children.join("\n")}</p>`
    }
}