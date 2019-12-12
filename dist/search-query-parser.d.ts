/*!
 * search-query-parser.js
 * Copyright(c) 2014-2019
 * MIT Licensed
 */
export declare type SearchParserOptions = {
    offsets?: boolean;
    tokenize?: boolean;
    keywords?: string[];
    ranges?: string[];
    alwaysArray?: boolean;
};
export declare type SearchParserOffset = (SearchParserKeyWordOffset | SearchParserTextOffset) & {
    offsetStart: number;
    offsetEnd: number;
};
export declare type SearchParserKeyWordOffset = {
    keyword: string;
    value: string;
};
export declare type SearchParserTextOffset = {
    text: string;
};
export declare type SearchParserDictionary = {
    [key: string]: any;
};
export declare type SearchParserResult = SearchParserDictionary & {
    text: string | string[];
    offsets?: SearchParserOffset[];
    exclude?: SearchParserDictionary;
};
export declare function parse(string: string, options: SearchParserOptions): SearchParserResult | string;
