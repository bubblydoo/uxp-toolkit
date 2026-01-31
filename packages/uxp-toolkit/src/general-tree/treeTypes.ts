export type Tree<TRef = unknown> = {
  ref: TRef;
  name: string;
  children?: Tree<TRef>;
}[];
