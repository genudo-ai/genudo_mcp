# Contributing to Genudo MCP Client

Thank you for your interest in contributing to the Genudo MCP Client! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/genudo/genudo-mcp-client/issues) to avoid duplicates.

When creating a bug report, please include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (Node.js version, OS, Claude Code version)
- **Error messages or logs** if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Clear title and description**
- **Use case** - why would this enhancement be useful?
- **Proposed solution** if you have one in mind
- **Alternatives considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit your changes** with clear, descriptive messages
6. **Push to your fork** and submit a pull request

#### Pull Request Guidelines

- Follow the existing code style
- Write clear commit messages
- Include tests for new features
- Update README.md if adding new features or changing behavior
- Keep PRs focused - one feature/fix per PR

## Development Setup

### Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn
- A Genudo account with API access

### Local Development

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/genudo-mcp-client.git
   cd genudo-mcp-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your GENUDO_API_KEY
   ```

4. Test the bridge:
   ```bash
   export GENUDO_API_KEY="your_api_key"
   echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node index.js
   ```

### Testing

Currently, the project uses manual testing. To test your changes:

1. Run the bridge with your API key
2. Send test JSON-RPC messages via stdin
3. Verify responses are correct
4. Test integration with Claude Code

Future: We plan to add automated tests. Contributions to the test suite are welcome!

## Coding Standards

### JavaScript Style

- Use ES6+ features where appropriate
- Use `const` and `let` instead of `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Add JSDoc comments for functions
- Handle errors properly with try/catch

### Example:

```javascript
/**
 * Process a single line of input (JSON-RPC request)
 * @param {string} line - The input line to process
 */
async function processInput(line) {
  try {
    const request = JSON.parse(line);
    // ... rest of implementation
  } catch (error) {
    debug('Error processing request:', error.message);
  }
}
```

### Commit Messages

Write clear, concise commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when applicable

Examples:
```
Add support for custom headers
Fix SSE reconnection handling
Update README with troubleshooting section
```

## Project Structure

```
genudo-mcp-client/
├── index.js           # Main bridge script
├── package.json       # Project configuration
├── README.md          # User documentation
├── CONTRIBUTING.md    # This file
├── LICENSE            # MIT License
├── .env.example       # Environment variable template
└── .gitignore         # Git ignore patterns
```

## Release Process

Releases are managed by project maintainers:

1. Version bump in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm
5. Create GitHub release

## Getting Help

- **Documentation**: Check the [README.md](README.md)
- **Issues**: Browse [existing issues](https://github.com/genudo/genudo-mcp-client/issues)
- **Discussions**: Join our [community forum](https://community.genudo.ai)
- **Email**: Contact support@genudo.ai

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- GitHub contributor stats

Thank you for contributing to Genudo MCP Client! 🎉
