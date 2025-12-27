import { ConvertOption } from "./converterOptions"
import { ReactRenderOption } from "./reactRenderOptions"
import { RenderOption } from "./renderOptions"

/**
 * General option for rendering Markdown into HTML strings
 */
export type MarkdownDefaultOptions = {
    //Custom render functions when render HTML strings
    renderOptions?: RenderOption
    //Global render options
    converterOptions?: ConvertOption
}

/**
 * General option for rendering Markdown into `React.ReactNode` elements
 */
export type MarkdownReactOptions = {
    //Custom render functions when render HTML strings
    renderOptions?: ReactRenderOption
    //Global render options
    converterOptions?: ConvertOption
}