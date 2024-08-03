import { Extension } from '@tiptap/core'
import { AttributeSpec, Node, Node as ProseMirrorNode, Schema, Slice } from '@tiptap/pm/model'
import { EditorState, Plugin, PluginKey, Transaction } from '@tiptap/pm/state'
import { ReplaceStep } from '@tiptap/pm/transform';
import { findDomRefAtPos, findParentDomRefOfType } from 'prosemirror-utils';
import { splitPage } from './splitPages';

export interface PaginationOptions {
    // /**
    //  * The maximum number of characters that should be allowed. Defaults to `0`.
    //  * @default null
    //  * @example 180
    //  */
    // limit: number | null | undefined
    // /**
    //  * The mode by which the size is calculated. If set to `textSize`, the textContent of the document is used.
    //  * If set to `nodeSize`, the nodeSize of the document is used.
    //  * @default 'textSize'
    //  * @example 'textSize'
    //  */
    // mode: 'textSize' | 'nodeSize'
    limit: number | null | undefined
}

type SplitInfo = {
    pos: number
    height: number
    depth: number
    offsetInCell: number | null
    cellStart: number | null
}

type PluginState = {
    bodyHeight: number | null
    bodyWidth: number | null
    bodyBoundaries: DOMRect | null
    posAtBodyEnd: number | null
    cellInOffset: SplitInfo | null
    pasting: boolean
    deleting: boolean
    pagesMeta: Array<AttributeSpec>
}

export const key = new PluginKey<PluginState>('pagination')

export const Pagination = Extension.create<PaginationOptions>({
    name: 'pagination',

    addOptions() {
        return {
            limit: null,
        }
    },

    // onBeforeCreate(){

    // }

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: key,
                state: {
                    init: (): PluginState => ({
                        bodyHeight: null,
                        bodyWidth: null,
                        bodyBoundaries: null,
                        posAtBodyEnd: null,
                        cellInOffset: null,
                        pasting: false,
                        deleting: false,
                        pagesMeta: [],
                    }),
                    apply: (tr, prev): PluginState => {
                        const bodyDimenssion: { bodyHeight: number; bodyWidth: number } = tr.getMeta('splitPage')

                        const bodyBoundaries: DOMRect = tr.getMeta('bodyBoundaries')

                        const posAtBodyEnd: any = tr.getMeta('posAtBodyEnd')

                        const cellInOffset: SplitInfo = tr.getMeta('cellInOffset')

                        const pasting: boolean = tr.getMeta('paste')

                        const deleting: boolean = tr.getMeta('deleting')

                        const pagesMeta: Array<AttributeSpec> = tr.getMeta('pagesMeta')

                        let next: PluginState = { ...prev }

                        if (bodyDimenssion) {
                            next.bodyHeight = bodyDimenssion.bodyHeight
                            next.bodyWidth = bodyDimenssion.bodyWidth
                        }

                        if (bodyBoundaries) next.bodyBoundaries = bodyBoundaries

                        if (posAtBodyEnd) next.posAtBodyEnd = posAtBodyEnd

                        if (pagesMeta) next.pagesMeta = pagesMeta

                        if (!posAtBodyEnd || !bodyDimenssion || !bodyBoundaries)
                            next = { ...next, bodyHeight: null, bodyWidth: null, bodyBoundaries: null, posAtBodyEnd: null }

                        if (cellInOffset) next.cellInOffset = cellInOffset

                        if (pasting) next.pasting = pasting

                        next.deleting = deleting ? deleting : false

                        return next
                    },
                },
                view: (view) => {
                    return {
                        update: (view, prevState) => {
                            const { selection, schema, tr } = view.state
                            if (view.state.doc.eq(prevState.doc)) return

                            const domAtPos = view.domAtPos.bind(view)
                            const pageDOM = findParentDomRefOfType(schema.nodes['page'], domAtPos)(selection)
                            const pageBody = (pageDOM as HTMLElement).querySelector('.content')
                            const inserting = isOverflown(pageBody);

                            if (!pageBody) return;

                            if (inserting) {
                                const bodyBoundaries = pageBody.getBoundingClientRect()

                                const posAtBodyEnd = view.posAtCoords({ left: bodyBoundaries.left, top: bodyBoundaries.bottom })

                                // console.log("End : ", posAtBodyEnd)
                                const pagesMeta: any = []

                                tr.doc.forEach(node => {
                                    pagesMeta.push(node.attrs)
                                })

                                // if (deleting) tr.setMeta('deleting', true)

                                view.dispatch(
                                    tr
                                        .setMeta('splitPage', { bodyHeight: pageBody.clientHeight, bodyWidth: pageBody.clientWidth })
                                        .setMeta('bodyBoundaries', bodyBoundaries)
                                        .setMeta('posAtBodyEnd', posAtBodyEnd)
                                        .setMeta('pagesMeta', pagesMeta)
                                )
                            }

                            console.log(inserting);
                        },
                    };
                },
                appendTransaction([newTr], _prevState, state) {
                    let { schema, tr } = state

                    const { bodyHeight, pasting, deleting, pagesMeta } = this.getState(state)

                    const splitCommand = newTr.getMeta('splitCommand')

                    // const isPointer = newTr.getMeta('pointer')

                    let prevSelectionPos: number | null

                    if (!bodyHeight || splitCommand) return

                    // if (
                    //     state.selection.$head.node(1) === state.doc.lastChild &&
                    //     state.selection.$head.node(2).lastChild === state.selection.$head.node(3)

                    //     // state.selection.$head.node(3).type !== schema.nodes[TABLE]
                    // ) {
                    //
                    // If carret is on the last element of the page directlty split page skil else
                    //

                    const nextPageModel = state.schema.nodes["page"].create(pagesMeta[tr.doc.childCount])

                    if (tr.selection.$head.parentOffset === 0) {
                        tr = tr.step(new ReplaceStep(tr.selection.head - 2, tr.selection.head, Slice.empty))
                        return splitPage(tr, tr.selection.head, tr.selection.$head.depth, [nextPageModel], schema)
                    }
                    return splitPage(tr, tr.selection.head - 1, tr.selection.$head.depth, [nextPageModel], schema).scrollIntoView()
                    // }

                    prevSelectionPos = state.selection.head

                    // tr = removeHeadersAndFooters(tr, schema)

                    // tr = joinDocument(tr)

                    // tr = addHeadersAndFooters(tr, schema)

                    tr = splitDocument(tr, state)

                    console.log("TR : ", tr)

                    // tr = skipFooterHeaderInSelection(tr, schema, prevSelectionPos, deleting)

                    return tr.scrollIntoView()
                },
                // filterTransaction: (tr, state) => {
                //     const limit = this.options;
                //     console.log("From pagination :", tr);
                //     return true;
                // },
            })
        ]
    },
});
;

const isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }: any) => {
    return scrollHeight > clientHeight || scrollWidth > clientWidth
}


const splitDocument = (tr: Transaction, state: EditorState): Transaction => {
    const { schema } = state

    //@ts-ignore
    const { pagesMeta } = key.getState(state)
    //@ts-ignore
    const splitInfo: SplitInfo = getNodeHeight(tr.doc, state)

    const nextPageModel = state.schema.nodes["page"].create(pagesMeta[tr.doc.childCount])
    console.log(key.getState(state))

    if (!splitInfo) return tr

    let newTr = splitPage(tr, splitInfo.pos - 1, splitInfo.depth, [nextPageModel], state.schema)

    if (splitInfo.depth !== 6) newTr = removePararaphAtStart(newTr, schema)

    // if (splitInfo.depth === 3 && splitInfo.cellStart !== null) {
    //     newTr = joinTables(newTr, splitInfo, schema, state)
    // }

    // if (splitInfo.depth === 6) {
    //     newTr = removeLastRowFromSplit(tr, schema, splitInfo)
    //     newTr = joinTables(newTr, splitInfo, schema, state)
    // }

    if (getNodeHeight(newTr.doc, state)) {
        return splitDocument(newTr, state)
    }

    return newTr
}

const getNodeHeight = (doc: Node, state: EditorState): SplitInfo | null => {
    //
    // This function measurs rest of the node and returns postiotns and depth wheret to split
    //

    const { schema } = state

    const { lastChild } = doc

    //@ts-ignore
    const { bodyHeight, deleting } = key.getState(state)


    let accumolatedHeight: number = 2

    let pageBoundary = null

    doc.descendants((node, pos) => {
        if (accumolatedHeight > bodyHeight) {

            return false
        }

        if (node.type === schema.nodes["page"] && node !== lastChild) {
            console.log("in")
            return false
        }


        if (node.type === schema.nodes["paragraph"]) {
            const pHeight = getParagraphHeight(node)
            accumolatedHeight += pHeight

            if (accumolatedHeight > bodyHeight) {
                pageBoundary = {
                    pos,
                    height: accumolatedHeight,
                    depth: 3,
                    offsetInCell: null,
                    cellStart: null,
                }

                return false
            }
        }


    })
    return pageBoundary ? pageBoundary : null
}


const getParagraphHeight = (node: Node): number => {
    let parsedPoints: number = 15

    const paragraphDOM = document.getElementById(node.attrs.id)

    if (paragraphDOM) return paragraphDOM.getBoundingClientRect().height

    return parsedPoints + node.attrs.paddingTop + node.attrs.paddingBottom


}

const removePararaphAtStart = (tr: Transaction, schema: Schema): Transaction => {
    //
    // Removes fist paragraph inserted by split
    //

    let { lastChild } = tr.doc

    tr.doc.descendants((node, pos) => {
        if (node.type === schema.nodes["page"] && node !== lastChild) {
            return false
        }

        if (node.type === schema.nodes["body"]) {
            const firstParagraph = tr.doc.nodeAt(pos + 1)
            //@ts-ignore
            tr = tr.delete(pos + 1, pos + 1 + firstParagraph.nodeSize)

            return false
        }
    })

    return tr
}