// @file
// Type definitions for search-query-parser.
// Project: https://github.com/nepsilon/search-query-parser
// Definitions by: Geoffrey Roberts <g.roberts@blackicemedia.com>
// Definitions: https://github.com/nepsilon/search-query-parser

export interface SearchParserOptions {
  offsets?: boolean;
  tokenize?: boolean;
  keywords?: string[];
  ranges?: string[];
  alwaysArray?: boolean;
}

export interface ISearchParserDictionary {
  [key: string]: any;
}

export interface SearchParserOffset {
  keyword: string;
  value?: string;
  offsetStart: number;
  offsetEnd: number;
}

export interface SearchParserResult extends ISearchParserDictionary {
  text?: string | string[];
  offsets?: SearchParserOffset[];
  exclude?: ISearchParserDictionary;
}

export function parse(string: string, options?: SearchParserOptions): string | SearchParserResult;
