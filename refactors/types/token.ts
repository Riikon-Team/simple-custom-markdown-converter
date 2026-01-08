import { ILexer } from "../core/lexer";

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

export interface Token {
    type: TokenType;
    [key: string]: any;
}

export interface TokenizerStrategy {
    name: string
    match: (lex: ILexer) => boolean
    emit: (lex: ILexer) => void
}