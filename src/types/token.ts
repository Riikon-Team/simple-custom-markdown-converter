import { ILexer } from "../core/lexer";

/**
 * Token produced by the Markdown lexer.
 *
 * Each token represents the smallest meaningful unit of Markdown syntax
 * before being parsed into the AST.
 *
 * Variants:
 * - Header: Markdown header (`#`), with a `level` (1–6).
 * - CodeBlock: Fenced code block (` ``` `), with optional `lang` and its `content`.
 * - NewLine: Line break (`\n`).
 * - Bold: Bold marker (`**`).
 * - Italic: Italic marker (`*` or `_`).
 * - Strikethrough: Strikethrough marker (`~~`)
 * - InlineCode: Inline code snippet (`` ` ``), with its `content`.
 * - Quote: A quote block (`>`).
 * - ListStart: Start a list
 * - ListItem: A list's item (`* ` or `+ ` or `- ` or `number with dot`)
 * - TaskItem: A task item in a list (`- [ ]` or `- [x]`)
 * - ListEnd: End a list
 * - Link: A link (`[text](url)`)
 * - Image: An image (`![alt](url)`)
 * - HorizontalLine: A horizontal line (`---` or `___` or `***`)
 * - Text: Plain text content.
 * - TableStart: Start of a table
 * - TableEnd: End of a table
 * - RowStart: Start of a table row
 * - RowEnd: End of a table row
 * - CellStart: Start of a table cell, with it's align accroding to it's row
 * - CellEnd: End of a table cell
 * - HTMLBlock: A HTML block element
 * - HTMLInline: An inline HTML element
 * - FootnodeDef: Definition of a footnote
 * - FootnodeRef: The reference of a footnote
 * - EOF: A special token, this is the end of input.
 */
export type DefaultTokenType =
    | "Header"
    | "CodeBlock"
    | "NewLine"
    | "Bold"
    | "Italic"
    | "Strikethrough"
    | "InlineCode"
    | "Quote"
    | "ListStart"
    | "ListItem"
    | "TaskItem"
    | "ListEnd"
    | "Link"
    | "Image"
    | "HorizontalLine"
    | "Text"
    | "TableStart"
    | "TableEnd"
    | "RowStart"
    | "RowEnd"
    | "CellStart"
    | "CellEnd"
    | "HTMLBlock"
    | "HTMLInline"
    | "FootnoteDef"
    | "FootnoteRef"
    | "EOF";

export type TokenType = DefaultTokenType | (string & {})


/**
 * Token produced by the Markdown lexer. 
 * 
 * Tokens are the intermediate representation between raw text and the AST.
 */
export interface Token {
    /**
     * The category of the token.
     * @see {@link DefaultTokenType} for the list of built-in types.
     */
    type: TokenType;

    /**
     * Raw text or value associated with the token.
     * Commonly used in: `Text`, `HTMLBlock`, `HTMLInline`.
     */
    value?: string;

    /**
     * The nesting level or importance.
     * Commonly used in: `Header` (level 1-6).
     */
    level?: number;

    /**
     * Language identifier for code fences.
     * Commonly used in: `CodeBlock`.
     */
    lang?: string;

    /**
     * The main body of text within a token.
     * Commonly used in: `CodeBlock`, `InlineCode`.
     */
    content?: string;

    /**
     * Destination URL for links or images.
     * Commonly used in: `Link`, `Image`.
     */
    href?: string;

    /**
     * Display text for links.
     * Commonly used in: `Link`.
     */
    text?: string;

    /**
     * Source path/URL for images.
     * Commonly used in: `Image`.
     */
    src?: string;

    /**
     * Accessible alternative text.
     * Commonly used in: `Image`.
     */
    alt?: string;

    /**
     * Alignment for table cells.
     * Commonly used in: `CellStart` ("left", "center", "right").
     */
    align?: "left" | "center" | "right";

    /**
     * For task lists, indicates completion.
     * Commonly used in: `TaskItem` (true if `[x]`).
     */
    checked?: boolean;

    /**
     * Unique identifier for footnotes.
     * Commonly used in: `FootnoteDef`, `FootnoteRef`.
     */
    id?: string;

    /**
     * All other properties used by custom `Token`.
     */
    [key: string]: any;
}

/**
 * A Strategy pattern for handle tokenizing input.
 * @property type - Strategy's type.
 * @property match - A function check current cursor position matched the syntax to be processed by `emit` function.
 * @property emit - A function handle tokenizing input to `Token`.
 */
export interface TokenizerStrategy {
    type: string
    /**
     * Checks if the current cursor position in the Lexer matches this syntax
     * @param lex The current `ILexer` instance providing access to the input string and cursor.
     * @returns True if this strategy should handle the current input.
     */
    match: (lex: ILexer) => boolean
    /**
     * Consumes the input and produce Tokens added in ILexer implementation class.
     * @param lex The `ILexer` instance to advance the cursor and store results.
     */
    emit: (lex: ILexer) => void
}