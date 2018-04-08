/*!
 * search-query-parser.js
 * Copyright(c) 2014 Julien Buty <julien@nepsilon.net>
 * MIT Licensed
 */

exports.parse = function (string, options) {

  // Set an empty options object when none provided
  if (!options) {
    options = {};
  }

  if (!string) {
    string = '';
  }

  // When a simple string, return it
  if (-1 === string.indexOf(':') && !options.tokenize) {
    return string;
  }
  // When no keywords or ranges set, treat as a simple string
  else if (!options.keywords && !options.ranges && !options.tokenize){
    return string;
  }
  // Otherwise parse the advanced query syntax
  else {
    // Our object to store the query object
    var query = {text: [], offsets: []};
    var exclusion = {};
    var terms = [];
    // Get a list of search terms respecting single and double quotes
    var regex = /(\S+:'(?:[^'\\]|\\.)*')|(\S+:"(?:[^"\\]|\\.)*")|(-?"(?:[^"\\]|\\.)*")|(-?'(?:[^'\\]|\\.)*')|\S+|\S+:\S+/g;
    var match;
    while ((match = regex.exec(string)) !== null) {
      var term = match[0];
      var sepIndex = term.indexOf(':');
      if (sepIndex !== -1) {
        var split = term.split(':'),
            key = term.slice(0, sepIndex),
            val = term.slice(sepIndex + 1);
        // Strip surrounding quotes
        val = val.replace(/^\"|\"$|^\'|\'$/g, '');
        // Strip backslashes respecting escapes
        val = (val + '').replace(/\\(.?)/g, function (s, n1) {
          switch (n1) {
          case '\\':
            return '\\';
          case '0':
            return '\u0000';
          case '':
            return '';
          default:
            return n1;
          }
        });
        terms.push({
          keyword: key,
          value: val,
          offsetStart: match.index,
          offsetEnd: match.index + term.length
        });
      } else {
        var isExcludedTerm = false;
        if (term[0] === '-') {
          isExcludedTerm = true;
          term = term.slice(1);
        }

        // Strip surrounding quotes
        term = term.replace(/^\"|\"$|^\'|\'$/g, '');
        // Strip backslashes respecting escapes
        term = (term + '').replace(/\\(.?)/g, function (s, n1) {
          switch (n1) {
          case '\\':
            return '\\';
          case '0':
            return '\u0000';
          case '':
            return '';
          default:
            return n1;
          }
        });

        if (isExcludedTerm) {
          if (exclusion['text']) {
            if (exclusion['text'] instanceof Array) {
              exclusion['text'].push(term);
            } else {
              exclusion['text'] = [exclusion['text']];
              exclusion['text'].push(term);
            }
          } else {
            // First time seeing an excluded text term
            exclusion['text'] = term;
          }
        } else {
          terms.push({
            text: term,
            offsetStart: match.index,
            offsetEnd: match.index + term.length
          });
        }
      }
    }
    // Reverse to ensure proper order when pop()'ing.
    terms.reverse();
    // For each search term
    var term;
    while (term = terms.pop()) {
      // When just a simple term
      if (term.text) {
        // We add it as pure text
        query.text.push(term.text);
        query.offsets.push(term);
      }
      // We got an advanced search syntax
      else {
        var key = term.keyword;
        // Check if the key is a registered keyword
        options.keywords = options.keywords || [];
        var isKeyword = false;
        var isExclusion = false;
        if (!/^-/.test(key)) {
            isKeyword = !(-1 === options.keywords.indexOf(key));
        } else  if (key[0] === '-') {
            var _key = key.slice(1);
            isKeyword = !(-1 === options.keywords.indexOf(_key))
            if (isKeyword) {
                key = _key;
                isExclusion = true;
            }
        }

        // Check if the key is a registered range
        options.ranges = options.ranges || [];
        var isRange = !(-1 === options.ranges.indexOf(key));
        // When the key matches a keyword
        if (isKeyword) {
          query.offsets.push({
            keyword: key,
            value: term.value,
            offsetStart: isExclusion ? term.offsetStart + 1 : term.offsetStart,
            offsetEnd: term.offsetEnd
          });

          var value = term.value;
          // When value is a thing
          if (value.length) {
            // Get an array of values when several are there
            var values = value.split(',');
            if (isExclusion) {
              if (exclusion[key]) {
                // ...many times...
                if (exclusion[key] instanceof Array) {
                  // ...and got several values this time...
                  if (values.length > 1) {
                    // ... concatenate both arrays.
                    exclusion[key] = exclusion[key].concat(values);
                  }
                  else {
                    // ... append the current single value.
                    exclusion[key].push(value);
                  }
                }
                // We saw that keyword only once before
                else {
                  // Put both the current value and the new
                  // value in an array
                  exclusion[key] = [exclusion[key]];
                  exclusion[key].push(value);
                }
              }
              // First time we see that keyword
              else {
                // ...and got several values this time...
                if (values.length > 1) {
                  // ...add all values seen.
                  exclusion[key] = values;
                }
                // Got only a single value this time
                else {
                  // Record its value as a string
                  exclusion[key] = value;
                }
              }
            } else {
              // If we already have seen that keyword...
              if (query[key]) {
                // ...many times...
                if (query[key] instanceof Array) {
                  // ...and got several values this time...
                  if (values.length > 1) {
                    // ... concatenate both arrays.
                    query[key] = query[key].concat(values);
                  }
                  else {
                    // ... append the current single value.
                    query[key].push(value);
                  }
                }
                // We saw that keyword only once before
                else {
                  // Put both the current value and the new
                  // value in an array
                  query[key] = [query[key]];
                  query[key].push(value);
                }
              }
              // First time we see that keyword
              else {
                // ...and got several values this time...
                if (values.length > 1) {
                  // ...add all values seen.
                  query[key] = values;
                }
                // Got only a single value this time
                else {
                  // Record its value as a string
                  query[key] = value;
                }
              }
            }
          }
        }
        // The key allows a range
        else if (isRange) {
          query.offsets.push(term);

          var value = term.value;
          // Range are separated with a dash
          var rangeValues = value.split('-');
          // When both end of the range are specified
          // keyword:XXXX-YYYY
          query[key] = {};
          if (2 === rangeValues.length) {
            query[key].from = rangeValues[0];
            query[key].to = rangeValues[1];
          }
          // When pairs of ranges are specified
          // keyword:XXXX-YYYY,AAAA-BBBB
          else if (!rangeValues.length % 2) {
          }
          // When only getting a single value,
          // or an odd number of values
          else {
            query[key].from = value;
          }
        }
        else {
          // We add it as pure text
          var text = term.keyword + ':' + term.value;
          query.text.push(text);

          query.offsets.push({
            text: text,
            offsetStart: term.offsetStart,
            offsetEnd: term.offsetEnd
          });
        }
      }
    }

    // Concatenate all text terms if any
    if (query.text.length) {
      if (!options.tokenize) {
        query.text = query.text.join(' ').trim();
      }
    }
    // Just remove the attribute text when it's empty
    else {
      delete query.text;
    }

    // Return forged query object
    query.exclude = exclusion;
    return query;
  }

};
