import * as vscode from "vscode";

const DEFAULT_COLOURS =
  "yellow:black, blue:white, red:white, green:white, purple:white, orange:white";

const highlightDecorations: vscode.TextEditorDecorationType[] = [];
const highlightWords: any[] = [];
let nextHighlight = 0;

function getWordAtCursor(): string | undefined {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return undefined;
  }

  const selection = editor.selection;
  const wordRange = editor.document.getWordRangeAtPosition(selection.start);

  if (wordRange) {
    return editor.document.getText(wordRange);
  }

  return undefined;
}

function escapeRegExp(inputString: string): string {
  return inputString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMatches(word: string): vscode.DecorationOptions[] {
  const matches: vscode.DecorationOptions[] = [];
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const text = editor.document.getText();
    const regex = new RegExp(escapeRegExp(word), "g");

    let match;

    while ((match = regex.exec(text))) {
      const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + word.length);
      const range = new vscode.Range(startPos, endPos);
      matches.push({ range });
    }
  }

  return matches;
}

function removeHighlightForWord(word: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const index = highlightWords.findIndex((w) => w === word);
  if (index === -1) {
    return;
  }

  editor.setDecorations(highlightDecorations[index], []);
  highlightWords[index] = undefined;
  nextHighlight = index;
}

function chooseNextHighlight(): number {
  const start = nextHighlight;
  let looped = false;
  let idx = nextHighlight;

  while (highlightWords[idx] && !looped) {
    idx = (idx + 1) % highlightDecorations.length;
    looped = idx === start;
  }

  return idx;
}

function addHighlight() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const word = getWordAtCursor();
  if (!word) {
    return;
  }

  // We need to remove any highlight first since decorations accumulate.
  removeHighlightForWord(word);

  const idx = chooseNextHighlight();
  const decoration = highlightDecorations[idx];
  highlightWords[idx] = word;

  nextHighlight = (idx + 1) % highlightDecorations.length;

  editor.setDecorations(decoration, getMatches(word));
}

function removeHighlight() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const word = getWordAtCursor();
  if (!word) {
    return;
  }

  removeHighlightForWord(word);
}

function clearHighlights() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  highlightDecorations.forEach((decoration) =>
    editor.setDecorations(decoration, [])
  );
  highlightWords.fill(undefined);
  nextHighlight = 0;
}

function freshHighlight() {
  clearHighlights();
  addHighlight();
}

function toggleHighlight() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const word = getWordAtCursor();
  if (!word) {
    return;
  }

  const index = highlightWords.findIndex((w) => w === word);
  if (index === -1) {
    addHighlight();
  } else {
    removeHighlightForWord(word);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("multi-highlight");
  const colours = (config.get<string>("colours") || DEFAULT_COLOURS)
    .split(",")
    .map((p) =>
      p
        .trim()
        .split(":")
        .map((c) => c.trim())
    );

  colours.forEach((colourPair) => {
    highlightDecorations.push(
      vscode.window.createTextEditorDecorationType({
        backgroundColor: colourPair[0],
        color: colourPair[1],
      })
    );

    highlightWords.push(undefined);
  });

  let commands = [
    vscode.commands.registerCommand("multi-highlight.addHighlight", () => {
      addHighlight();
    }),
    vscode.commands.registerCommand("multi-highlight.removeHighlight", () => {
      removeHighlight();
    }),
    vscode.commands.registerCommand("multi-highlight.clearHighlights", () => {
      clearHighlights();
    }),
    vscode.commands.registerCommand("multi-highlight.freshHighlight", () => {
      freshHighlight();
    }),
    vscode.commands.registerCommand("multi-highlight.toggleHighlight", () => {
      toggleHighlight();
    }),
  ];

  commands.forEach((cmd) => context.subscriptions.push(cmd));
}

export function deactivate() {}
