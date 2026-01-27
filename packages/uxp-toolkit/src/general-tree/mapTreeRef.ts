import { Tree } from "./treeTypes";

export function mapTreeRef<TRef, TMappedRef>(tree: Tree<TRef>, mapFn: (node: TRef) => TMappedRef): Tree<TMappedRef> {
  return tree.map((node) => {
    return {
      ...node,
      ref: mapFn(node.ref),
      children: node.children ? mapTreeRef(node.children, mapFn) : undefined,
    };
  });
}
