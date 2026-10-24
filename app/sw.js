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
const BUILD = "f980236179cb";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-18c88260affc9cca2e92462d0865be5f.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-0c54ab4b858d6ff15ed90d1fa3b2d284.js","_expo/static/js/web/_layout-b5598b21d7e1a1eaa8a2aced94efad43.js","_expo/static/js/web/ajustes-1bca3ba3b116aae70c52d07b4182d456.js","_expo/static/js/web/atividade-form-8fed4490bb68305ebd75a5cc7cc7f6da.js","_expo/static/js/web/atividade-importar-c2667426ab73e754bbc84e750e16d2ca.js","_expo/static/js/web/cidade-form-9d76ebc3b03afaa109e7661233252c6b.js","_expo/static/js/web/cidades-2a4058f560113b80178687f8e32c6d01.js","_expo/static/js/web/como-funciona-36ae611980921d6cf06e2c07f9247904.js","_expo/static/js/web/compartilhar-665e1a1d1a6d3dfe3f7091473cdf3de4.js","_expo/static/js/web/configuracoes-852c1821c62d6474cb08c896c73f96df.js","_expo/static/js/web/deslocamento-form-15c51bc06cc8c7477ec6556ba683616b.js","_expo/static/js/web/dia-77565350e587dead3ca42a04a062e05e.js","_expo/static/js/web/documento-form-14d59f190c001920f22f917e3b47fff4.js","_expo/static/js/web/documentos-3546e659264bc5748306b6db0d709118.js","_expo/static/js/web/entry-5ea2b6b5939e4d53ee700af2ec772d55.js","_expo/static/js/web/explorar-1240924bc7587d3e55eb981278955a16.js","_expo/static/js/web/favoritos-6e3b710107eff5938a1d627f20b29f8b.js","_expo/static/js/web/form-1b15ef7311df7c7c135552a0cf2d9398.js","_expo/static/js/web/hospedagem-form-3faf045b78c22d5acc4895bf5529c268.js","_expo/static/js/web/hospedagem-importar-04386eb6183d3017cb52e9b9f4868579.js","_expo/static/js/web/hospedagens-01d5ddc83b7629f946c20654d3cde2b8.js","_expo/static/js/web/index-18a15aec7d315eed5eb9ebfaff4ac315.js","_expo/static/js/web/index-73e885c7944736cc954770ebd19e947d.js","_expo/static/js/web/index-7ddd759c953ba9f4ff5d8ce7cbafd5ed.js","_expo/static/js/web/index-972417d4d1ac97d663ff00b1897723b9.js","_expo/static/js/web/index-ffe6fe04452cf8ee0419abb9e1c72ebe.js","_expo/static/js/web/info-form-7613105fe5fc483d1a0c3b46b379e651.js","_expo/static/js/web/instalar-a29d092595496785fb25eeb9c95f09dd.js","_expo/static/js/web/lembrete-form-4843a4ca7e4a56795b81cd8f2b6658aa.js","_expo/static/js/web/local-d45b8ada68d4bc6fc0804885427e31df.js","_expo/static/js/web/mapa-2cf35a0691d514b6557a8389fa49ce1f.js","_expo/static/js/web/mapa-5b56be1701378e29b2cc79878ec2a31e.js","_expo/static/js/web/offline-a506af9a764d0ad6d01b945455418b20.js","_expo/static/js/web/organizar-c9233937a1aed0896c44f7ef5da02320.js","_expo/static/js/web/otimizar-9d19e438d288f8c867d28f46210589b9.js","_expo/static/js/web/passagem-importar-44f1ff2e842164942cd7c402ebdc4d45.js","_expo/static/js/web/passagens-2350cd2c83d4d86eb588912f868f3710.js","_expo/static/js/web/passeios-2f50b5cf2fd6a760bafffecc94ccb98d.js","_expo/static/js/web/pendentes-ab6b9d1ff5495c6f708d0887f5ef93b8.js","_expo/static/js/web/proximidades-b2b1dc98941ce9b62497d37c82ef98b4.js","_expo/static/js/web/roteiro-846e36946436a97460504136b7404eeb.js","_expo/static/js/web/servicos-57e620300d05e440d8aee69bc05baf86.js","_expo/static/js/web/sincronizacao-cfe00877065e0e24dd3f9db5061e7d37.js","_expo/static/js/web/sugestoes-1a19571b92fa55c40e28aa0fb65430d8.js","_expo/static/js/web/transportes-357a6321bdba42b9d2810846391f73a8.js","_expo/static/js/web/turismo-76184648bb4836bb5c47f8bc33a794b7.js","_expo/static/js/web/viagem-form-2402de260d94a7ba09bcd8c98330b5bb.js","_expo/static/js/web/voo-form-b9896a7379a01df25d430f79c04e17e4.js","_expo/static/js/web/worker-3627209f225957d80f88a5b48c84070f.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","exceljs/LICENSE","exceljs/exceljs.bare.min.js","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs","sqljs/sql-wasm-browser.js","sqljs/sql-wasm-browser.wasm"];
const ESSENTIAL = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-18c88260affc9cca2e92462d0865be5f.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/entry-5ea2b6b5939e4d53ee700af2ec772d55.js","favicon.ico","icons/apple-touch-icon.png","manifest.webmanifest"];
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
