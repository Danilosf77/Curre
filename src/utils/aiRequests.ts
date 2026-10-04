// Page-memory cache only: no resume text in URLs, Analytics or persistent storage.
export function createAiRequestCache(fetcher: typeof fetch = fetch, now = Date.now) {
  const cache = new Map<string, {expires:number; value:unknown}>();
  return async function request<T>(url:string, body:unknown, signal?:AbortSignal, accept:(data:T) => boolean = () => true):Promise<T> {
    const serialized = JSON.stringify(body);
    const key = url + ':' + serialized;
    for (const [k, entry] of cache) if (entry.expires <= now()) cache.delete(k);
    const found = cache.get(key);
    if (signal?.aborted) throw new DOMException('Aborted','AbortError');
    if (found) return structuredClone(found.value) as T;
    const response = await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json'},body:serialized,signal});
    if (!response.ok) throw new Error(`API status ${response.status}`);
    const data:T = await response.json();
    if (!signal?.aborted && accept(data)) {
      if (cache.size >= 10) cache.delete(cache.keys().next().value!);
      cache.set(key,{expires:now()+15*60*1000,value:structuredClone(data)});
    }
    return data;
  };
}
export const requestAi = createAiRequestCache();
