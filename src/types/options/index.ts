import { ConvertOption } from "./converterOptions"
import { RenderOption } from './renderOptions'

/**
 * General option for rendering Markdown into HTML strings
 * @template TOutput - Output type after rendered
 */
export interface MarkdownOptions<TOutput> {
    //Custom render functions when render
    renderOptions?: RenderOption<TOutput>
    //Global render options
    converterOptions?: ConvertOption
}