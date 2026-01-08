import Lexer, { ILexer } from "."
import { Token, TokenizerStrategy } from "../../types/token"
import * as utils from "../../utilities/tokenizer-utils"

const EscapeCharacterHandler: TokenizerStrategy = {
    name: "EscapeCharacter",
    match: (lex) => lex.peek() === "\\" && lex.peek(1) !== undefined,
    emit: (lex) => {
        lex.next(1);
        utils.handleTextBlock(lex)
    }
}

const CommentHandler: TokenizerStrategy = {
    name: "Comment",
    match: (lex) => lex.startsWith("<!--"),
    emit: (lex) => lex.readUntilMatchString("-->", true)
}

const HtmlHandler: TokenizerStrategy = {
    name: "Html",
    match: (lex) => lex.peek() === "<",
    emit: (lex) => {
        //Handle comment
        const line = lex.peekUntil(">");
        const blockRegex = /^<(h[1-6]|div|table|pre|blockquote|ul|ol|li|p|section|article|header|footer|nav|aside|hr|form|iframe)\b/i;
        if (blockRegex.test(line)) {
            utils.handleHtmlBlock(lex)
        } else {
            utils.handleHtmlInline(lex)
        }
    }
}

const HorizontalLineHandler: TokenizerStrategy = {
    name: "HorizontalLine",
    match: (lex) => /^([-*_])\1{2,}$/.test(lex.peekUntil("\n").trim()) && lex.getLastToken()?.type === "NewLine",
    emit: (lex) => {
        lex.next(2) //Skip two first characters, remain will be skiped after loop
        lex.listToken.push({ type: "HorizontalLine" })
    }

}

const CodeBlockHandler: TokenizerStrategy = {
    name: "CodeBlock",
    match: (lex) => lex.startsWith("```"),
    emit: (lex) => {
        let lang = ""
        let content = ""

        lex.next(3)    //Skip open block

        while (!lex.isEndOfFile() && lex.peek() !== "\n") {
            lang += lex.peek()
            lex.next()
        }

        lex.next() //Skip \n
        while (!lex.isEndOfFile() && !lex.startsWith("```")) {
            content += lex.peek()
            lex.next()
        }

        lex.next(2) //Skip close block (due to next() after each tokenize iteration)

        lex.listToken.push({ "type": "CodeBlock", lang: lang.trim(), content: content.trimEnd() })
    }
}

const BoldHandler: TokenizerStrategy = {
    name: "Bold",
    match: (lex) => lex.startsWith("**"),
    emit: (lex) => {
        lex.listToken.push({ type: "Bold" })
        lex.next() //Skip remain *
    }
}

const StrikethroughHandler: TokenizerStrategy = {
    name: "Strikethrough",
    match: (lex) => lex.startsWith("~~"),
    emit: (lex) => {
        lex.listToken.push({ type: "Strikethrough" })
        lex.next() //Skip remain ~
    }
}

// Footnote
const FootnoteDefHandler: TokenizerStrategy = {
    name: "FootnoteDef",
    match: (lex) => lex.isStartOfLine() && /^\[\^[^\]]+\]:/.test(lex.peekUntil("\n")),
    emit: (lex) => {
        const line = lex.readUntil("\n")
        const match = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/)
        if (match) {
            const id = match[1]
            const content = match[2]
            lex.listToken.push({ type: "FootnoteDef", id, content })
        }
    }
}
const FootnoteRefHandler: TokenizerStrategy = {
    name: "FootnoteRef",
    match: (lex) => lex.startsWith("[^"),
    emit: (lex) => {
        lex.next(2) //Skip [^
        const id = lex.readUntil("]")
        lex.listToken.push({ type: "FootnoteRef", id })
    }
}

//List
const TaskListHandler: TokenizerStrategy = {
    name: "TaskList",
    match: (lex) => lex.isStartOfLine() && /^(\s*)([-*+]) \[( |x|X)\] /.test(lex.peekUntil("\n")),
    emit: (lex) => utils.handleList(lex, false, true)
}
const UnorderedListHandler: TokenizerStrategy = {
    name: "UnorderList",
    match: (lex) => lex.isStartOfLine() && /^(\s*)([-*+]) /.test(lex.peekUntil("\n")),
    emit: (lex) => utils.handleList(lex, false, false)
}
const OrderedListHandler: TokenizerStrategy = {
    name: "OrderedList",
    match: (lex) => lex.isStartOfLine() && /^(\s*)(\d+)\. /.test(lex.peekUntil("\n")),
    emit: (lex) => utils.handleList(lex, true, false)
}
const EndListHandler: TokenizerStrategy = {
    name: "EndList",
    match: (lex) => lex.listLevelFlag > 0 && lex.isStartOfLine() && !/^(\s*)([-+*]|\d+\.) /.test(lex.peekUntil("\n")),
    emit: (lex) => {
        while (lex.listLevelFlag > 0) {
            utils.handleEndList(lex)
        }
    }
}

//Table
const TableHandler: TokenizerStrategy = {
    name: "Table",
    match: (lex) => lex.isStartOfLine() && /^\s*\|.*\|\s*$/.test(lex.peekUntil("\n")),
    emit: (lex) => utils.handleTable(lex)
}

//Other common syntax
const InlineCodeHandler: TokenizerStrategy = {
    name: "InlineCode",
    match: (lex) => lex.peek() === "`",
    emit: (lex) => {
        let content = ""
        lex.next() //Skip open block
        while (!lex.isEndOfFile() && !lex.startsWith("`")) {
            content += lex.peek()
            lex.next()
        }

        lex.listToken.push({ "type": "InlineCode", content: content })
    }
}

const HeaderHandler: TokenizerStrategy = {
    name: "Header",
    match: (lex) => lex.peek() === "#",
    emit: (lex) => {
        let level = 0

        while (lex.peek() === "#") {
            level++
            lex.next()
        }

        if (lex.peek() === " ") {
            lex.next()
            lex.pos--
        }

        lex.listToken.push({ type: "Header", level })
    }
}

const ItalicHandler: TokenizerStrategy = {
    name: "Italic",
    match: (lex) => lex.peek() === "*" || lex.peek() === "_",
    emit: (lex) => {
        lex.listToken.push({ type: "Italic" })
    }
}

const QuoteHandler: TokenizerStrategy = {
    name: "Quote",
    match: (lex) => lex.peek() === ">",
    emit: (lex) => {
        lex.listToken.push({ type: "Quote" })
    }
}

const LinkHandler: TokenizerStrategy = {
    name: "Link",
    match: (lex) => lex.peek() === "[",
    emit: (lex) => {
        lex.next() //Skip [
        const text = lex.readUntil("]")
        lex.next() //Skip ]

        if (lex.peek() === "(") {
            lex.next() //Skip (
            const url = lex.readUntil(")")
            //Don't skip ) due to auto skip on while loop
            lex.listToken.push({ type: "Link", text: text, href: url })
        }
        else lex.listToken.push({ type: "Text", value: `[${text}]` })
    }
}

const ImageHandler: TokenizerStrategy = {
    name: "Image",
    match: (lex) => lex.peek() === "!" && lex.peek(1) === "[",
    emit: (lex) => {
        lex.next() //Skip !
        if (lex.peek() !== "[") return

        lex.next() //Skip [
        const alt = lex.readUntil("]")
        lex.next() //Skip ]

        if (lex.peek() === "(") {
            lex.next() //Skip (
            const src = lex.readUntil(")")
            lex.next() //Skip )
            lex.listToken.push({ type: "Image", alt: alt, src: src })
        }
        else lex.listToken.push({ type: "Text", value: `![${alt}]` })
    }
}

const NewLineHandler: TokenizerStrategy = {
    name: "NewLine",
    match: (lex) => lex.peek() === "\n",
    emit: (lex) => {
        lex.listToken.push({ type: "NewLine" })
    }
}


export {
    BoldHandler,
    CodeBlockHandler,
    CommentHandler,
    EndListHandler,
    EscapeCharacterHandler,
    FootnoteDefHandler,
    FootnoteRefHandler,
    HeaderHandler,
    HorizontalLineHandler,
    HtmlHandler,
    ImageHandler,
    InlineCodeHandler,
    ItalicHandler,
    LinkHandler,
    NewLineHandler,
    OrderedListHandler,
    QuoteHandler,
    StrikethroughHandler,
    TableHandler,
    TaskListHandler,
    UnorderedListHandler
}
