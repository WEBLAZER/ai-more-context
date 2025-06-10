# AI More Context - Chrome Extension

This Chrome extension captures web development context and sends it to VSCode for enhanced debugging.

## Features

- Captures DOM structure
- Records console errors
- Monitors resource loading
- Takes screenshots
- Sends context to VSCode

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store
2. Click "Add to Chrome"
3. Confirm installation

### Manual Installation
1. Download the extension
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

## Usage

1. Install the VSCode extension
2. Start the context server in VSCode
3. Navigate to the page you want to debug
4. Click the extension icon
5. Context is automatically captured and sent to VSCode

## Development

### Prerequisites
- Node.js
- Chrome
- VSCode extension installed

### Setup
```bash
# Install dependencies
npm install

# Build extension
npm run build
```

### Testing
1. Load the extension in Chrome
2. Open the developer tools
3. Check the console for errors
4. Test context capture

## Configuration

The extension connects to VSCode on port 3000 by default. This can be changed in VSCode settings.

## Troubleshooting

If you encounter issues:

1. Check if VSCode server is running
2. Verify port 3000 is available
3. Check Chrome console for errors
4. Restart both extensions

## Support

For help and support:

1. Open an issue on [GitHub](https://github.com/WEBLAZER/ai-more-context/issues)
2. Check the [documentation](https://github.com/WEBLAZER/ai-more-context#readme)
3. Contact the author

## License

MIT - See the [LICENSE](https://github.com/WEBLAZER/ai-more-context/blob/main/LICENSE) file for details. 