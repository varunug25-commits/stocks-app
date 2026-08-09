import type { CompanyIdentity, NormalizedResponse, SecFiling } from "../contracts.ts";
import { ProviderError, errorFromStatus, toProviderError } from "../errors.ts";
import { nullableString, recordValue, requiredString } from "./normalization.ts";
import type { FilingsProvider } from "./types.ts";

type Fetcher = typeof fetch;
const supportedForms = new Set(["10-K", "10-Q", "8-K"]);
let nextSecRequestAt = 0;

async function reserveSecRequestSlot(minimumIntervalMs: number) {
  const now = Date.now();
  const slot = Math.max(now, nextSecRequestAt);
  nextSecRequestAt = slot + minimumIntervalMs;
  const wait = slot - now;
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
}

export function normalizeSecSubmissions(payload: unknown, company: CompanyIdentity): SecFiling[] {
  const root = recordValue(payload, "SEC submissions");
  const filings = recordValue(root.filings, "SEC filings");
  const recent = recordValue(filings.recent, "SEC recent filings");
  const accessionNumbers = recent.accessionNumber;
  const forms = recent.form;
  const filingDates = recent.filingDate;
  const reportDates = recent.reportDate;
  const primaryDocuments = recent.primaryDocument;
  if (![accessionNumbers, forms, filingDates, reportDates, primaryDocuments].every(Array.isArray))
    throw new ProviderError("MALFORMED_RESPONSE", "SEC submissions arrays are incomplete.");
  const cik = requiredString(root.cik, "CIK").padStart(10, "0");
  return (accessionNumbers as unknown[]).flatMap((accession, index) => {
    const form = (forms as unknown[])[index];
    if (typeof form !== "string" || !supportedForms.has(form)) return [];
    const accessionNumber = requiredString(accession, "accession number");
    const primaryDocument = requiredString((primaryDocuments as unknown[])[index], "primary document");
    const compactAccession = accessionNumber.replaceAll("-", "");
    const numericCik = String(Number(cik));
    return [{
      accessionNumber,
      formType: form as SecFiling["formType"],
      filingDate: requiredString((filingDates as unknown[])[index], "filing date"),
      reportDate: nullableString((reportDates as unknown[])[index]),
      companyId: company.id,
      company: requiredString(root.name, "company name"),
      cik,
      primaryDocument,
      canonicalUrl: `https://www.sec.gov/Archives/edgar/data/${numericCik}/${compactAccession}/${primaryDocument}`,
      source: "SEC" as const,
    }];
  });
}

export function resolveSecCompany(payload: unknown, symbol: string) {
  const root = recordValue(payload, "SEC company ticker directory");
  for (const value of Object.values(root)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const record = value as Record<string, unknown>;
    if (nullableString(record.ticker)?.toUpperCase() !== symbol) continue;
    const cik = String(record.cik_str ?? "").replace(/\D/g, "").padStart(10, "0");
    if (!/^\d{10}$/.test(cik)) break;
    return { cik, name: nullableString(record.title) };
  }
  throw new ProviderError("NOT_FOUND", "No SEC company record is available for this symbol.", 404);
}

export class SecEdgarProvider implements FilingsProvider {
  private readonly userAgent: string | undefined;
  private readonly fetcher: Fetcher;
  private readonly minimumIntervalMs: number;
  constructor(
    userAgent: string | undefined,
    fetcher: Fetcher = fetch,
    minimumIntervalMs = 150,
  ) {
    this.userAgent = userAgent;
    this.fetcher = fetcher;
    this.minimumIntervalMs = minimumIntervalMs;
  }
  async getFilings(company: CompanyIdentity): Promise<NormalizedResponse<SecFiling[]>> {
    if (!this.userAgent)
      throw new ProviderError("MISSING_SECRET", "SEC_USER_AGENT is not configured.", 503);
    let resolvedCompany = company;
    if (!company.cik) {
      await reserveSecRequestSlot(this.minimumIntervalMs);
      let directoryResponse: Response;
      try {
        directoryResponse = await this.fetcher("https://www.sec.gov/files/company_tickers.json", {
          headers: { "User-Agent": this.userAgent, Accept: "application/json" },
        });
      } catch (error) {
        throw toProviderError(error, "SEC EDGAR");
      }
      if (!directoryResponse.ok) throw errorFromStatus(directoryResponse.status, "SEC EDGAR");
      let directory: unknown;
      try { directory = await directoryResponse.json() as unknown; } catch {
        throw new ProviderError("MALFORMED_RESPONSE", "SEC company directory returned unreadable JSON.");
      }
      const match = resolveSecCompany(directory, company.symbol);
      resolvedCompany = { ...company, cik: match.cik, name: match.name ?? company.name };
    }
    await reserveSecRequestSlot(this.minimumIntervalMs);
    const fetchedAt = new Date().toISOString();
    let response: Response;
    try {
      response = await this.fetcher(`https://data.sec.gov/submissions/CIK${resolvedCompany.cik}.json`, {
        headers: { "User-Agent": this.userAgent, Accept: "application/json" },
      });
    } catch (error) {
      throw toProviderError(error, "SEC EDGAR");
    }
    if (!response.ok) throw errorFromStatus(response.status, "SEC EDGAR");
    let payload: unknown;
    try {
      payload = await response.json() as unknown;
    } catch {
      throw new ProviderError("MALFORMED_RESPONSE", "SEC EDGAR returned unreadable JSON.");
    }
    const data = normalizeSecSubmissions(payload, resolvedCompany);
    return { data, meta: { source: "SEC EDGAR submissions API", provider: "sec-edgar", fetchedAt, asOf: data[0]?.filingDate ?? null, isStale: false } };
  }
}
