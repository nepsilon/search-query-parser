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
  text?: string;
  offsets?: SearchParserOffset[];
  exclude?: ISearchParserDictionary;
}

export function parse(string: string, options?: SearchParserOptions): string | SearchParserResult;
