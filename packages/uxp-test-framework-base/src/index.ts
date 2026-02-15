export interface Test {
  name: string;
  description?: string;
  run: (args: { name: string }) => Promise<void>;
}
