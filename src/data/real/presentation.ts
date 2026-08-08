import type { CompanyNewsArticle, FilingData } from "./contracts.ts";

export type NewsPresentation = {
  id: string;
  title: string;
  publisher: string;
  publishedAt: string;
  sourceUrl: string | null;
  external: boolean;
};

export type FilingPresentation = {
  id: string;
  form: FilingData["formType"];
  title: string;
  filedAt: string;
  source: string;
  canonicalUrl: string | null;
};

export function presentNewsArticle(article: CompanyNewsArticle): NewsPresentation {
  const sourceUrl = article.sourceUrl.trim() || null;
  return {
    id: article.id,
    title: article.headline,
    publisher: article.publisher,
    publishedAt: article.publishedAt,
    sourceUrl,
    external: sourceUrl !== null,
  };
}

export function presentFiling(filing: FilingData): FilingPresentation {
  return {
    id: filing.accessionNumber,
    form: filing.formType,
    title: `${filing.formType} filing`,
    filedAt: filing.filingDate,
    source: filing.source,
    canonicalUrl: filing.canonicalUrl,
  };
}
