# Change Log

All notable changes to the "ai-more-context" extension will be documented in this file.

## [1.0.4] - 2024-03-19

### Fixed
- Fixed screenshot capture by adding the `tabs` permission
- Improved error handling during screenshot capture
- Explicit specification of the active window for capture

## [1.0.3] - 2024-03-19

### Changed
- Cleaned up project structure
- Removed unnecessary development files
- Optimized VSIX package with .vscodeignore

## [1.0.2] - 2024-03-19

### Added
- Added support for resource loading errors
- Added capture of unhandled promise errors
- Added capture of CSS style errors

## [1.0.1] - 2024-03-19

### Changed
- Renamed context folder from `vscode-context` to `ai-more-context`
- Improved console error capture

## [1.0.0] - 2024-03-19

### Added
- DOM capture
- Console error capture
- Resource capture
- Screenshot capture
- WebSocket communication between Chrome and VSCode
- Context storage in a dedicated folder

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Features
- JavaScript error capture (reference, syntax, execution)
- Resource error capture (404, network errors)
- Unhandled promise error capture
- CSS style error capture
- Context saving in Markdown format
- Screenshot saving
- Raw HTML saving
- Console errors saving in JSON format

### Planned Future Improvements
- HTML validation
- Performance metrics
- Accessibility checking
- Security issue detection
- Browser compatibility support
- Enhanced user interface
- AI integration
- Context version management
- Customization options
- Performance optimization 