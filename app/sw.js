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
const BUILD = "b9d1d43e436e";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-7e5723350fcb5c7b71b5b70d33dc3227.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-340073917b4b6d94eea409ab82af5845.js","_expo/static/js/web/_layout-4ca50519c86245ea3064e88f9e94c594.js","_expo/static/js/web/ajustes-5f376c41eb14e5714de624b932e776bd.js","_expo/static/js/web/atividade-form-5043c40a8ece8061193b9978cbded8de.js","_expo/static/js/web/atividade-importar-9f1343b07bc58fd590ac167c799c14aa.js","_expo/static/js/web/cidade-form-1db6ba301f8236091931ef5c7594b657.js","_expo/static/js/web/cidades-99935e158474aa597f8d7e1da2797311.js","_expo/static/js/web/como-funciona-2b100de43116e93b0581b9674dc07e6e.js","_expo/static/js/web/compartilhar-da3f19b5156040b3ba90175b250678e2.js","_expo/static/js/web/configuracoes-9cee8a5046bb913f5ef4ba4dca5c08ec.js","_expo/static/js/web/deslocamento-form-1284916457bc9f52caea433e1677049e.js","_expo/static/js/web/dia-b009b2e38026e6cc88c8d713bc73d21b.js","_expo/static/js/web/documento-form-e175297bcf5a5017d19133a46e03fb65.js","_expo/static/js/web/documentos-b3de2f1057e375ef27c68576e3fcca68.js","_expo/static/js/web/entry-841659517f7db6cc81fe40e17a85c76d.js","_expo/static/js/web/explorar-3a7bfee41fef51e8b6e3c48ea2bdb72c.js","_expo/static/js/web/favoritos-628b9ea736456ab04d312b9c572c35f1.js","_expo/static/js/web/form-b2774552fdd7fd2f77a994b0e2fb55ef.js","_expo/static/js/web/hospedagem-form-9f80eee26995b0bd53ef74d2218fbf9c.js","_expo/static/js/web/hospedagem-importar-0f5f559d2865b076a88548ad48f57a6e.js","_expo/static/js/web/hospedagens-082f2d0a35b8f59a21c2f505114c75cd.js","_expo/static/js/web/index-1d30f3a6017b0f7ac0ec4663ac9702f7.js","_expo/static/js/web/index-4c243a1a49eb35d6aa009945ea88a484.js","_expo/static/js/web/index-ae5b78262763102962f47ac93308796e.js","_expo/static/js/web/index-b555ced9e9ab2ae0fe66bfeb6c567589.js","_expo/static/js/web/index-e662d13ba5e088f125daf04974d31bf4.js","_expo/static/js/web/info-form-943c05355cd560465b5a8cadd48b37ed.js","_expo/static/js/web/instalar-26e4618589a1c65ae2d0afc362a9f1cb.js","_expo/static/js/web/lembrete-form-86173832fe5472aadad1486b9463459b.js","_expo/static/js/web/local-cbc782ea6f3f570492d345a46eefc396.js","_expo/static/js/web/mapa-13bf5f0f3f23f1ac7527eca9b4e989e7.js","_expo/static/js/web/offline-2fd4c5bb442f663b4b494fd723a59497.js","_expo/static/js/web/organizar-568fdac86683bf857e9715a182c3e9dc.js","_expo/static/js/web/otimizar-b7987869c6902b128b3b4ef78b91d8fe.js","_expo/static/js/web/passagem-importar-81bcab5d668903e63a7a883212568d2d.js","_expo/static/js/web/passagens-46c1a2cfc66324decd044aaee19ed728.js","_expo/static/js/web/passeios-1ea1d0ba2ff038b9b633b8354f001a2f.js","_expo/static/js/web/pendentes-fd7499bec2759f6f0b0a8fa937313941.js","_expo/static/js/web/proximidades-8310a206d11c82ba0985bc439c5feb6a.js","_expo/static/js/web/roteiro-4b7a1332739583568ccf5434c1e4fe4c.js","_expo/static/js/web/servicos-fec7362abaa389daf6d24400b9aaa5a8.js","_expo/static/js/web/sincronizacao-798f83e463fe69bc96fac48b5098fef1.js","_expo/static/js/web/sugestoes-8481ca1c7486daf4fe702803c78e4eda.js","_expo/static/js/web/transportes-43627d0816c33dd030862dc4c60d741e.js","_expo/static/js/web/turismo-9629bfaf9e1f715b4136df9a60f2071b.js","_expo/static/js/web/viagem-form-552e5e3a78b09abc54baedd87798eea1.js","_expo/static/js/web/voo-form-826c908a3460214c81255e40fd0699b3.js","_expo/static/js/web/worker-bab584b44ff50d3c4b698078c41aff3d.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs"];
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
