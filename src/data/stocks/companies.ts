export type StockSymbol =
  | "AAPL"
  | "MSFT"
  | "NVDA"
  | "TSLA"
  | "AMZN"
  | "GOOGL"
  | "META"
  | "AMD"
  | "PLTR"
  | "NFLX";
export type Company = {
  symbol: StockSymbol;
  name: string;
  sector: string;
  exchange: string;
  logoColor: string;
  description: string;
};

export const companies: Company[] = [
  {
    symbol: "AAPL",
    name: "Apple",
    sector: "Technology",
    exchange: "NASDAQ",
    logoColor: "#7D8790",
    description: "Consumer devices, software and services.",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    sector: "Technology",
    exchange: "NASDAQ",
    logoColor: "#1B8FEB",
    description: "Cloud software, productivity and AI infrastructure.",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    sector: "Semiconductors",
    exchange: "NASDAQ",
    logoColor: "#76B900",
    description: "Accelerated computing platforms and graphics processors.",
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    sector: "Consumer",
    exchange: "NASDAQ",
    logoColor: "#D83B3E",
    description: "Electric vehicles, energy storage and charging.",
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    sector: "Consumer",
    exchange: "NASDAQ",
    logoColor: "#E49A25",
    description: "Commerce, cloud infrastructure and digital media.",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    sector: "Communication",
    exchange: "NASDAQ",
    logoColor: "#4A73C9",
    description: "Search, advertising, cloud and digital platforms.",
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    sector: "Communication",
    exchange: "NASDAQ",
    logoColor: "#3970C7",
    description: "Social platforms, advertising and spatial computing.",
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    sector: "Semiconductors",
    exchange: "NASDAQ",
    logoColor: "#35799C",
    description: "High-performance processors and data-center accelerators.",
  },
  {
    symbol: "PLTR",
    name: "Palantir",
    sector: "Technology",
    exchange: "NASDAQ",
    logoColor: "#5A5FCC",
    description: "Enterprise software for operational decision-making.",
  },
  {
    symbol: "NFLX",
    name: "Netflix",
    sector: "Communication",
    exchange: "NASDAQ",
    logoColor: "#D43535",
    description: "Global subscription entertainment and advertising.",
  },
];
export const companyBySymbol = Object.fromEntries(
  companies.map((company) => [company.symbol, company]),
) as Record<StockSymbol, Company>;
export function isStockSymbol(value: unknown): value is StockSymbol {
  return typeof value === "string" && value in companyBySymbol;
}
