# VSCode Extension - VSCode Context Enhancer

## Description
VSCode extension that receives and displays web development context captured by the corresponding Chrome extension.

## Features

### Context Reception
- **DOM**: Complete HTML structure
- **Console**: Errors and warnings
- **Resources**: Resource status
- **Screenshot**: Screen capture

### Context Storage
- Creates `vscode-context` folder
- Saves files:
  - `current-context.md`: Context in Markdown format
  - `screenshot.png`: Screen capture
  - `page.html`: Raw HTML
  - `console-errors.json`: Console errors

## Installation

1. Open VSCode
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Extensions: Install from VSIX"
4. Select the extension's `.vsix` file

## Usage

1. Start the extension with the "Start Context Server" command
2. WebSocket server starts on port 3000
3. Context is automatically received from Chrome extension
4. Files are saved in the `vscode-context` folder

## Development

### File Structure
```
vscode-extension/
├── src/
│   ├── extension.ts     # Extension entry point
│   └── server.ts        # WebSocket server
├── package.json         # Configuration and dependencies
└── tsconfig.json        # TypeScript configuration
```

### Compilation
```bash
npm install
npm run compile
```

### Testing
1. Press F5 in VSCode to launch in development mode
2. Check context reception
3. Test file saving

## Future Improvements

1. **User Interface**
   - Dedicated context panel
   - File navigation
   - Error filtering

2. **AI Integration**
   - Automatic error analysis
   - Correction suggestions
   - Contextual documentation

3. **Version Management**
   - Context history
   - Version comparison
   - Context restoration

4. **Customization**
   - Error type configuration
   - Custom filters
   - Display themes

5. **Performance**
   - Data compression
   - Caching
   - Storage optimization

## Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT - See [LICENSE](LICENSE) file for details.

## Author

[Arthur Ballan](https://github.com/WEBLAZER)

## Support

If you encounter any issues or have suggestions, feel free to:

1. Open an issue on GitHub
2. Contact the author
3. Check the documentation 