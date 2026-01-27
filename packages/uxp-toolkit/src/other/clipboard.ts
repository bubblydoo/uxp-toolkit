export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText({
    "text/plain": text,
  } as any);
}

export async function readFromClipboard(): Promise<string> {
  const clipboard = await navigator.clipboard.readText();
  return (clipboard as any)["text/plain"];
}
