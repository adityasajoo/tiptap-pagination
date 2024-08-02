export interface PaginationOptions {
    /**
     * The maximum number of characters that should be allowed. Defaults to `0`.
     * @default null
     * @example 180
     */
    limit: number | null | undefined
    /**
     * The mode by which the size is calculated. If set to `textSize`, the textContent of the document is used.
     * If set to `nodeSize`, the nodeSize of the document is used.
     * @default 'textSize'
     * @example 'textSize'
     */
    mode: 'textSize' | 'nodeSize'
}
