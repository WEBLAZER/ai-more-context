# Privacy Policy - AI More Context

Last updated: 2024

## Introduction

AI More Context is a Chrome extension designed to enhance the development experience by capturing and sharing web development context with VSCode. This privacy policy explains how we collect, use, and protect your data.

## Data Collection

### Types of Data
The extension collects only the following data:
- HTML content of the active page
- JavaScript console errors
- Loaded resources (scripts, styles, images)
- Page screenshot

### Collection Scope
- Data is collected only on web pages you visit
- Collection is limited to content visible in the active tab
- No personal data is collected

## Data Usage

### Purpose
The collected data is used only for:
- Facilitating code debugging
- Improving development assistance
- Providing enriched context to VSCode

### Storage
- Data is temporarily stored in your browser's local storage
- Data is automatically deleted when:
  - The extension is uninstalled
  - The browser is closed
  - You clear browsing data

## Data Sharing

### Local Communication
- Data is sent only to your local VSCode server (http://localhost:3000)
- No data is sent to external servers
- No data is shared with third parties

## Required Permissions

### activeTab
Necessary to access the content of the active page and capture development context.

### scripting
Used to inject capture code into web pages.

### storage
Allows temporary storage of errors and context before sending to VSCode.

### tabs
Necessary to detect tab changes and manage context capture.

### Host Access
- `http://localhost:3000/*` : To communicate with the local VSCode server
- `<all_urls>` : To capture context on visited web pages

## Security

### Data Protection
- All communications are local
- No data is stored on remote servers
- Data is automatically cleaned up

### Data Control
You can at any time:
- Disable the extension
- Clear stored data
- Uninstall the extension

## Policy Changes

We reserve the right to modify this privacy policy. Changes will be published on this page with the last update date.

## Contact

For any questions regarding this privacy policy, please:
- Open an issue on [GitHub](https://github.com/WEBLAZER/ai-more-context/issues)
- Check the [documentation](https://github.com/WEBLAZER/ai-more-context#readme)

## Compliance

This extension complies with the Chrome Web Store Developer Program Policy and follows privacy best practices. 