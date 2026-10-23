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
 * No build (scripts/generate-sw.mjs), BUILD e PRECACHE são preenchidos com a versão e a lista de
 * arquivos. Sem eles (servidor de desenvolvimento), tudo vai primeiro à rede e o cache é só reserva.
 */
const BUILD = "6c11892531f2";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-71ce606601ff51e278f7059e9edcd597.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-7b1787a2855b880221c7ab9b12720a12.js","_expo/static/js/web/_layout-c0ba7a2f4620fe5b9f14ebc22286fb18.js","_expo/static/js/web/ajustes-7e5e90c740a6b7b0566f6d7ed7d89ae3.js","_expo/static/js/web/atividade-form-5c7f8d37ed620e60e9abf848db028d63.js","_expo/static/js/web/atividade-importar-65128ede4dd2a55c2f38ac3e6117124e.js","_expo/static/js/web/cidade-form-f12385ab9539654e82f84ab8fd56ecc3.js","_expo/static/js/web/cidades-f0c7a86bb79e60248e21ae5d2f511ac5.js","_expo/static/js/web/como-funciona-1adf571e96ef0861703fbe5c84145e00.js","_expo/static/js/web/compartilhar-d431f396b2875cc267fb876735db80db.js","_expo/static/js/web/configuracoes-226f582acfabc6f49d940c0037a35560.js","_expo/static/js/web/deslocamento-form-5b84900a2d4f564d695c1df9b5a4c6bf.js","_expo/static/js/web/dia-de3c98beb6fc5359ae6c0396254682f2.js","_expo/static/js/web/documento-form-d58c5c289690f986f4c0182c7181c9fc.js","_expo/static/js/web/documentos-f1a64dca027de96c77770f8adf34d6fb.js","_expo/static/js/web/entry-94f05675af30024adf6d33bc8799f6e8.js","_expo/static/js/web/explorar-4d019b45b6b2b54678a8ce322e937896.js","_expo/static/js/web/favoritos-93cc38c05c7f6e1c5afdf2cf0553c070.js","_expo/static/js/web/form-1b14f62dcdfe6644ec6e11d8767bfee9.js","_expo/static/js/web/hospedagem-form-82d2dc5c73cb8170511150ac6e3af3ac.js","_expo/static/js/web/hospedagem-importar-7dd8a808830af1666ca8a39c19485a17.js","_expo/static/js/web/hospedagens-dfdd3ab564d89c8f0b56b1a658748ab6.js","_expo/static/js/web/index-12d76032638b6f05f174d5a1d28e2ee0.js","_expo/static/js/web/index-214347946eff7ec5fbff9ff442f29480.js","_expo/static/js/web/index-4496355e1ab97662e654c3bbf5e70449.js","_expo/static/js/web/index-89fa46851dd428773e9ade956261b08e.js","_expo/static/js/web/index-d7e026fc5005efebc2fd84c6464e5d73.js","_expo/static/js/web/info-form-0ef6714aaa7d434ce979723f3dd01d74.js","_expo/static/js/web/instalar-638224e714762bf8a0ba064e15491146.js","_expo/static/js/web/lembrete-form-05da618b52e8e1c9a971dad8932a2fd9.js","_expo/static/js/web/local-081f72af38efd521e996c3235e4a6297.js","_expo/static/js/web/mapa-9d7c2548555b83b8e5203f37dc6b4395.js","_expo/static/js/web/offline-4e5cd0839000513ca3b63031f73f8cff.js","_expo/static/js/web/organizar-ca0a2c75f0990d004131c2a7a420dadd.js","_expo/static/js/web/otimizar-6523a63a281ef976ae5b4edb7403e9a9.js","_expo/static/js/web/passagem-importar-2c4adc612fb837f4c4495b60ab9f6ebf.js","_expo/static/js/web/passagens-617532156e0df73c672a8f7e308bb706.js","_expo/static/js/web/passeios-66ef5b077515026a43e1c0e688eea89b.js","_expo/static/js/web/pendentes-6e7745f517a205d00e050be518acd1ce.js","_expo/static/js/web/proximidades-c4fdb813b5733f6e110d6f7dcb0d1b26.js","_expo/static/js/web/roteiro-691ba17eef0cd1e8b0f409c6d0aef68a.js","_expo/static/js/web/servicos-4b85369ef56eab28ca410c69de3406b2.js","_expo/static/js/web/sincronizacao-25899151ff2ce62c76460cd323c2a9d7.js","_expo/static/js/web/sugestoes-fc6aa52f084d8954071192d2e720db48.js","_expo/static/js/web/transportes-1c2a40468ab227e76984b54444884735.js","_expo/static/js/web/turismo-eb5f7100e0490ece9b27adb03b9124d1.js","_expo/static/js/web/viagem-form-ae2ad3b68fa85121a9ae604b489247ae.js","_expo/static/js/web/voo-form-3cb1cf9d4abedde4c2c1df3fbca3471c.js","_expo/static/js/web/worker-bab584b44ff50d3c4b698078c41aff3d.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs"];
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

  self.addEventListener('install', (event) => {
    event.waitUntil(
      (async () => {
        if (!DEV) {
          const cache = await caches.open(CACHE);
          for (const href of precacheUrls(self.registration.scope, PRECACHE)) {
            const response = await fromNetwork(new Request(href, { cache: 'reload' }));
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
