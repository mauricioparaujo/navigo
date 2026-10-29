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
const BUILD = "cf99da2cb3d0";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-33977c551932e4a2cf32cc19f4a67eec.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-00859dc860bb873814deafc52a774f6c.js","_expo/static/js/web/_layout-a32736abf4c59cd8606c8624900adfac.js","_expo/static/js/web/ajustes-114df787e1adba994fb13eb0dfa82b94.js","_expo/static/js/web/atividade-form-ad8789e506844f0e655b8ab834b0006d.js","_expo/static/js/web/atividade-importar-090ec438fe31f6dd1a7596dbd51fee3e.js","_expo/static/js/web/card-rapido-a4171f0fe659346b1a2f2d306d644cc1.js","_expo/static/js/web/card-rapido-form-1a995d812449e25192a6f63d2001c42e.js","_expo/static/js/web/card-rapido-item-9930ab3dbcd77c689f1d5be9592ed52b.js","_expo/static/js/web/card-rapido-item-form-3c989f2d34828a39a9a2fa335e60a9e9.js","_expo/static/js/web/cards-9dbb731082c2d1cb5ca8fa5bf67c4247.js","_expo/static/js/web/cidade-form-dcd572a4229b3915b4c5f8caa0311b5b.js","_expo/static/js/web/cidades-d83facb84560bffa953d8bf1d4a59556.js","_expo/static/js/web/como-funciona-b5d788762a771bb363179abb819ddb30.js","_expo/static/js/web/compartilhar-3a643db278f390c309a7a72872b0e1eb.js","_expo/static/js/web/configuracoes-df79271c4406581618706b48c7278bfa.js","_expo/static/js/web/deslocamento-form-383a7ddd9777df38f8c35fd6c3691874.js","_expo/static/js/web/dia-b97e4d0f272f681a73a55ea8cb9e64be.js","_expo/static/js/web/documento-form-ef69f79a5bf99dc5438a850c4e752405.js","_expo/static/js/web/documentos-854c139a4a2f2e9d2ef4cacd99eb77c2.js","_expo/static/js/web/entry-09e201b34cfc0aaae34be09b3e512f56.js","_expo/static/js/web/explorar-f560dbbd215a578d12d4629939ccf2dc.js","_expo/static/js/web/favoritos-6950fd5570fd95d3021a87a4e8e99d7f.js","_expo/static/js/web/form-914a38faa33ed555e4d7193c23854af5.js","_expo/static/js/web/form-bc74e5343d3938f38e647ed6a4f8ac9e.js","_expo/static/js/web/hospedagem-form-0a18ebb65d3020cd388d8821d9dcc197.js","_expo/static/js/web/hospedagem-importar-1f37d03a8828e96d02e1e4a0f9ec208c.js","_expo/static/js/web/hospedagens-721f3e64761a2e73dc5f3b78ede5b553.js","_expo/static/js/web/index-1b5258b84a23fc8a6a212c1b460231d6.js","_expo/static/js/web/index-22c0297b840651aeb52c87a13177c700.js","_expo/static/js/web/index-44bde322a70ea56c48b47f676e0052ae.js","_expo/static/js/web/index-e24ab08a5b5d3d32eb43c54c6c1dc0bc.js","_expo/static/js/web/index-f23bceab5de093366adae94d2cf60886.js","_expo/static/js/web/index-f899a9938723ebe530ca55b663be1b9a.js","_expo/static/js/web/info-form-104cda6027924280ba318c7b990e7b18.js","_expo/static/js/web/instalar-2b9361097aff697a3da738c9485fbf18.js","_expo/static/js/web/item-form-9f90ae231049c1221364c1807f299f8c.js","_expo/static/js/web/lembrete-form-00f65b55522f2951586b42b1e1b9e8f4.js","_expo/static/js/web/lista-b28a91d7194aa70e70699e62d6dd7107.js","_expo/static/js/web/local-55b27385a18574598cafe9df3d418a62.js","_expo/static/js/web/mapa-5344b9f29732a4e0eb107b73c5ab2e91.js","_expo/static/js/web/mapa-5fc02e9e9bd12c9843e90550cd1b5523.js","_expo/static/js/web/offline-1517bef21f5a2cdabfdd8c1e58c0f34a.js","_expo/static/js/web/organizar-1bf47dc84914182f36ab325b73a2cfdf.js","_expo/static/js/web/otimizar-672d83a6854e8d206127ddb8d6e52052.js","_expo/static/js/web/passagem-importar-dc971fc3f5ff5d4c4b83431556fe5e9e.js","_expo/static/js/web/passagens-6105e2d96f5d7fe752f720b3a9d5beac.js","_expo/static/js/web/passeios-10897f2af08969c7b20b057b9dcf98a2.js","_expo/static/js/web/pendentes-054daf547f23dc3be433573e2dbb970a.js","_expo/static/js/web/proximidades-9ad1d095b87e42fcda979494c51d7447.js","_expo/static/js/web/roteiro-d2703b971c080f8a12fba5e32ddb658b.js","_expo/static/js/web/servicos-d10d58c668b37bcdcd02148bd890b9ee.js","_expo/static/js/web/sincronizacao-78606e524caa1e3e9a901c20cf1c06f6.js","_expo/static/js/web/sugestoes-a8f6f3fc62affd267f75618d4543a962.js","_expo/static/js/web/transportes-62a902b1f1451f9095c427eed5b266c2.js","_expo/static/js/web/turismo-49995b85f7c874ae49325491863b4de8.js","_expo/static/js/web/viagem-form-7668b3c2fd62c25f3d9c4d89f62796c5.js","_expo/static/js/web/voo-form-f581f974730060850b36ecbc1bf7c7c3.js","_expo/static/js/web/worker-bdcf560159a17ee15122be2f57a778b6.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","exceljs/LICENSE","exceljs/exceljs.bare.min.js","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs","sqljs/sql-wasm-browser.js","sqljs/sql-wasm-browser.wasm"];
const ESSENTIAL = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-33977c551932e4a2cf32cc19f4a67eec.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/entry-09e201b34cfc0aaae34be09b3e512f56.js","favicon.ico","icons/apple-touch-icon.png","manifest.webmanifest"];
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
