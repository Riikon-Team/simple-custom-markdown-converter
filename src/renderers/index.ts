import { ASTNode } from "../types/parser";
import { MarkdownOptions } from '../types/options/index'
import { FootnoteResolver } from "../core/resolver/footnote-resolver";
import { RenderStrategy } from "../types/renderer";

export interface IRenderer<TOutput> {
    options: MarkdownOptions<TOutput>
    footnoteResolver: FootnoteResolver
    strategies: Map<string, RenderStrategy<TOutput>>

    render(node: ASTNode): TOutput
    renderTable(node: ASTNode, children: TOutput[]): TOutput
    renderFootnotes(): TOutput
    registerStrategy(strategy: RenderStrategy<TOutput>): void
}
