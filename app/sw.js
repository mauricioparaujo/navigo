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
const BUILD = "351b9c4af443";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-df8482c103b4cc388304c10a407cc7f8.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-7f71968b2e737880bd662df7f0642e6b.js","_expo/static/js/web/_layout-d8b0dd7640a0261ce1787a0e5373e335.js","_expo/static/js/web/ajustes-f1417e0ed41c411933ab04e7d099a4ed.js","_expo/static/js/web/atividade-form-bdf05d523d68977a4ddccd565c54b1b8.js","_expo/static/js/web/atividade-importar-621d7a088843dfb31cc142bdd1a77886.js","_expo/static/js/web/card-rapido-form-0b786fb73cf0d63a9dee06b0f6564459.js","_expo/static/js/web/card-rapido-item-c6586d512c882a6e82610dc79adbb3a8.js","_expo/static/js/web/card-rapido-item-form-8a00d9ddaea0bf87e3857c9c7fc14681.js","_expo/static/js/web/cards-c20286628798e3ed3e3b66e28332405a.js","_expo/static/js/web/cidade-form-efe248e1b98154981db52c3063dce3f3.js","_expo/static/js/web/cidades-c22c81b7602d96dfef3e5171dbf23c81.js","_expo/static/js/web/como-funciona-cec747ebc2fd0b77cfad3acc2a85ccd6.js","_expo/static/js/web/compartilhar-2fa359eac05c57bada61aa7d7d7b026a.js","_expo/static/js/web/configuracoes-bada436858a8c00b0776b9309487e472.js","_expo/static/js/web/deslocamento-form-30aa48f0f58e1547b941499e70827cdd.js","_expo/static/js/web/dia-f63c8cffb46e00fbb2fa15d0428eef51.js","_expo/static/js/web/documento-form-1b540815e929e28972723f34a2cd5597.js","_expo/static/js/web/documentos-bb37f316e44ff4d8b5c0f05b8c9efd36.js","_expo/static/js/web/entry-45b0afa06c2dadebd62d496b0f14cd4b.js","_expo/static/js/web/explorar-522f3f1d4a470fee6353be687c396919.js","_expo/static/js/web/favoritos-b90c333ed98b4dafd832ad487c7b0cd4.js","_expo/static/js/web/form-4bf9a2684f3443988d63fd546ab6902d.js","_expo/static/js/web/form-a4e5105a128f83ee29e6c1f7b5a6a3e9.js","_expo/static/js/web/hospedagem-form-c92b1e8b8f83f0c43bf525e99f229238.js","_expo/static/js/web/hospedagem-importar-cb6a08068ca05a68413e1ef7f3d949a4.js","_expo/static/js/web/hospedagens-560037640612c49c22bc29a0150f2395.js","_expo/static/js/web/index-1a89be38d654bcb8d511ee8122d1d8fc.js","_expo/static/js/web/index-45ee6f5d182185e7c6d1dbb7578d3676.js","_expo/static/js/web/index-4fb5522328c4f9d649e1d9c2320605dc.js","_expo/static/js/web/index-5a0ebacc1b6a03866a9b2b33288b2271.js","_expo/static/js/web/index-a184a4a234579f3c93d07f459360239f.js","_expo/static/js/web/index-b27caded78d942c745af0046a3499a23.js","_expo/static/js/web/info-form-9699308a9f8c5f12988652948b68d2d6.js","_expo/static/js/web/instalar-c1757814c11ce8ab3b08c491fa8fa793.js","_expo/static/js/web/item-form-4d8b3df3c47335507ec2dc6b7b14dce9.js","_expo/static/js/web/lembrete-form-40e1ec07a56b9ada15df2c8450a52dd9.js","_expo/static/js/web/lista-16c5836a8149614480b45c76c0d0382a.js","_expo/static/js/web/local-75237da7b1b38e55a8f3993a138b25be.js","_expo/static/js/web/mapa-5b2376382931ca7ba05c4c43d437cccf.js","_expo/static/js/web/mapa-fd570629616e39e43eae2261b772a62d.js","_expo/static/js/web/offline-6b66dde8dae0462b02d304705d986f17.js","_expo/static/js/web/organizar-11bdfc1564bd77340c5d70c4a1c0f804.js","_expo/static/js/web/otimizar-743d491733e40db3bc50fa0d022a2591.js","_expo/static/js/web/passagem-importar-62573e299c5699c16ba0cb914aecbf83.js","_expo/static/js/web/passagens-9a8ea9af0e475b53b476728dec6d9924.js","_expo/static/js/web/passeios-d0d32b2169e8cfc718507ee87bb5a304.js","_expo/static/js/web/pendentes-fef7f188c7a6676d58c34be3f16dd64e.js","_expo/static/js/web/proximidades-3a31615aa21d152bc24ecd648c4c07fd.js","_expo/static/js/web/roteiro-bf934a983296a2ecd2e1f05bbfec3d19.js","_expo/static/js/web/servicos-f8c82b72b88f0a5825f9ec1f7f19de8d.js","_expo/static/js/web/sincronizacao-008d47a27511e936bf800f35ee279b9f.js","_expo/static/js/web/sugestoes-fb377f32301fb7a672eff0d504723f84.js","_expo/static/js/web/transportes-63d6d5f9818b0ab2343bc0ab64803908.js","_expo/static/js/web/turismo-7a0ef643d28f5a394469113f548bf4cd.js","_expo/static/js/web/viagem-form-07f13dc8bea5faeeb2b85b9cbc9098e5.js","_expo/static/js/web/voo-form-9665d0e987dea72256d032c0e8c18f89.js","_expo/static/js/web/worker-733b8db87bbd931d59738f1367966487.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","exceljs/LICENSE","exceljs/exceljs.bare.min.js","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs","sqljs/sql-wasm-browser.js","sqljs/sql-wasm-browser.wasm"];
const ESSENTIAL = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-df8482c103b4cc388304c10a407cc7f8.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/entry-45b0afa06c2dadebd62d496b0f14cd4b.js","favicon.ico","icons/apple-touch-icon.png","manifest.webmanifest"];
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
