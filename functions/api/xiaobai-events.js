const STORAGE_KEY = 'calendar-events';
const PASSWORD = '0912';

function response(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Xiaobai-Password',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    }
  });
}

function isAuthorized(request) {
  return request.headers.get('X-Xiaobai-Password') === PASSWORD;
}

function getStore(env) {
  return env.XIAOBAI_EVENTS;
}

async function readEvents(store) {
  return (await store.get(STORAGE_KEY, 'json')) || [];
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Xiaobai-Password',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    }
  });
}

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request)) {
    return response({ error: 'unauthorized' }, 401);
  }

  const store = getStore(env);
  if (!store) {
    return response({ error: 'missing XIAOBAI_EVENTS KV binding' }, 503);
  }

  return response({ events: await readEvents(store) });
}

export async function onRequestPost({ request, env }) {
  if (!isAuthorized(request)) {
    return response({ error: 'unauthorized' }, 401);
  }

  const store = getStore(env);
  if (!store) {
    return response({ error: 'missing XIAOBAI_EVENTS KV binding' }, 503);
  }

  const input = await request.json();
  const person = input.person === 'white' || input.person === 'gold' ? input.person : '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(input.date || '')) ? input.date : '';
  const text = String(input.text || '').trim().slice(0, 80);

  if (!person || !date || !text) {
    return response({ error: 'invalid event' }, 400);
  }

  const events = await readEvents(store);
  const event = {
    id: crypto.randomUUID(),
    person,
    date,
    text,
    createdAt: new Date().toISOString()
  };
  events.push(event);
  await store.put(STORAGE_KEY, JSON.stringify(events));

  return response({ event, events }, 201);
}

export async function onRequestDelete({ request, env }) {
  if (!isAuthorized(request)) {
    return response({ error: 'unauthorized' }, 401);
  }

  const store = getStore(env);
  if (!store) {
    return response({ error: 'missing XIAOBAI_EVENTS KV binding' }, 503);
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return response({ error: 'missing id' }, 400);
  }

  const events = await readEvents(store);
  const nextEvents = events.filter((event) => event.id !== id);
  await store.put(STORAGE_KEY, JSON.stringify(nextEvents));

  return response({ events: nextEvents });
}
