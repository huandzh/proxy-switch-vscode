# Proxy Switch VS Code Extension

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=YourName.proxy-switch)

Manage VS Code proxy settings with configurable profiles. Easily switch between different proxy configurations for development environments.

## Features

- 🛠 Create multiple proxy profiles with custom settings
- 🔄 Quickly switch between active proxy configurations
- 🚫 Disable proxy with one click
- ⚙️ Persistent profile storage in VS Code configuration

## Installation

1. Download the latest `.vsix` package
2. Open VS Code and run:
```bash
code --install-extension proxy-switch-0.1.0.vsix
```

## Usage

1. **Add Profile**  
   - Run `Proxy Switch: Add Proxy Profile` from Command Palette
   - Enter profile name and proxy configuration details

2. **Switch Profiles**  
   - Run `Proxy Switch: Switch Proxy Profile`
   - Select from saved profiles

3. **Disable Proxy**  
   - Run `Proxy Switch: Disable Proxy` to clear current proxy settings

## Configuration

Profiles are stored in VS Code settings under:
```json
"proxySwitch.profiles": [
  {
    "name": "Work Proxy",
    "http.proxy": "http://proxy.example.com:8080",
    "http.proxyStrictSSL": false
  }
]
```

## Building from Source

```bash
npm install
npm run compile
npm run package
```

## Contributing

Pull requests welcome! Please ensure:
- TypeScript types are maintained
- VS Code API guidelines are followed
- Tests are added for new features

## License

MIT © 2025 YourName