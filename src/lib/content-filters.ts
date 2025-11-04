// Utility to decide which markdown files should be hidden from navigation and routing

const HIDDEN_BASENAME_PATTERNS = [
  /^readme(?:\.md)?$/i,
  /^license(?:\.md)?$/i,
  /^licence(?:\.md)?$/i,
  /^code[_-]of[_-]conduct(?:\.md)?$/i,
];

/** Returns true if the given repo path points to a markdown file we want to hide. */
export function isHiddenMarkdownPath(path: string): boolean {
  const base = path.split("/").pop() || path;
  return HIDDEN_BASENAME_PATTERNS.some((re) => re.test(base));
}
