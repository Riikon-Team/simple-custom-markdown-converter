import { ParsingStrategy, TableCell, TableRow } from "../../types/parser";
import * as utils from '../../utilities/parser-utils'

const CodeBlockHandler: ParsingStrategy = {
    type: "CodeBlock",
    execute: (parser, _token) => {
        const tok = parser.peek(0)
        parser.next(1)
        return {
            type: "CodeBlock",
            lang: tok?.type === "CodeBlock" ? tok.lang : "",
            content: tok?.type === "CodeBlock" ? tok.content : ""
        }
    }
}

const HeaderHandler: ParsingStrategy = {
    type: "Header",
    execute: (parser, _token) => {
        const currentNode = parser.peek(0)
        parser.next(1)
        return {
            type: "Header",
            level: currentNode?.type === "Header" ? currentNode.level : 1,
            children: parser.parseInlineUntil("NewLine", true) //Temp
        }
    },
}

const BoldHandler: ParsingStrategy = {
    type: "Bold",
    execute: (parser, _token) => {
        parser.next(1) // skip marker
        return { type: "Bold", children: parser.parseInlineUntil("Bold", true) }
    },
}

const ItalicHandler: ParsingStrategy = {
    type: "Italic",
    execute: (parser, _token) => {
        parser.next(1) // skip marker
        return { type: "Italic", children: parser.parseInlineUntil("Italic", true) }
    },
}

const StrikethroughHandler: ParsingStrategy = {
    type: "Strikethrough",
    execute: (parser, _token) => {
        parser.next(1) // skip marker
        return { type: "Strikethrough", children: parser.parseInlineUntil("Strikethrough", true) }
    },
}

const InlineHandler: ParsingStrategy = {
    type: "InlineCode",
    execute: (parser, _token) => {
        const tok = parser.peek(0)
        parser.next(1)
        return {
            type: "InlineCode",
            content: tok?.type === "InlineCode" ? tok.content : ""
        }
    },
}

const QuoteHandler: ParsingStrategy = {
    type: "Quote",
    execute: (parser, _token) => {
        parser.next(1) //skip marker
        return { type: "Quote", children: [{ type: "Paragraph", children: parser.parseInlineUntil("NewLine", true) }] }
    },
}

const ListHandler: ParsingStrategy = {
    type: "ListStart",
    execute: (parser, _token) => utils.parseList(parser)
}

const LinkHandler: ParsingStrategy = {
    type: "Link",
    execute: (parser, _token) => {
        const tok = parser.peek(0)
        parser.next(1)
        if (tok?.type === "Link") {
            return {
                type: "Link",
                href: tok.href,
                text: tok.text
            }
        }
        return { type: "Link", href: "", text: "" }
    },
}

const ImageHandler: ParsingStrategy = {
    type: "Image",
    execute: (parser, _token) => {
        const tok = parser.peek(0)
        parser.next(1)
        if (tok?.type === "Image") {
            return {
                type: "Image",
                src: tok.src,
                alt: tok.alt
            }
        }
        else return { type: "Image", src: "", alt: "" }
    },
}

const TableHandler: ParsingStrategy = {
    type: "TableStart",
    execute: (parser, _token) => {
        parser.next(1) // skip TableStart token
        const parseRow = (): TableRow => {
            const rowStartToken = parser.peek(0)
            if (rowStartToken?.type !== "RowStart") return { isHeader: false, cells: [] }

            parser.next(1) // skip RowStart token
            const cells: TableCell[] = []
            while (parser.peek(0) && parser.peek(0)!.type !== "RowEnd") {
                cells.push(parseCell())
            }
            parser.next(1) // skip RowEnd token
            return {
                isHeader: rowStartToken.isHeader,
                cells: cells
            }
        }

        const parseCell = (): TableCell => {
            const cellStartToken = parser.peek(0)
            if (cellStartToken?.type !== "CellStart") {
                return { align: "left", children: [] }
            }
            parser.next(1) // skip CellStart token
            const childrens = parser.parseInlineUntil("CellEnd", true)
            return {
                align: cellStartToken.align || "left",
                children: childrens
            }
        }

        const rows: TableRow[] = []
        while (parser.peek(0)?.type !== "TableEnd") {
            rows.push(parseRow())
            if (parser.isEnd()) break
        }
        parser.next(1)
        return {
            type: "Table",
            rows: rows
        }
    },
}

const HtmlBlockHandler: ParsingStrategy = {
    type: "HTMLBlock",
    execute: (parser, _token) => {
        const tok = parser.peek(0)
        parser.next(1) // skip marker
        if (tok?.type === "HTMLBlock") {
            return { type: "HTMLBlock", value: tok.value }
        }
        else return { type: "Text", value: "" }
    },
}

const HtmlInlineHandler: ParsingStrategy = {
    type: "HTMLInline",
    execute: (parser, _token) => {
        const tok = parser.peek(0)
        parser.next(1) // skip marker
        if (tok?.type === "HTMLInline") {
            return { type: "HTMLInline", value: tok.value }
        }
        else return { type: "Text", value: "" }
    },
}

const HorizontalLineHandler: ParsingStrategy = {
    type: "HorizontalLine",
    execute: (parser, _token) => {
        parser.next(1) // skip marker
        return { type: "HorizontalLine" }
    },
}

const FootnoteDefHandler: ParsingStrategy = {
    type: "FootnoteDef",
    execute: (parser, _token) => {
        const tok = parser.peek(0)
        if (tok?.type === "FootnoteDef" && tok.id) {
            parser.footNoteResolver.addDef(tok.id, tok.content || "")
        }
        parser.next(1)
    },
}

const FootnoteRefHandler: ParsingStrategy = {
    type: "FootnoteRef",
    execute: (parser, _token) => {
        const tok = parser.peek(0)
        parser.next(1)
        if (tok?.type !== "FootnoteRef" || !tok.id) return { type: "Text", value: "" }
        parser.footNoteResolver.addUsedRef(tok.id)
        return { type: "FootnoteRef", id: tok.id }
    },
}

const NewLineHandler: ParsingStrategy = {
    type: "NewLine",
    execute: (parser, _token) => {
        parser.next(1)
    },
}

export {
    BoldHandler,
    CodeBlockHandler,
    FootnoteDefHandler,
    FootnoteRefHandler,
    HeaderHandler,
    HorizontalLineHandler,
    HtmlBlockHandler,
    HtmlInlineHandler,
    ImageHandler,
    InlineHandler,
    ItalicHandler,
    LinkHandler,
    ListHandler,
    NewLineHandler,
    QuoteHandler,
    StrikethroughHandler,
    TableHandler,
}