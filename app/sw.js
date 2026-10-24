/* global ServiceWorkerGlobalScope */
/*
 * Service worker do NaviGO PWA (escrito à mão, sem workbox).
 *
 * 1. Isolamento entre origens: o banco local (expo-sqlite wasm) precisa de COOP/COEP e o GitHub
 *    Pages não define cabeçalhos; eles são acrescentados aqui. Trecho baseado no
 *    coi-serviceworker 0.1.7 (Guido Zuidhof e colaboradores, licença MIT), que este arquivo substitui.
 * 2. Abrir sem internet: só os arquivos do próprio app (mesma origem) vão para o cache. Respostas
 *    das APIs e dos mapas (outras origens) nunca são guardadas aqui; elas seguem as regras de cache
 *    do app (SQLite).
 * 3. Atualização: a versão nova instala e espera; o app mostra "Nova versão disponível — toque para
 *    atualizar" e só troca quando o usuário toca (mensagem SKIP_WAITING).
 *
 * No build (scripts/generate-sw.mjs), BUILD, PRECACHE e ESSENTIAL são preenchidos com a versão, a
 * lista de arquivos e os que a página carrega ao abrir. Sem eles (servidor de desenvolvimento), tudo
 * vai primeiro à rede e o cache é só reserva.
 *
 * A instalação guarda só o essencial (ESSENTIAL), para a primeira abertura no celular não esperar
 * o app inteiro; o resto (PRECACHE) é guardado depois, quando a página pede (mensagem PRECACHE).
 */
const BUILD = "2944789b4417";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-965f6eaf23125d68744ff986f4bcef9c.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-0c54ab4b858d6ff15ed90d1fa3b2d284.js","_expo/static/js/web/_layout-8baa477904e3950b0eee5b6a42c9835b.js","_expo/static/js/web/ajustes-1bca3ba3b116aae70c52d07b4182d456.js","_expo/static/js/web/atividade-form-8c039d9ecb7595b5499d1301add955cf.js","_expo/static/js/web/atividade-importar-17ad6481214177a3a302608acaebb4a5.js","_expo/static/js/web/cidade-form-eea041536a039984e980bd3f9138a6da.js","_expo/static/js/web/cidades-2a4058f560113b80178687f8e32c6d01.js","_expo/static/js/web/como-funciona-36ae611980921d6cf06e2c07f9247904.js","_expo/static/js/web/compartilhar-0724328d9c4055717413554968f3e43c.js","_expo/static/js/web/configuracoes-fa3da4f9587dcd69b15de77b61664aaa.js","_expo/static/js/web/deslocamento-form-b057e3b4249a2321ffafa3e3ed84f1a5.js","_expo/static/js/web/dia-6fd3851cfc017262009c0c5df7757aa1.js","_expo/static/js/web/documento-form-0c63ad60cbe646b9c08b5de83d90f95f.js","_expo/static/js/web/documentos-3836d82d1686ad7cfebac2fe49c784d9.js","_expo/static/js/web/entry-4ac2a99aae3e26686fc784955acb82aa.js","_expo/static/js/web/explorar-3a4fb5f8df9b10955367d281b023cdb0.js","_expo/static/js/web/favoritos-2843969cf2a4178fc82b3bb10350e067.js","_expo/static/js/web/form-9ccd6bf5824758cbb5bc854bff4bbc8e.js","_expo/static/js/web/hospedagem-form-8172fe5aedd65556a59ca4b596fd0d63.js","_expo/static/js/web/hospedagem-importar-aee3da8198c39d1d06fd7c91d839318a.js","_expo/static/js/web/hospedagens-6335475c371033c0147b83a147bdf745.js","_expo/static/js/web/index-096e64cdd1bce0f43266dedf5780271d.js","_expo/static/js/web/index-635d07322d28f6d0b14b3551df66f36f.js","_expo/static/js/web/index-92537e70c705717f2666b40acb78eea9.js","_expo/static/js/web/index-972417d4d1ac97d663ff00b1897723b9.js","_expo/static/js/web/index-ce239429612d1573bb6e4718a5a63d42.js","_expo/static/js/web/info-form-4c5ae051498c6637d97dfa2bbc4b37da.js","_expo/static/js/web/instalar-10d4e5550ba0a7fb2031a84cbac32a30.js","_expo/static/js/web/lembrete-form-4843a4ca7e4a56795b81cd8f2b6658aa.js","_expo/static/js/web/local-0aa2906b603d9fe732fdd1e80afeba3f.js","_expo/static/js/web/mapa-25f311892efdf6a76c5be69ce91f5224.js","_expo/static/js/web/mapa-c90f76adbd46216b4faf56c535c0276b.js","_expo/static/js/web/offline-e8ea1334426a288bd597c46377c25ddc.js","_expo/static/js/web/organizar-c9233937a1aed0896c44f7ef5da02320.js","_expo/static/js/web/otimizar-c187feaa86cc75cfb2b54980aca19730.js","_expo/static/js/web/passagem-importar-85820499c4657165bb39d37622e9734b.js","_expo/static/js/web/passagens-25828746499f64cdf942a07004c307bb.js","_expo/static/js/web/passeios-ffe19763a1986c993f4f01ba96465251.js","_expo/static/js/web/pendentes-ab6b9d1ff5495c6f708d0887f5ef93b8.js","_expo/static/js/web/proximidades-89f086d53454111f201db1f6881eb28f.js","_expo/static/js/web/roteiro-b7dad2a7b18906e224ac607518ba764b.js","_expo/static/js/web/servicos-a42e8ef1739f33029a5bc2b3f3071539.js","_expo/static/js/web/sincronizacao-70d9e486d900124a6b2e1d09f42fb861.js","_expo/static/js/web/sugestoes-ad14a75db8b69ff9f21c3c6228e53752.js","_expo/static/js/web/transportes-d91ca1e8e21e7d5cace443e9f8613868.js","_expo/static/js/web/turismo-d39b1fd5853d5fb66ccf4b376dba8283.js","_expo/static/js/web/viagem-form-d2be958e4efcb6df12af309ffa91db7a.js","_expo/static/js/web/voo-form-0cd899f3d3bb50287f4f8246a8f13f31.js","_expo/static/js/web/worker-e766fd1b13f03ed65315622d5e4e10f8.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","exceljs/LICENSE","exceljs/exceljs.bare.min.js","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs","sqljs/sql-wasm-browser.js","sqljs/sql-wasm-browser.wasm"];
const ESSENTIAL = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-965f6eaf23125d68744ff986f4bcef9c.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/entry-4ac2a99aae3e26686fc784955acb82aa.js","favicon.ico","icons/apple-touch-icon.png","manifest.webmanifest"];
const DEV = BUILD.startsWith('__');
const CACHE_PREFIX = 'navigo-app-';
const CACHE = CACHE_PREFIX + (DEV ? 'dev' : BUILD);
/** Página única do app (saída `single` do Expo): serve para qualquer rota sem internet. */
const SHELL = './';

/**
 * Como tratar cada pedido:
 * - `bypass`: o navegador busca sozinho (seletor do Google, fora do isolamento);
 * - `network`: rede com os cabeçalhos de isolamento, sem cache (outras origens, não-GET);
 * - `shell`: navegação no build, página do app do cache (rede se faltar);
 * - `cache-first`: arquivo do app no build, cache primeiro;
 * - `network-first`: desenvolvimento, rede primeiro e cache se estiver sem internet.
 */
function route(request, scope, dev) {
  const url = new URL(request.url);
  // NaviGO: a página do seletor do Google fica fora do isolamento (ver google-picker.html).
  // A volta dela para o app (navegação) segue isolada; só ela e os arquivos que ela carrega não.
  const fromPicker =
    request.mode !== 'navigate' && /\/google-picker\.html(\?|$)/.test(request.referrer || '');
  if (/\/google-picker\.html$/.test(url.pathname) || fromPicker) return 'bypass';
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return 'bypass';
  if (request.method !== 'GET' || !url.href.startsWith(scope)) return 'network';
  if (request.headers && request.headers.has && request.headers.has('range')) return 'network';
  if (dev) return 'network-first';
  return request.mode === 'navigate' ? 'shell' : 'cache-first';
}

/** Arquivos do build a guardar já na instalação, relativos ao escopo do service worker. */
function precacheUrls(scope, list) {
  return [SHELL, ...list].map((p) => new URL(p, scope).href);
}

if (typeof module !== 'undefined') module.exports = { route, precacheUrls };

if (typeof ServiceWorkerGlobalScope !== 'undefined' && self instanceof ServiceWorkerGlobalScope) {
  let coepCredentialless = false;

  const isolate = (response) => {
    if (response.status === 0) return response;
    const headers = new Headers(response.headers);
    headers.set(
      'Cross-Origin-Embedder-Policy',
      coepCredentialless ? 'credentialless' : 'require-corp',
    );
    if (!coepCredentialless) headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };

  // Os cabeçalhos entram na hora de responder (não no cache): o modo de COEP depende do navegador.
  const fromNetwork = (request) =>
    fetch(
      coepCredentialless && request.mode === 'no-cors'
        ? new Request(request, { credentials: 'omit' })
        : request,
    );

  /** Busca na rede e guarda uma cópia se for resposta completa do próprio app. */
  const fetchAndStore = async (request, key) => {
    const response = await fromNetwork(request);
    if (response.ok && response.status === 200 && response.type !== 'opaque') {
      const cache = await caches.open(CACHE);
      await cache.put(key || request, response.clone());
    }
    return response;
  };

  const shellKey = () => new URL(SHELL, self.registration.scope).href;

  // `no-cache`: confere com o servidor, mas reaproveita o que a página acabou de baixar (304).
  const download = (href) => fromNetwork(new Request(href, { cache: 'no-cache' }));

  /** Guarda os arquivos que ainda faltam no cache; falha em um não impede os outros. */
  const storeMissing = async (list) => {
    const cache = await caches.open(CACHE);
    for (const href of precacheUrls(self.registration.scope, list)) {
      if (await cache.match(href)) continue;
      try {
        const response = await download(href);
        if (response.ok) await cache.put(href, response);
      } catch {
        // sem internet agora: tenta de novo na próxima abertura
      }
    }
  };

  self.addEventListener('install', (event) => {
    event.waitUntil(
      (async () => {
        if (!DEV) {
          const cache = await caches.open(CACHE);
          for (const href of precacheUrls(self.registration.scope, ESSENTIAL)) {
            const response = await download(href);
            if (!response.ok) throw new Error(`Falha ao guardar ${href}: ${response.status}`);
            await cache.put(href, response);
          }
        }
        // Primeira troca do antigo coi-serviceworker por este: não há versão anterior a preservar.
        const active = self.registration.active;
        if (active && !/\/sw\.js$/.test(active.scriptURL)) await self.skipWaiting();
      })(),
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      (async () => {
        for (const key of await caches.keys()) {
          if (key.startsWith(CACHE_PREFIX) && key !== CACHE) await caches.delete(key);
        }
        await self.clients.claim();
      })(),
    );
  });

  self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'coepCredentialless') coepCredentialless = event.data.value;
    else if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
    else if (event.data.type === 'PRECACHE' && !DEV) event.waitUntil(storeMissing(PRECACHE));
  });

  self.addEventListener('fetch', (event) => {
    const request = event.request;
    const how = route(request, self.registration.scope, DEV);
    if (how === 'bypass') return;
    if (how === 'network') {
      event.respondWith(fromNetwork(request).then(isolate));
      return;
    }
    if (how === 'shell') {
      event.respondWith(
        caches
          .match(shellKey())
          .then((hit) => hit || fetchAndStore(new Request(shellKey()), shellKey()))
          .then(isolate),
      );
      return;
    }
    if (how === 'cache-first') {
      event.respondWith(
        caches
          .match(request)
          .then((hit) => hit || fetchAndStore(request))
          .then(isolate),
      );
      return;
    }
    // network-first
    const key = request.mode === 'navigate' ? shellKey() : request;
    event.respondWith(
      fetchAndStore(request, key)
        .catch(async () => {
          const hit = await caches.match(key);
          if (hit) return hit;
          throw new Error('Sem internet e sem cópia guardada');
        })
        .then(isolate),
    );
  });
}
