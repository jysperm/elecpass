# Developing

## Dependencies

- Electron
- Node.js
- yarn

Install them on macOS:

```
brew install nodejs yarn
brew cask install electron
```

## Build & Run

- `yarn install`
- `./node_modules/.bin/gulp` or `./node_modules/.bin/gulp watch`
- (macOS) `/Applications/Electron.app/Contents/MacOS/Electron .`

Enable React debug:

- Follow [DevTools Extension](https://electron.atom.io/docs/tutorial/devtools-extension/) to find out the path of React Developer Tools.
- `export REACT_DEBUG='~/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.14.11_0'` before run elecpass.

## Run tests

- `yarn test` or `yarn run coverage-report`

## Release

- `yarn dist`
