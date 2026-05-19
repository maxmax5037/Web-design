const SOURCE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw&json=1&delay=0';

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

export async function onRequestGet() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://mis.twse.com.tw/stock/index.jsp'
    }
  });

  if (!response.ok) {
    return Response.json(
      { error: `TWSE MIS HTTP ${response.status}` },
      { status: 502, headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const payload = await response.json();
  const quote = payload.msgArray?.[0];
  if (payload.rtcode !== '0000' || !quote) {
    return Response.json(
      { error: payload.rtmessage || 'TWSE MIS missing quote' },
      { status: 502, headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const price = parseNumber(quote.z);
  const previousClose = parseNumber(quote.y);
  const high = parseNumber(quote.h);
  const low = parseNumber(quote.l);
  const open = parseNumber(quote.o);

  if (price === null || previousClose === null) {
    return Response.json(
      { error: 'TWSE MIS missing price' },
      { status: 502, headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const change = price - previousClose;
  const percent = previousClose ? (change / previousClose) * 100 : 0;

  return Response.json(
    {
      updatedAt: new Date().toISOString(),
      quote: {
        name: quote.n || '發行量加權股價指數',
        price,
        previousClose,
        change,
        percent,
        high,
        low,
        open,
        time: quote.t || quote['%'] || null,
        date: formatDate(quote.d || quote['^'])
      }
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
