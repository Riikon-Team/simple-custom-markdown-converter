import { ILexer, Lexer } from "./core/lexer"
import { IParser, Parser } from "./core/parser"
import { IRenderer } from "./renderers/index"
import { DefaultRenderer } from "./renderers/default"
import { MarkdownOptions } from "./types/options"
import { Token, TokenizerStrategy } from './types/token'
import { ASTNode, ParsingStrategy } from './types/parser'
import { RenderStrategy } from './types/renderer'
import { MarkdownPlugin } from "./types/plugin"
import { BaseConverter } from "./types/converter"

export {
    MarkdownOptions,
    Token, TokenizerStrategy,
    ILexer, IParser, IRenderer,
    Lexer, Parser, DefaultRenderer,
    ASTNode, ParsingStrategy,
    RenderStrategy,
    MarkdownPlugin,
}

/**
 * Convert a Markdown string into HTML.
 * @param input - The Markdown source string
 * @param options - Optional rendering options
 * @returns The rendered HTML string
 * 
 * @example
 * ```ts
 * const html = convertMarkdownToHTML("Hello **world**")
 * // => <p>Hello <strong>world</strong></p>
 * ```
 */
export function convertMarkdownToHTML(
    input: string,
    options: MarkdownOptions<string> = {
        renderOptions: {},
        converterOptions: { allowDangerousHtml: false }
    },
    plugin: MarkdownPlugin<string>[] = []
): string {
    return new DefaultMarkdownConverter(options, plugin).convert(input)
}

export class DefaultMarkdownConverter extends BaseConverter<string> {
    constructor(
        options: MarkdownOptions<string> = {
            renderOptions: {},
            converterOptions: { allowDangerousHtml: false }
        },
        plugin: MarkdownPlugin<string>[] = []
    ) {
        super(options, plugin)
    }

    convert(input: string): string {
        const tokens = this.getTokens(input)
        const nodes = this.getNodes(tokens)
        const renderer = new DefaultRenderer(
            this.footnoteResolver,
            this.options,
            this.plugin.map(p => p.renderer)
        )
        return renderer.render(nodes)
    }
}

