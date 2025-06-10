# VSCode Extension Quickstart

This guide will help you get started with the AI More Context extension development.

## Prerequisites

- Node.js
- VSCode
- Chrome

## Installation

1. Clone the repository
2. Install dependencies
3. Compile the extension
4. Launch in debug mode

## Configuration

The extension can be configured through VSCode settings:

- `ai-more-context.port`: WebSocket server port (default: 3000)

## Troubleshooting

### Common Issues

1. **Server not starting**
   - Check if port 3000 is available
   - Verify Node.js installation
   - Check console for errors

2. **Context not captured**
   - Ensure Chrome extension is installed
   - Check WebSocket connection
   - Verify file permissions

3. **Extension not loading**
   - Rebuild the extension
   - Check VSCode logs
   - Verify dependencies

## Development

### Commands

- `Start Context Server`: Starts the WebSocket server
- `Stop Context Server`: Stops the WebSocket server

### Debugging

1. Press F5 to launch in debug mode
2. Set breakpoints in the code
3. Use VSCode debug tools

## Resources

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) 