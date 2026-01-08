import { Token, TokenizerStrategy } from "../../types/token"
import * as Handlers from "./tokenizer"
import * as utils from "../../utilities/tokenizer-utils"

export interface ILexer {
    pos: number
    input: string
    listToken: Token[]
    listLevelFlag: number

    peek(offset?: number): string | null
    next(amount?: number): void
    startsWith(str: string): boolean
    readUntil(char: string, isConsume?: boolean): string
    readUntilMatchString(str: string, isConsume: boolean): string
    peekUntil(char: string): string
    peekUntilByOffset(offset: number): string
    isEndOfFile(): boolean
    isStartOfLine(): boolean
    getLastToken(): Token
}

export default class Lexer implements ILexer {
    input: string
    pos: number = 0
    listToken: Token[] = []

    // Flag for handle special syntax
    listLevelFlag: number = 0

    private strategies: TokenizerStrategy[];

    constructor(input: string) {
        this.input = input

        this.strategies = [
            Handlers.EscapeCharacterHandler,
            Handlers.CommentHandler,
            Handlers.HtmlHandler,
            Handlers.HorizontalLineHandler,
            Handlers.CodeBlockHandler,
            Handlers.BoldHandler,
            Handlers.StrikethroughHandler,
            Handlers.FootnoteDefHandler,
            Handlers.FootnoteRefHandler,
            Handlers.TaskListHandler,
            Handlers.UnorderedListHandler,
            Handlers.OrderedListHandler,
            Handlers.EndListHandler,
            Handlers.TableHandler,
            Handlers.InlineCodeHandler,
            Handlers.HeaderHandler,
            Handlers.ItalicHandler,
            Handlers.QuoteHandler,
            Handlers.LinkHandler,
            Handlers.ImageHandler,
            Handlers.NewLineHandler,
        ];
    }

    //Reset input and other attribute
    setInput(input: string) {
        this.input = input
        this.pos = 0
        this.listLevelFlag = 0
        this.listToken = []
    }


    //Get current character with offset
    peek(offset: number = 0) {
        const i = this.pos + offset
        return i < this.input.length ? this.input[i] : null
    }

    //Move cursor by amount
    next(amount: number = 1) {
        this.pos += amount
    }

    //If current cursor startsWith given str
    startsWith(str: string): boolean {
        return this.input.slice(this.pos, this.pos + str.length) === str
    }

    isEndOfFile(): boolean {
        return this.pos >= this.input.length
    }

    getLastToken(): Token {
        return this.listToken[this.listToken.length - 1]
    }

    readUntil(char: string, isConsumeChar = false): string {
        let result = ""
        while (this.peek() !== char) {
            result += this.peek()
            this.next()
            if (this.isEndOfFile()) break
        }
        if (isConsumeChar) this.next(char.length) //Make cursor skip the char
        return result
    }

    peekUntil(char: string): string {
        let result = ""
        let i = 0
        while (true) {
            const current = this.peek(i++)
            if (current == null) break
            if (current == char) break
            result += current
        }
        return result
    }

    peekUntilByOffset(offset: number): string {
        let result = ""
        let i = 0
        while (i !== offset) {
            const current = this.peek(i++)
            if (current == null) break
            if (this.isEndOfFile()) break
            result += current
        }
        return result
    }

    isStartOfLine(): boolean {
        return this.pos === 0 || this.peek(-1) === "\n"
    }

    readUntilMatchString(str: string, isConsume = false): string {
        let result = "";

        while (!this.isEndOfFile()) {
            if (this.peekUntilByOffset(str.length) === str) {
                if (isConsume) this.next(str.length);
                break;
            }
            result += this.peek();
            this.next();
        }

        return result;
    }

    /**
     * Tokenize the markdown into a list of tokens.
     * @param isEof - `True` when input is whole markdown, `False` if input is just a part of markdown.
     * @returns List of tokens
     */
    tokenize(isEof = true): Token[] {
        while (!this.isEndOfFile()) {
            let matched = false
            for (const strategy of this.strategies) {
                if (strategy.match(this)) {
                    strategy.emit(this)
                    matched = true
                    break
                }
            }
            if (!matched) {
                utils.handleTextBlock(this)
            }
            this.next()
        }

        while (this.listLevelFlag > 0) {
            utils.handleEndList(this)
        }

        if (isEof) this.listToken.push({ type: "EOF" })
        return this.listToken
    }
}