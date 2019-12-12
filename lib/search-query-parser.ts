/*!
 * search-query-parser.js
 * Copyright(c) 2014-2019
 * MIT Licensed
 */

export type SearchParserOptions = {
    offsets?: boolean;
    tokenize?: boolean;
    keywords?: string[];
    ranges?: string[];
    alwaysArray?: boolean;
}

export type SearchParserOffset = (SearchParserKeyWordOffset | SearchParserTextOffset) & {
    offsetStart: number;
    offsetEnd: number;
}
  
export type SearchParserKeyWordOffset = {
    keyword: string;
    value: string;  
}
  
export type SearchParserTextOffset = {
    text: string;
}

export type SearchParserDictionary = {
    [key: string]: any;
}  

export type SearchParserResult = SearchParserDictionary & {
    text: string | string[];
    offsets?: SearchParserOffset[];
    exclude?: SearchParserDictionary;
}

export function parse(string = '', options: SearchParserOptions): SearchParserResult | string {

    // Merge options with default options
    options = {
        tokenize: false,
        alwaysArray: false,
        offsets: true,
        ...options
    };

    // When only a simple string is passed, return it
    if (string.indexOf(':') === -1 && options.tokenize == null) {
        return string;

    // When no keywords or ranges set, treat as a simple string
    } else if (options.keywords == null && options.ranges == null && options.tokenize == false){
        return string;
    
    // Otherwise parse the advanced query syntax
    } else {

        // Init object to store the query object
        let parseResult: SearchParserResult = { text: [] };

        // When offsets is true, create their array
        if (options.offsets) {
            parseResult.offsets = [];
        }

        let exclusion: SearchParserDictionary = {};
        let terms: SearchParserOffset[] = [];

        // Get a list of search terms respecting single and double quotes
        let regex = /(\S+:'(?:[^'\\]|\\.)*')|(\S+:"(?:[^"\\]|\\.)*")|(-?"(?:[^"\\]|\\.)*")|(-?'(?:[^'\\]|\\.)*')|\S+|\S+:\S+/g;
        let match;
        while ((match = regex.exec(string)) !== null) {
            let term = match[0];
            let sepIndex = term.indexOf(':');
            if (sepIndex !== -1) {
                let split = term.split(':'),
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
                let isExcludedTerm = false;
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
        let term: SearchParserOffset;
        while (term = terms.pop()) {

            // When just a simple term
            if ('text' in term) {

                // We add it as pure text
                (parseResult.text as string[]).push(term.text);

                // When offsets is true, push a new offset
                if (options.offsets) {
                    parseResult.offsets.push(term);
                }

            // We got an advanced search syntax
            } else {
                let key = term.keyword;
                // Check if the key is a registered keyword
                options.keywords = options.keywords || [];
                let isKeyword = false;
                let isExclusion = false;
                if (!/^-/.test(key)) {
                        isKeyword = !(-1 === options.keywords.indexOf(key));
                } else    if (key[0] === '-') {
                        let _key = key.slice(1);
                        isKeyword = !(-1 === options.keywords.indexOf(_key))
                        if (isKeyword) {
                                key = _key;
                                isExclusion = true;
                        }
                }

                // Check if the key is a registered range
                options.ranges = options.ranges || [];
                let isRange = !(-1 === options.ranges.indexOf(key));
                // When the key matches a keyword
                if (isKeyword) {
                    // When offsets is true, push a new offset
                    if (options.offsets) {
                        parseResult.offsets.push({
                            keyword: key,
                            value: term.value,
                            offsetStart: isExclusion ? term.offsetStart + 1 : term.offsetStart,
                            offsetEnd: term.offsetEnd
                        });
                    }

                    let value = term.value;
                    // When value is a thing
                    if (value.length) {
                        // Get an array of values when several are there
                        let values = value.split(',');
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
                                    if (options.alwaysArray) {
                                        // ...but we always return an array if option alwaysArray is true
                                        exclusion[key] = [value];
                                    } else {
                                        // Record its value as a string
                                        exclusion[key] = value;
                                    }
                                }
                            }
                        } else {
                            // If we already have seen that keyword...
                            if (parseResult[key]) {
                                // ...many times...
                                if (parseResult[key] instanceof Array) {
                                    // ...and got several values this time...
                                    if (values.length > 1) {
                                        // ... concatenate both arrays.
                                        parseResult[key] = parseResult[key].concat(values);
                                    }
                                    else {
                                        // ... append the current single value.
                                        parseResult[key].push(value);
                                    }
                                }
                                // We saw that keyword only once before
                                else {
                                    // Put both the current value and the new
                                    // value in an array
                                    parseResult[key] = [parseResult[key]];
                                    parseResult[key].push(value);
                                }
                            }
                            // First time we see that keyword
                            else {
                                // ...and got several values this time...
                                if (values.length > 1) {
                                    // ...add all values seen.
                                    parseResult[key] = values;
                                }
                                // Got only a single value this time
                                else {
                                    if (options.alwaysArray) {
                                        // ...but we always return an array if option alwaysArray is true
                                        parseResult[key] = [value];
                                    } else {
                                        // Record its value as a string
                                        parseResult[key] = value;
                                    }
                                }
                            }
                        }
                    }
                
                // The key allows a range
                } else if (isRange) {
                    
                    // When offsets is true, push a new offset
                    if (options.offsets) {
                        parseResult.offsets.push(term);
                    }

                    let value = term.value;

                    // Range are separated with a dash
                    let rangeValues = value.split('-');

                    // When both end of the range are specified
                    // keyword:XXXX-YYYY
                    parseResult[key] = {};
                    if (2 === rangeValues.length) {
                        parseResult[key].from = rangeValues[0];
                        parseResult[key].to = rangeValues[1];
                    
                    // When pairs of ranges are specified
                    // keyword:XXXX-YYYY,AAAA-BBBB
                    } else if (rangeValues.length % 2 === 0) {
                        //

                    // When only getting a single value,
                    // or an odd number of values
                    } else {
                        parseResult[key].from = value;
                    }

                } else {
                    // We add it as pure text
                    let text = term.keyword + ':' + term.value;
                    (parseResult.text as string[]).push(text);

                    // When offsets is true, push a new offset
                    if (options.offsets) {
                        parseResult.offsets.push({
                            text: text,
                            offsetStart: term.offsetStart,
                            offsetEnd: term.offsetEnd
                        });
                    }
                }
            }
        }

        // Concatenate all text terms if any
        if (parseResult.text.length) {
            if (options.tokenize === false) {
                parseResult.text = (parseResult.text as string[]).join(' ').trim();
            }

        // Just remove the attribute text when it's empty
        } else {
            delete parseResult.text;
        }

        // Return forged query object
        parseResult.exclude = exclusion;
        return parseResult;
    }

};
