const SOURCE_URL = 'https://tw.stock.yahoo.com/future/futures.html';

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function toTextLines(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '\n')
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function parseNumber(value) {
  if (!value || value === '-') {
    return null;
  }

  const parsed = Number(String(value).replace(/,/g, '').replace(/%/g, '').replace(/[▲▼+]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRowLines(rowHtml) {
  return toTextLines(rowHtml).filter((line) => line !== '|');
}

function findTaiwanFutureRow(html) {
  const rowPattern = /<li class="List\(n\)">([\s\S]*?href="https:\/\/tw\.stock\.yahoo\.com\/future\/WTX(?:&amp;|&)"[\s\S]*?)<\/li>/;
  const match = html.match(rowPattern);
  if (!match) {
    throw new Error('missing WTX& quote row');
  }
  return match[1];
}

function parseTaiwanFuture(html) {
  const rowHtml = findTaiwanFutureRow(html);
  const lines = parseRowLines(rowHtml);
  const dateLine = toTextLines(html).find((line) => line.startsWith('資料時間：')) || '';
  const date = dateLine.replace('資料時間：', '').trim() || null;
  const start = lines.findIndex((line) => line === '台指期近一');

  if (start === -1) {
    throw new Error('missing 台指期近一 row label');
  }

  const values = lines.slice(start, start + 16);
  const price = parseNumber(values[4]);
  const changeValue = parseNumber(values[5]);
  const percentValue = parseNumber(values[6]);
  const volume = parseNumber(values[7]);
  const open = parseNumber(values[8]);
  const high = parseNumber(values[9]);
  const low = parseNumber(values[10]);
  const reference = parseNumber(values[12]);
  const trendFromReference = price !== null && reference !== null && price !== reference
    ? Math.sign(price - reference)
    : 0;
  const hasUpClass = rowHtml.includes('C($c-trend-up)');
  const hasDownClass = rowHtml.includes('C($c-trend-down)');
  const trendFromClass = hasUpClass && !hasDownClass ? 1 : hasDownClass && !hasUpClass ? -1 : 0;
  const trendFromValue = changeValue !== null && changeValue !== 0 ? Math.sign(changeValue) : 0;
  const direction = trendFromReference || trendFromClass || trendFromValue || 1;
  const change = changeValue === null ? null : Math.abs(changeValue) * direction;
  const percent = percentValue === null ? null : Math.abs(percentValue) * direction;
  const time = values[14] || null;

  if (price === null) {
    throw new Error('missing 台指期近一 price');
  }

  return {
    name: '台指期近一',
    symbol: values[1],
    price,
    change,
    percent,
    volume,
    open,
    high,
    low,
    reference,
    time,
    date
  };
}

export async function onRequestGet() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });

  if (!response.ok) {
    return Response.json(
      { error: `Yahoo futures HTTP ${response.status}` },
      { status: 502, headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const html = await response.text();
  let quote;
  try {
    quote = parseTaiwanFuture(html);
  } catch (error) {
    return Response.json(
      { error: error?.message || 'Yahoo futures parse failed' },
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







