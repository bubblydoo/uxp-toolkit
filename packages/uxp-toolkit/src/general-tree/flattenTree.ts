import { Tree } from "./treeTypes";

export function flattenTree<T>(tree: Tree<T>): Tree<T>[0][] {
  const result: Tree<T>[0][] = [];
  for (const node of tree) {
    result.push(node);
    if (node.children) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}
