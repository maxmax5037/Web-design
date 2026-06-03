const TWSE_SOURCE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw&json=1&delay=0';
const YAHOO_SOURCE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/%5ETWII?range=1d&interval=1m';

function parseNumber(value) {
  const parsed = Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value) {
  if (!value || value.length !== 8) {
    return value || null;
  }
  return `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)}`;
}

function formatTaipeiTimestamp(timestamp, format) {
  if (!timestamp) {
    return null;
  }

  const parts = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date(timestamp * 1000));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  if (format === 'date') {
    return `${values.year}/${values.month}/${values.day}`;
  }
  return `${values.hour}:${values.minute}:${values.second}`;
}

async function fetchTwseQuote() {
  const response = await fetch(TWSE_SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://mis.twse.com.tw/stock/index.jsp'
    }
  });

  if (!response.ok) {
    throw new Error(`TWSE MIS HTTP ${response.status}`);
  }

  const payload = await response.json();
  const quote = payload.msgArray?.[0];
  if (payload.rtcode !== '0000' || !quote) {
    throw new Error(payload.rtmessage || 'TWSE MIS missing quote');
  }

  const price = parseNumber(quote.z);
  const previousClose = parseNumber(quote.y);
  const high = parseNumber(quote.h);
  const low = parseNumber(quote.l);
  const open = parseNumber(quote.o);

  if (price === null || previousClose === null) {
    throw new Error('TWSE MIS missing price');
  }

  const change = price - previousClose;
  const percent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    name: quote.n || '發行量加權股價指數',
    source: '臺灣證券交易所 MIS 即時行情',
    price,
    previousClose,
    change,
    percent,
    high,
    low,
    open,
    time: quote.t || quote['%'] || null,
    date: formatDate(quote.d || quote['^'])
  };
}

async function fetchYahooQuote() {
  const response = await fetch(YAHOO_SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance HTTP ${response.status}`);
  }

  const payload = await response.json();
  const meta = payload.chart?.result?.[0]?.meta;
  if (!meta) {
    throw new Error('Yahoo Finance missing quote');
  }

  const price = parseNumber(meta.regularMarketPrice);
  const previousClose = parseNumber(meta.chartPreviousClose ?? meta.previousClose);
  const high = parseNumber(meta.regularMarketDayHigh);
  const low = parseNumber(meta.regularMarketDayLow);
  const open = parseNumber(meta.regularMarketDayLow);

  if (price === null || previousClose === null) {
    throw new Error('Yahoo Finance missing price');
  }

  const change = price - previousClose;
  const percent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    name: '發行量加權股價指數',
    source: 'Yahoo Finance 備援資料',
    price,
    previousClose,
    change,
    percent,
    high,
    low,
    open,
    time: formatTaipeiTimestamp(meta.regularMarketTime, 'time'),
    date: formatTaipeiTimestamp(meta.regularMarketTime, 'date')
  };
}

export async function onRequestGet() {
  const errors = [];
  let quote;

  try {
    quote = await fetchTwseQuote();
  } catch (error) {
    errors.push(error?.message || 'TWSE MIS failed');
  }

  if (!quote) {
    try {
      quote = await fetchYahooQuote();
    } catch (error) {
      errors.push(error?.message || 'Yahoo Finance failed');
    }
  }

  if (!quote) {
    return Response.json(
      { error: errors.join('；') || 'Taiwan market data failed' },
      { status: 502, headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  return Response.json(
    {
      updatedAt: new Date().toISOString(),
      quote
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
