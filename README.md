![](http://i.imgur.com/3kMJhvc.png)

# `$ web-term`
A fullscreen terminal in your browser.

## Installation
Run the following commands to download and install the application:

```sh
$ npm install -g web-term
```

## Usage
Run `web-term` and then open `localhost:9000` in your web browser.

## Screenshots

### VIM
![](http://i.imgur.com/49FTpfI.png)

### Alsamixer
![](http://i.imgur.com/rJbtLdi.jpg)

## Thanks
This project is highly based on [`tty.js`](https://github.com/chjj/tty.js) created by [@chjj](https://github.com/chjj). Thanks a lot for this awesome stuff!

## Documentation
### `create(options, callback)`
Creates a new terminal instance.

#### Params
- **Object** `options`: Creates a new terminal instance.
- **Function** `callback`: The callback function.

#### Return
- **WebTerm** The terminal instance.

### `data(data)`
Writes data in the `WebTerm` instance.

#### Params
- **Buffer** `data`: The buffer to write.

### `kill()`
Destroys the `WebTerm` instance.

### `resize(cols, rows)`
Resizes the terminal.

#### Params
- **Number** `cols`: The number of columns.
- **Number** `rows`: The number of rows.

## How to contribute
1. File an issue in the repository, using the bug tracker, describing the
   contribution you'd like to make. This will help us to get you started on the
   right foot.
2. Fork the project in your account and create a new branch:
   `your-great-feature`.
3. Commit your changes in that branch.
4. Open a pull request, and reference the initial issue in the pull request
   message.

## License
See the [LICENSE](./LICENSE) file.
