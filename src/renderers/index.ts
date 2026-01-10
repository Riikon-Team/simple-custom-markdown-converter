import { ASTNode } from "../types/parser";
import { MarkdownOptions } from '../types/options/index'
import { FootnoteResolver } from "../core/resolver/footnote-resolver";

export interface IRenderer<TOutput> {
    options: MarkdownOptions<TOutput>
    footnoteResolver: FootnoteResolver

    render(node: ASTNode): TOutput
    renderTable(node: ASTNode, children: TOutput[]): TOutput
    renderFootnotes(): TOutput
}
