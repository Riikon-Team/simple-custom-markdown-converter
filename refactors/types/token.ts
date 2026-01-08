import { ILexer } from "../core/lexer";

export interface Token {
    type: string;
    [key: string]: any;
}

export interface TokenizerStrategy {
    name: string
    match: (lex: ILexer) => boolean
    emit: (lex: ILexer) => void
}