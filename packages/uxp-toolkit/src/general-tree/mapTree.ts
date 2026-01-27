import { Tree } from "./treeTypes";

export function mapTree<TRef, TMappedRef>(tree: Tree<TRef>, mapFn: (node: TRef) => TMappedRef): Tree<TMappedRef> {
  return tree.map((node) => {
    return {
      ...node,
      ref: mapFn(node.ref),
      children: node.children ? mapTree(node.children, mapFn) : undefined,
    };
  });
}
