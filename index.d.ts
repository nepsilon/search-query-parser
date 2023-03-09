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
  negatePrefix?: string;
}

export interface ISearchParserDictionary {
  [key: string]: any;
}

export type SearchParserOffset = (SearchParserKeyWordOffset | SearchParserTextOffset) & {
  offsetStart: number;
  offsetEnd: number;
}

export type SearchParserKeyWordOffset = {
  keyword: string;
  value?: string;

}

export type SearchParserTextOffset = {
  text: string;
}

export interface SearchParserResult extends ISearchParserDictionary {
  text?: string | string[];
  offsets?: SearchParserOffset[];
  exclude?: ISearchParserDictionary;
}

export function parse(string: string, options?: SearchParserOptions & {
  tokenize: false
}): string;
export function parse(string: string, options?: SearchParserOptions & {
  tokenize: true
}): SearchParserResult & {
  text?: string[]
};
export function parse(string: string, options?: SearchParserOptions): string | SearchParserResult;

export function stringify(searchParserResult: string | SearchParserResult, options?: SearchParserOptions): string;
