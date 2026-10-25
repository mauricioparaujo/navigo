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
const BUILD = "9261769eeadd";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-65888701bce886b9624642e42c47fcd4.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-2d01f882ce5950e87b4d5652e9fe8d51.js","_expo/static/js/web/_layout-2f79819cbdfca3a6665e714de7854b7c.js","_expo/static/js/web/ajustes-bad2b63a0121db434ca35eede674d0b5.js","_expo/static/js/web/atividade-form-ceb12cc9042a8c454c6514aa2f708818.js","_expo/static/js/web/atividade-importar-07e17cdb9dd8ea272734863f340ea663.js","_expo/static/js/web/card-rapido-form-d5c740a7fa05d1e639a76b06a3cecd83.js","_expo/static/js/web/cards-74cc485241ac6a83c709fd843f500bc5.js","_expo/static/js/web/cidade-form-4a67f10ab65e78060b9b3471a1f0a0c2.js","_expo/static/js/web/cidades-cb5f3a203edfc3926836714454cc9da0.js","_expo/static/js/web/como-funciona-f6438dfd8431b68912c236ad8501f759.js","_expo/static/js/web/compartilhar-5b782b13fffa912e8166b8a34cbc939e.js","_expo/static/js/web/configuracoes-f124248641470c64fa4b59e046dc5d4c.js","_expo/static/js/web/deslocamento-form-d95adbcaadb8d5cb54323b8569d4abdd.js","_expo/static/js/web/dia-a6ad1abf929a42faa9702f4c956aff6b.js","_expo/static/js/web/documento-form-f3d9a2da8bafa5627e5ff1207cfdd0c3.js","_expo/static/js/web/documentos-7ea2fac70d17b119d9d105b7d72b116e.js","_expo/static/js/web/entry-381e73f3650d229245dceb1381a80522.js","_expo/static/js/web/explorar-53a448053a7e2ae81c489fe8db3434f3.js","_expo/static/js/web/favoritos-6494631edca7356369e854e14b66d31c.js","_expo/static/js/web/form-e247858ee0adf3377b491f20c3096b7f.js","_expo/static/js/web/hospedagem-form-c1ee61d7291b701c0031f0614398ffbf.js","_expo/static/js/web/hospedagem-importar-1cd99126f59670529a376287f4ddfa0e.js","_expo/static/js/web/hospedagens-92a0c86b164e19daafa8aa224dbf6a40.js","_expo/static/js/web/index-0c90d416522ee0fc343b26570c636b9e.js","_expo/static/js/web/index-43acfbbeec08dbd3adce5fc8ede56454.js","_expo/static/js/web/index-7c936db7c77da8ff6b0ff38b9ce2b844.js","_expo/static/js/web/index-bd809ea20d2f243ddabe705a78f88cb7.js","_expo/static/js/web/index-c7868e5951b48b4895d487cf00cb3717.js","_expo/static/js/web/info-form-0450952bd1f464a0ce67cb2737dae2c7.js","_expo/static/js/web/instalar-12919370b2e8e4b8296c8b46bda00a32.js","_expo/static/js/web/lembrete-form-9dc69db1984570f3431dae1a38d95795.js","_expo/static/js/web/local-143797989678b80267cfe4236a3e8449.js","_expo/static/js/web/mapa-9ad171c22ddb23cc4952816e5bb3bc59.js","_expo/static/js/web/mapa-d3cc2c22dc720eaf853a9c12c599903f.js","_expo/static/js/web/offline-4843a9b19e10dce8de4461826db73ebf.js","_expo/static/js/web/organizar-30f2bd1f186be6fb530a23e8c52da611.js","_expo/static/js/web/otimizar-5108591969f2cd7b2e35ac57be47ec13.js","_expo/static/js/web/passagem-importar-ac4db5fe8a0d7417cfed827384f18c65.js","_expo/static/js/web/passagens-972b11baf5a095b9a27c292395487024.js","_expo/static/js/web/passeios-2e57d81d77fbdfa68faefa08dbab289b.js","_expo/static/js/web/pendentes-ea604d154ac890df00109bef7a3aba56.js","_expo/static/js/web/proximidades-6e8a6c80402fb35877342b0cd96b92c8.js","_expo/static/js/web/roteiro-424b88311a3e13e0bdde65933fdbd1e5.js","_expo/static/js/web/servicos-82da70c2ffab987b9ee6bb2d22a4d796.js","_expo/static/js/web/sincronizacao-9c531af04727566d497609cdc8e2b422.js","_expo/static/js/web/sugestoes-431e0aa849fda6dd46367b053bd50a74.js","_expo/static/js/web/transportes-30a40e05d17c52d0b85dbc41d366f7f0.js","_expo/static/js/web/turismo-72f2934abf3d3fc7477aa781eeae1b0d.js","_expo/static/js/web/viagem-form-03d3fe3bc2397a9918cc2d6f2b5457d7.js","_expo/static/js/web/voo-form-cda6731a975935b119e4b52c14704377.js","_expo/static/js/web/worker-c7f9836d1efebbf6757c6c61188e7232.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","exceljs/LICENSE","exceljs/exceljs.bare.min.js","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs","sqljs/sql-wasm-browser.js","sqljs/sql-wasm-browser.wasm"];
const ESSENTIAL = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-65888701bce886b9624642e42c47fcd4.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/entry-381e73f3650d229245dceb1381a80522.js","favicon.ico","icons/apple-touch-icon.png","manifest.webmanifest"];
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
