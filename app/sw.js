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
const BUILD = "266bedaaf5a1";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-af53b2b01b6e12ad3d109cde341ff785.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-41aeb861a4fd36f3e9f268310308e792.js","_expo/static/js/web/_layout-f1e876bdd13325d731b53f4c6204d6a1.js","_expo/static/js/web/ajustes-713ce157c1884a9b9db37936b1a3fe57.js","_expo/static/js/web/atividade-form-c6cfa68625ab6c8a0ea048169c398ed4.js","_expo/static/js/web/atividade-importar-78879aaf06e504b83cbf70c111ed4a86.js","_expo/static/js/web/cidade-form-36ed5846fd595970ffd4183dd74ed4ad.js","_expo/static/js/web/cidades-2352b2b84d0efe4b0ae93cf7ad78c236.js","_expo/static/js/web/como-funciona-f57f375e8ab2a3e8b8d6c9c2d7bca252.js","_expo/static/js/web/compartilhar-1235486aadeea5611bee84b036762115.js","_expo/static/js/web/configuracoes-b5d4b982fda2b5192306ac33d7aa62c5.js","_expo/static/js/web/deslocamento-form-f28fe4b0615f2ab4d2924b49806281db.js","_expo/static/js/web/dia-f9245c963b3ead525bbe2c05a8999217.js","_expo/static/js/web/documento-form-7220de5dab8edf9b4def46d51f9a918c.js","_expo/static/js/web/documentos-858312abc37c029e029b1f4819815b77.js","_expo/static/js/web/entry-8ceb4ff23f154d1fcd2b06019d7040e3.js","_expo/static/js/web/explorar-2d6e0a9e7a1612891b384a7fb2967548.js","_expo/static/js/web/favoritos-543ef0d0091da23ad7156537f17c1c85.js","_expo/static/js/web/form-05c30d3cc061b0eece2641f6f05134fd.js","_expo/static/js/web/hospedagem-form-ffbbef7f3b18735657fc17da49d64806.js","_expo/static/js/web/hospedagem-importar-426c22d482fd30cf89169a2ac97ce9c8.js","_expo/static/js/web/hospedagens-da2875c088471ce5964019f88c3b2b8f.js","_expo/static/js/web/index-03f18c4f18f8b48e54c60d2a1a7322d7.js","_expo/static/js/web/index-42f25047ef31a5868e60c5635471f18e.js","_expo/static/js/web/index-62826434ebdbc27016f8f012fdaf5443.js","_expo/static/js/web/index-62d1504d4d3337884c3195324ca8afa5.js","_expo/static/js/web/index-7a8e9df4887ce50380d09d246a865fbe.js","_expo/static/js/web/info-form-4bec19d914118462c5e3d218af213254.js","_expo/static/js/web/instalar-aceb5aed57cb354b1feccddbd2d28a23.js","_expo/static/js/web/lembrete-form-0dd46f90976397d9c46b3c1c70a1bde7.js","_expo/static/js/web/local-bd86d3f45dce47b873e76a3b4817f247.js","_expo/static/js/web/mapa-0492d5e39562a56de79a5b6c8904b7da.js","_expo/static/js/web/offline-6a27fd73564e1730190c98b5791ed05c.js","_expo/static/js/web/organizar-14b4b75ef2490455cbfb90b33615e742.js","_expo/static/js/web/otimizar-635bfb113203277129765932f36b538e.js","_expo/static/js/web/passagem-importar-fc519ab4c9d87730d110a18098b214ae.js","_expo/static/js/web/passagens-dd55b8cbe159a2b6b24446cf9d30d286.js","_expo/static/js/web/passeios-9193b3a55803284f8c76dc232b5c5c52.js","_expo/static/js/web/pendentes-110eeb3aab37f9bfaff5c9111b86fae2.js","_expo/static/js/web/proximidades-ca8c2230b62bd5ba973b4cf7b4f8db26.js","_expo/static/js/web/roteiro-27961555e88f964281073521ceb436cd.js","_expo/static/js/web/servicos-114b81e48729d6ce23d331b2c907cd26.js","_expo/static/js/web/sincronizacao-31f3e562f2404814fb540f42fa475749.js","_expo/static/js/web/sugestoes-0ed00aebbbc6de7f59a4da7db870d268.js","_expo/static/js/web/transportes-30898f0efa1c1e31bba76c9b39ac3940.js","_expo/static/js/web/turismo-8e70ed0cfdf52fcd80a7950516075737.js","_expo/static/js/web/viagem-form-bb1a82c12f8fb94078f3b64ea02a999c.js","_expo/static/js/web/voo-form-e6d6aa904e1eeb13f44e93bfeae1b4ba.js","_expo/static/js/web/worker-f251179c67d49632d0cd0b27415c90e1.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs"];
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
