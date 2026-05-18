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

  const parsed = Number(String(value).replace(/,/g, '').replace(/%/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTaiwanFuture(lines) {
  const dateLine = lines.find((line) => line.startsWith('資料時間：')) || '';
  const date = dateLine.replace('資料時間：', '').trim() || null;
  const start = lines.findIndex((line) => line === '台指期近一');

  if (start === -1) {
    throw new Error('missing 台指期近一 row');
  }

  const values = lines.slice(start, start + 16);
  const price = parseNumber(values[4]);
  const change = parseNumber(values[5]);
  const percent = parseNumber(values[6]);
  const volume = parseNumber(values[7]);
  const open = parseNumber(values[8]);
  const high = parseNumber(values[9]);
  const low = parseNumber(values[10]);
  const reference = parseNumber(values[12]);
  const time = values[14] || null;

  if (price === null) {
    throw new Error('missing 台指期近一 price');
  }

  return {
    name: values[0],
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
  const quote = parseTaiwanFuture(toTextLines(html));

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


