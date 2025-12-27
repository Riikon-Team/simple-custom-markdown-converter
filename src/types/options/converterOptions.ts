/**
 * General option for the render process,
 * These rules define high-level behavior for render process.
 */
export type ConvertOption = {
    /**
     * Allow raw HTML rendered in the Markdown input.
     * When false (default), HTML tags are escaped for security
     */
    allowDangerousHtml: boolean
}