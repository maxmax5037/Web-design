const FUNDS = [
  {
    code: '1205',
    name: '統一奔騰基金',
    shortName: '統一奔騰基金',
    url: 'https://wealth.esunbank.com/zh-tw/fund/fund-info?fundCode=1205'
  },
  {
    code: '2531',
    name: '安聯台灣科技基金',
    shortName: '安聯科技基金',
    url: 'https://wealth.esunbank.com/zh-tw/fund/fund-info?fundCode=2531'
  }
];

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
  const parsed = Number(String(value || '').replace(/,/g, '').replace(/%/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseFund(html, fund) {
  const lines = toTextLines(html);
  const codeIndex = lines.findIndex((line) => line === fund.code);
  const nameIndex = lines.findIndex((line, index) => index > codeIndex && line === fund.name);
  const start = nameIndex === -1 ? codeIndex : nameIndex;

  if (start === -1) {
    throw new Error(`missing fund ${fund.code}`);
  }

  const dateIndex = lines.findIndex((line, index) => index > start && line.includes('最新淨值日期'));
  if (dateIndex === -1) {
    throw new Error(`missing fund date ${fund.code}`);
  }

  const nav = parseNumber(lines[dateIndex - 3]);
  const changePercent = parseNumber(lines[dateIndex - 1]);
  const date = (lines[dateIndex + 1] || '').match(/\(([^)]+)\)/)?.[1] || null;

  if (nav === null || changePercent === null) {
    throw new Error(`missing fund quote ${fund.code}`);
  }

  return {
    code: fund.code,
    name: fund.name,
    shortName: fund.shortName,
    nav,
    changePercent,
    date,
    currency: '新臺幣',
    url: fund.url
  };
}

async function fetchFund(fund) {
  const response = await fetch(fund.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });

  if (!response.ok) {
    throw new Error(`ESUN ${fund.code} HTTP ${response.status}`);
  }

  return parseFund(await response.text(), fund);
}

export async function onRequestGet() {
  const results = await Promise.allSettled(FUNDS.map(fetchFund));
  const funds = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  const errors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason?.message || 'unknown error');

  return Response.json(
    {
      updatedAt: new Date().toISOString(),
      funds,
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

