import { ASTNode, ParsingStrategy } from '../../types/parser'
import { Token } from '../../types/token'
import { FootnoteResolver } from '../resolver/footnote-resolver'
import * as Handler from './handler'

export interface IParser {
    listToken: Token[]
    pos: number
    inlineStrategies: Map<string, ParsingStrategy>
    blockStrategies: Map<string, ParsingStrategy>
    footNoteResolver: FootnoteResolver

    peek(offset: number): Token | null
    next(amount: number): void
    isEnd(): boolean
    parseBlocks(): ASTNode[]
    parseInlineUntil(stopType: Token["type"] | Token["type"][], isConsumeStopToken: boolean): ASTNode[]
    registerStrategy(strategy: ParsingStrategy, type: "block" | "inline"): void
}

export class Parser implements IParser {
    listToken: Token[]
    pos: number = 0
    footNoteResolver: FootnoteResolver

    inlineStrategies: Map<string, ParsingStrategy>
    blockStrategies: Map<string, ParsingStrategy>

    constructor(listToken: Token[], footNoteResolver: FootnoteResolver, plugin: { type: 'block' | 'inline', strategy: ParsingStrategy }[] = []) {
        this.listToken = listToken
        this.footNoteResolver = footNoteResolver

        this.blockStrategies = new Map(
            [
                Handler.HeaderHandler,
                Handler.CodeBlockHandler,
                Handler.QuoteHandler,
                Handler.ImageHandler,
                Handler.HorizontalLineHandler,
                Handler.ListHandler,
                Handler.TableHandler,
                Handler.HtmlBlockHandler,
                Handler.FootnoteDefHandler,
                Handler.NewLineHandler
            ].map(ele => [ele.type, ele])
        )

        this.inlineStrategies = new Map(
            [
                Handler.BoldHandler,
                Handler.ItalicHandler,
                Handler.StrikethroughHandler,
                Handler.InlineHandler,
                Handler.LinkHandler,
                Handler.HtmlInlineHandler,
                Handler.FootnoteRefHandler,
            ].map(ele => [ele.type, ele])
        )

        if (plugin.length > 0) plugin.forEach(p => this.registerStrategy(p.strategy, p.type))
    }

    peek(offset: number = 0): Token | null {
        const i = this.pos + offset
        return i < this.listToken.length ? this.listToken[i] : null
    }

    next(amount: number = 1): void {
        this.pos += amount
    }

    isEnd(): boolean {
        return this.peek()?.type === "EOF"
    }

    registerStrategy(strategy: ParsingStrategy, type: 'block' | 'inline'): void {
        if (type === "block") {
            this.blockStrategies.set(strategy.type, strategy)
        }
        else this.inlineStrategies.set(strategy.type, strategy)
    }

    /**
         * Parse a list token to a node
         * @return A parsed abstract syntax tree (AST)
         */
    parse(): ASTNode {
        return {
            type: "Document",
            children: this.parseBlocks()
        }
    }

    parseBlocks(): ASTNode[] {
        const listNode: ASTNode[] = []

        while (!this.isEnd()) {
            const token = this.peek()
            if (!token) break

            const strategy = this.blockStrategies.get(token?.type || "")

            if (strategy) {
                const result = strategy.execute(this, token!)
                if (result) listNode.push(result as ASTNode)
            }
            else {
                //Fallback to Paragraph node
                const pNode = this.parseParagraph()
                if (pNode.children && pNode.children.length > 0) {
                    listNode.push(pNode)
                }
                else {
                    this.next()
                }
            }
        }
        return listNode
    }

    parseInlineUntil(stopType: Token["type"] | Token["type"][], isConsumeStopToken = false): ASTNode[] {
        const stop = Array.isArray(stopType) ? stopType : [stopType]
        const nodes: ASTNode[] = []

        while (!this.isEnd()) {
            const currentNode = this.peek()
            if (!currentNode || stop.includes(currentNode.type)) break

            if (this.blockStrategies.get(currentNode.type)) {
                break;
            }

            const strategy = this.inlineStrategies.get(currentNode.type)

            if (strategy) {
                const result = strategy.execute(this, currentNode)
                if (result) nodes.push(result as ASTNode)
            }
            else {
                //Fallback to Text node
                nodes.push(this.parseText(currentNode))
                this.next()
            }
        }
        if (isConsumeStopToken) this.next(); //Skip stop token
        return nodes;
    }

    private parseParagraph(): ASTNode {
        return {
            type: "Paragraph",
            children: this.parseInlineUntil("NewLine", true)
        }
    }

    private parseText(currentNode: Token): ASTNode {
        return {
            type: "Text",
            value: currentNode.value || ""
        }
    }

}

