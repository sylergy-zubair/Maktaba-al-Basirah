# Contributing to Shamela TTS Reader

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Code Style

### Backend (JavaScript/Node.js)

- Use ES6 modules (`import/export`)
- Follow existing code formatting (2 spaces, no semicolons where consistent)
- Use async/await for asynchronous operations
- Handle errors properly with try/catch
- Use descriptive variable and function names

### Frontend (TypeScript/React)

- Use TypeScript for type safety
- Use functional components with hooks
- Follow React best practices
- Ensure all interactive elements are keyboard accessible
- Add ARIA labels for screen readers

## Accessibility Guidelines

This project prioritizes accessibility for blind users. When contributing:

1. **Keyboard Navigation**: All functionality must be accessible via keyboard
2. **Screen Readers**: Test with NVDA or JAWS
3. **ARIA Labels**: Add appropriate ARIA labels to all interactive elements
4. **Focus Management**: Ensure focus is managed correctly
5. **Error Messages**: All errors must be announced to screen readers

## Testing

### Manual Testing Checklist

- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify all ARIA labels are correct
- [ ] Test error handling and user feedback
- [ ] Verify TTS audio playback works
- [ ] Test bookmark functionality

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly, especially accessibility features
4. Update documentation if needed
5. Submit a pull request with a clear description

## Reporting Issues

When reporting issues, please include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Screen reader used (if accessibility issue)
- Any error messages

## Feature Requests

Feature requests are welcome! Please describe:

- The feature you'd like to see
- Why it would be useful
- How it would work
- Any accessibility considerations

