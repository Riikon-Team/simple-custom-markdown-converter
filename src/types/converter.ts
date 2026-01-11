import Lexer from "../core/lexer";
import { Parser } from "../core/parser";
import { FootnoteResolver } from "../core/resolver/footnote-resolver";
import { MarkdownOptions } from "./options";
import { ASTNode } from "./parser";
import { MarkdownPlugin } from "./plugin";
import { Token } from "./token";

export abstract class BaseConverter<TOutput> {
    protected footnoteResolver: FootnoteResolver

    constructor(
        protected options: MarkdownOptions<TOutput>,
        protected plugin: MarkdownPlugin<TOutput>[]
    ) {
        this.footnoteResolver = new FootnoteResolver()
    }

    protected getTokens(input: string): Token[] {
        return new Lexer(input, this.plugin.map(p => p.tokenizer)).tokenize()
    }

    protected getNodes(tokens: Token[]): ASTNode {
        return new Parser(
            tokens,
            this.footnoteResolver,
            this.plugin.map(p => ({
                type: p.type,
                strategy: p.parser
            }))
        ).parse()
    }

    abstract convert(input: string): TOutput
}