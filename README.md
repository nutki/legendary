# Setup Instructions

## Install Dependencies
Download and install [Node.js](https://nodejs.org/).
Run the following command to install all required dependencies:
```bash
npm install
```

## Download Graphical Assets
To download graphical assets, use the following commands:
```bash
npm run download Other
npm run download Legendary
```
For expansion cards
```bash
npm run download <expansion name>
```

## Build the Project
To build the project, use:
```bash
npm run build
```

## Serve Locally
Start a local server with:
```bash
npm start
```
The UI should be availiable at http://localhost:8080

# Known issues

## Not Implemented

* Any City altering scheme will not show extra spaces.
* Missing keyword support: _Venom_ Bonding
* Missing keyword support: _Noir_ Hidden Witness
* Missing keyword support: _X-Men_ Human Shields
* Trigger ordering
