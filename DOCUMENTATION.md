## Documentation
You can see below the API reference of this module.

### `WebTerm()`
Creates a new `WebTerm` instance.

#### Return
- **WebTerm** The `WebTerm` instance.

### `create(options, callback)`
Creates a new terminal instance.

#### Params
- **Object** `options`: Creates a new terminal instance.
- **Function** `callback`: The callback function.

#### Return
- **Terminal** The terminal instance.

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

