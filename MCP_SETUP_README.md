# Chrome DevTools MCP Setup Guide

I have installed the `chrome-devtools-mcp` package in your project. To enable it for Claude Desktop or other MCP clients, you need to update your configuration file.

## 1. Locate your Config File
On Windows, the configuration file is typically located at:
`%APPDATA%\Claude\claude_desktop_config.json`
(e.g., `C:\Users\kaine\AppData\Roaming\Claude\claude_desktop_config.json`)

## 2. Add the Chrome DevTools Server
Add the following entry to the `mcpServers` object in your config file:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp"]
    }
  }
}
```

If you already have other servers configured, just add the `chrome-devtools` key to the existing list.

## 3. Usage
Once configured, restart Claude Desktop. You should now see "Chrome DevTools" available as a tool.
*   **Note**: This tool requires a running instance of Chrome with remote debugging enabled (usually on port 9222), OR it will attempt to launch one.
*   To launch Chrome with remote debugging manually:
    `"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222`

## Verified Installation
The package is installed in your project's `node_modules`, so `npx` will find it locally or fetch the latest version.
