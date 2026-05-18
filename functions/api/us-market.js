const INDICES = [
  { key: 'dji', symbol: '^DJI', name: '道瓊指數' },
  { key: 'ixic', symbol: '^IXIC', name: 'NASDAQ' },
  { key: 'gspc', symbol: '^GSPC', name: 'S&P 500' },
  { key: 'sox', symbol: '^SOX', name: '費城半導體' }
];

async function fetchQuote(item) {
  const encoded = encodeURIComponent(item.symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?range=1d&interval=1m`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Yahoo ${item.symbol} HTTP ${response.status}`);
  }

  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta || typeof meta.regularMarketPrice !== 'number') {
    throw new Error(`Yahoo ${item.symbol} missing quote`);
  }

  const previousClose = meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice;
  const price = meta.regularMarketPrice;
  const change = price - previousClose;
  const percent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    key: item.key,
    symbol: item.symbol,
    name: item.name,
    price,
    change,
    percent,
    marketTime: meta.regularMarketTime || null,
    currency: meta.currency || 'USD'
  };
}

export async function onRequestGet() {
  const results = await Promise.allSettled(INDICES.map(fetchQuote));
  const quotes = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  const errors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason?.message || 'unknown error');

  return Response.json(
    {
      updatedAt: new Date().toISOString(),
      quotes,
      errors
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
