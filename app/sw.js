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
const BUILD = "399cec2b1a70";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-6eaed4dbdfbd8f0a208164269aecbbbc.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-2f79819cbdfca3a6665e714de7854b7c.js","_expo/static/js/web/_layout-d6b1410f4c431c6ac273957f589d0c25.js","_expo/static/js/web/ajustes-bad2b63a0121db434ca35eede674d0b5.js","_expo/static/js/web/atividade-form-5af89b18f3c74b6cbb007bc64b45e27f.js","_expo/static/js/web/atividade-importar-ba201229ce797e47ebd93f8a0642f473.js","_expo/static/js/web/card-rapido-form-5e7d338df077f56cae5f537fae6c172f.js","_expo/static/js/web/cards-d8daf3052739db703d07c1e48df8360c.js","_expo/static/js/web/cidade-form-9cfe0419930926bc56f2f7a20e84120d.js","_expo/static/js/web/cidades-e08aff56b0aad574abe6cd4fc0382d41.js","_expo/static/js/web/como-funciona-2a73ba89b15d636f8349d1ca256477b2.js","_expo/static/js/web/compartilhar-7a2162833a9dcc1d1dba9fef90a2af51.js","_expo/static/js/web/configuracoes-f124248641470c64fa4b59e046dc5d4c.js","_expo/static/js/web/deslocamento-form-d3c0a226439c91a63e394e960e71195d.js","_expo/static/js/web/dia-a6ad1abf929a42faa9702f4c956aff6b.js","_expo/static/js/web/documento-form-f3b5bdb3c5ebe3191c5f88d3e8b3a290.js","_expo/static/js/web/documentos-7ea2fac70d17b119d9d105b7d72b116e.js","_expo/static/js/web/entry-71614f3261114fe9fe6d37ef08b037f6.js","_expo/static/js/web/explorar-1fea78a11313ddc0da2c0f99846088f6.js","_expo/static/js/web/favoritos-6494631edca7356369e854e14b66d31c.js","_expo/static/js/web/form-e247858ee0adf3377b491f20c3096b7f.js","_expo/static/js/web/hospedagem-form-2a34485e0e01e76696c77e9116eb7360.js","_expo/static/js/web/hospedagem-importar-15e5c8bbd8caee9be69700762df25eff.js","_expo/static/js/web/hospedagens-92a0c86b164e19daafa8aa224dbf6a40.js","_expo/static/js/web/index-17b1819d35f5121f5922e9ae5ae6211d.js","_expo/static/js/web/index-253e2eaaa4ccfad0fabd2b4bda359af1.js","_expo/static/js/web/index-70ca5c4310ffe12450d8557339e4ff99.js","_expo/static/js/web/index-778edc41cab2b5d4312949843c511897.js","_expo/static/js/web/index-cd610ca9bb7cf56c0a24410263fcd9e8.js","_expo/static/js/web/info-form-1c29bce7d58b0519cbce97b65152e2c9.js","_expo/static/js/web/instalar-12919370b2e8e4b8296c8b46bda00a32.js","_expo/static/js/web/lembrete-form-9dc69db1984570f3431dae1a38d95795.js","_expo/static/js/web/local-7589880145eecacc12354cd6c0084064.js","_expo/static/js/web/mapa-c2edf123a4b2f2df548455e243182734.js","_expo/static/js/web/mapa-d0d12784b1038d928e15386a2c413a0a.js","_expo/static/js/web/offline-5caed4948fdb81203f3f99bd2a03c343.js","_expo/static/js/web/organizar-30f2bd1f186be6fb530a23e8c52da611.js","_expo/static/js/web/otimizar-20d08e3af3b9bfaf93a6e4f9da2b01f3.js","_expo/static/js/web/passagem-importar-6483e52ce5fd969c6aa63fac78f0a25a.js","_expo/static/js/web/passagens-bc653bbb7772249f163b6502b77ef900.js","_expo/static/js/web/passeios-2e57d81d77fbdfa68faefa08dbab289b.js","_expo/static/js/web/pendentes-78aa29fb44e3de0736d60cc73061da62.js","_expo/static/js/web/proximidades-08a32a0bc23f102fc202a1b33622297e.js","_expo/static/js/web/roteiro-424b88311a3e13e0bdde65933fdbd1e5.js","_expo/static/js/web/servicos-3040eaf771fb064c0ba024dce14c42cc.js","_expo/static/js/web/sincronizacao-fe30aeca7e2933b58fd8ebbd85a01732.js","_expo/static/js/web/sugestoes-5fc55d631b60d61a3b9bbef2219107e0.js","_expo/static/js/web/transportes-4f44937c30d01768c8ef2ab62f9107c9.js","_expo/static/js/web/turismo-0c968338acc029d0a0e6959dced7a825.js","_expo/static/js/web/viagem-form-28db8e7ee31c317cac3c68208ec86717.js","_expo/static/js/web/voo-form-d43b2ab9d9d6013fdbcc2f07a86fa141.js","_expo/static/js/web/worker-6072129c8e2ebc0e7fa0d82162120e82.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","exceljs/LICENSE","exceljs/exceljs.bare.min.js","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs","sqljs/sql-wasm-browser.js","sqljs/sql-wasm-browser.wasm"];
const ESSENTIAL = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-6eaed4dbdfbd8f0a208164269aecbbbc.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/entry-71614f3261114fe9fe6d37ef08b037f6.js","favicon.ico","icons/apple-touch-icon.png","manifest.webmanifest"];
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
