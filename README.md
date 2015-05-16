# Search Query Syntax Parser

> A simple parser for advanced search query syntax.

[![Build Status](https://travis-ci.org/retraceio/search-query-parser.svg?branch=master)](https://travis-ci.org/retraceio/search-query-parser)

It parses a string like this:
```
from:hi@retrace.io,foo@gmail.com to:me subject:vacations date:1/10/2013-15/04/2014 photos
```

And turns it into an object like this:

```javascript
{
  from: ['hi@retrace.io', 'foo@gmail.com'],
  to: 'me',
  subject: 'vacations',
  date: {
    from: '1/10/2013',
    to: '15/04/2014'
    },
  text: 'photos'
}
```

## Installation

```shell
$ npm install search-query-parser
```

## Usage

```javascript
var searchQuery = require('search-query-parser');

var query = 'from:hi@retrace.io,foo@gmail.com to:me subject:vacations date:1/10/2013-15/04/2014 photos';
var options = {keywords: ['from', 'to', 'subject'], ranges: ['date']}

var searchQueryObj = searchQuery.parse(query, options);

// searchQueryObj.from is now ['hi@retrace.io', 'foo@gmail.com']
// searchQueryObj.to is now 'me'
// searchQueryObj.date is now {from: '1/10/2013', to: '15/04/2014'}
// searchQueryObj.text is now 'photos'
```

You can configure what keywords and ranges the parser should accept with the options argument.
It accepts 2 values:
 * `keywords`, that can be separated by commas (,)
 * `ranges`, that can be separated by a hyphen (-)
Both values take an array of strings, as in the example just above.

## Testing

The 15 tests are written using the BDD testing framework should.js, and run with mocha.

Run `npm install should` and `npm install -g mocha` to install them both.

Run tests with `mocha -R spec`.

## License

The MIT License (MIT)

Copyright (c) 2014 retraceio <hi@retrace.io>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
