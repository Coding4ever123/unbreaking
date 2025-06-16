# mini-breakpad-server

A lightweight server for collecting and processing crash reports from applications using Google Breakpad.

## Core Features

- Standalone NodeJS crash report collection server
- Minidump processing and storage
- Web interface with theme support
- SQLite database backend
- RESTful API endpoints

## Quick Start

### 1. Install Nodejs

See the install instructions on the [NodeJS Website](https://nodejs.org/en/download)

### 2. Install dependencies:

```sh
npm install
```

### 3. Configure the server:

This is the default configuration:

```json
{
    "postURL": "post",
    "savePath": {
        "minidump": "pool/files/minidump",
        "db": "pool/database/sqlite3/db.db"
    },
    "port": 80
}
```

### 4. Start the server:

```sh
npm start
```

The code will automatically compile

## Project Structure

```
unbreaking/       # Top Level
├── src/          # TypeScript source files
├── web/          # Frontend assets
└── pool/         # Storage directory
    ├── files/    # Crash dump storage
    └── database/ # SQLite database
    config.json   # The Configuration file for the server
    README.md     # A quick introduction
    LICENSE       # This project is licensed under the MIT License
    build.js      # The build script uses esbuild to compile everything
```

## API Reference

| Endpoint                   | Method | Description         |
| -------------------------- | ------ | ------------------- |
| `/post`                    | POST   | Submit crash report |
| `/api/getAllRecords/:page` | GET    | List crash reports  |
| `/api/getRecord/:uuid`     | GET    | Get specific report |

## Development

Build the project:

```bash
npm run build
```

## License

MIT License - See LICENSE file for details.
