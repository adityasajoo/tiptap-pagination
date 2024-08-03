import { Fragment, Node, Schema, Slice } from "@tiptap/pm/model"
import { Transaction } from "@tiptap/pm/state"
import { ReplaceStep } from "@tiptap/pm/transform";

export const splitPage = (tr: Transaction, pos: number, depth = 1, typesAfter: Array<Node> | null, schema: Schema) => {
    const $pos = tr.doc.resolve(pos);
    let before = Fragment.empty;
    let after = Fragment.empty;
    for (let d = $pos.depth, e = $pos.depth - depth, i = depth - 1; d > e; d--, i--) {
        //新建一个和 $pos.node(d) 一样的节点 内容是 before
        before = Fragment.from($pos.node(d).copy(before));
        const typeAfter = typesAfter && typesAfter[i];
        const n = $pos.node(d);
        let na: Node | null = $pos.node(d).copy(after);
        if (schema.nodes[n.type.name + "extend"]) {
            const attr = Object.assign({}, n.attrs, { id: Math.random().toString(36).substring(2, 10) });
            if (!attr.id) {
                console.log("id为空");
            }
            na = schema.nodes[n.type.name + "extend"].createAndFill(attr, after);
        } else {
            if (na && na.attrs.id) {
                let extend = {};
                if (na.attrs.extend == false) {
                    extend = { extend: true };
                }
                //重新生成id
                const attr = Object.assign({}, n.attrs, { id: Math.random().toString(36).substring(2, 10), ...extend });
                na = schema.nodes[n.type.name].createAndFill(attr, after);
            }
        }
        console.log(typeAfter)
        after = Fragment.from(
            typeAfter
                ? typeAfter.type.create(
                    {
                        id: Math.random().toString(36).substring(2, 10),
                        pageNumber: na?.attrs.pageNumber + 1
                    },
                    after
                )
                : na
        );
    }
    tr.step(new ReplaceStep(pos, pos, new Slice(before.append(after), depth, depth)));

    return tr.scrollIntoView()
}