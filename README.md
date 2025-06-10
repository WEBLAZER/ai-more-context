# AI More Context

A Chrome and VSCode extension that captures web development context to enhance the debugging experience.

## Features

### Context Capture
- **DOM**: Complete HTML structure of the page
- **Console**: JavaScript errors and warnings
- **Resources**: Resource loading state (images, scripts, styles)
- **Screenshot**: Page screenshot

### Captured Error Types
- JavaScript errors (reference, syntax, execution)
- Resource loading errors (404, network errors)
- Unhandled promise errors
- CSS style errors

### Context Storage
- Creates an `ai-more-context` folder
- Saves files:
  - `current-context.md`: Context in Markdown format
  - `screenshot.png`: Screenshot
  - `page.html`: Raw HTML
  - `console-errors.json`: Console errors

## Installation

### Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked extension"
4. Select the `chrome-extension` folder

### VSCode Extension
1. Open VSCode
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Extensions: Install from VSIX"
4. Select the extension `.vsix` file

## Usage

1. Start the extension with the "Start Context Server" command
2. The WebSocket server starts on port 3000
3. Navigate to the web page to debug
4. Click on the Chrome extension icon
5. Context is automatically captured and sent to VSCode
6. Files are saved in the `ai-more-context` folder

## Project Structure

```
ai-more-context/
├── chrome-extension/     # Chrome Extension
├── vscode-extension/     # VSCode Extension
│   ├── src/
│   │   ├── extension.ts  # Extension entry point
│   │   └── server.ts     # WebSocket server
│   ├── package.json      # Configuration and dependencies
│   └── tsconfig.json     # TypeScript configuration
├── test/                 # Tests and examples
└── ai-more-context/      # Context storage folder
```

## Development

### Prerequisites
- Node.js
- Chrome
- VSCode

### Installing Dependencies
```bash
# Chrome Extension
cd chrome-extension
npm install

# VSCode Extension
cd vscode-extension
npm install
```

### Compilation
```bash
# Chrome Extension
cd chrome-extension
npm run build

# VSCode Extension
cd vscode-extension
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
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT - See the [LICENSE](LICENSE) file for details.

## Author

[Arthur Ballan](https://github.com/WEBLAZER)

## Support

If you encounter issues or have suggestions:
1. Open an issue on GitHub
2. Contact the author
3. Check the documentation
