# Multi-Highlight for VS Code

![Multi-Highlight](images/icon.png)

Multi-Highlight is a Visual Studio Code extension for highlighting multiple
words with different and customisable colours.

## Example

See the following screenshot in which I've highlighted three different words to
help clarify their use in the function being analysed:

![Screenshot](images/screenshot.png)

## Commands

Multi-Highlight adds the following commands to the command pallette:

- Multi-Highlight: Add Highlight
- Multi-Highlight: Remove Highlight
- Multi-Highlight: Clear Highlights

Add and Remove operate on the word currently under the cursor.

## Configuration

To configure the highlight colours, edit the `multi-highlight.colours` string.
This is a comma-separated list of background/foreground pairs.

The default list of colours is:

- yellow:black
- blue:white
- red:white
- green:white
- purple:white
- orange:white

Colours can be specified by name or using HTML syntax: `#d0d0d0`.

## Thanks

- Thanks to [vim-highlighter](https://github.com/azabiong/vim-highlighter) for
  the inspiration; I miss having this in vim.
- Thanks to DALL-E 3 for generating the icon/logo.
