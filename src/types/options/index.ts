import { ConvertOption } from "./converterOptions"
import { ReactRenderOption } from "./reactRenderOptions"
import { RenderOption } from "./renderOptions"

export type MarkdownDefaultOptions = {
    renderOptions?: RenderOption
    converterOptions?: ConvertOption
}

export type MarkdownReactOptions = {
    renderOptions?: ReactRenderOption
    converterOptions?: ConvertOption
}