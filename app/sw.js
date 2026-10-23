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
const BUILD = "febfa3e56431";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-fd9306d8645ba482512820d3a5bf70ab.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-3e1bc7429ef633871812703753dd0f5f.js","_expo/static/js/web/_layout-5d3cc6e652c44c38e2972fb63042ce79.js","_expo/static/js/web/ajustes-019d1d371b4286c0e58cbd727b876eab.js","_expo/static/js/web/atividade-form-4f2540f199f2d912351e90d3c1be21ec.js","_expo/static/js/web/atividade-importar-f3b63afb1cd0fd82e0a0863571646188.js","_expo/static/js/web/cidade-form-f01e45bdeaa094d78c4a171b78fdd7f2.js","_expo/static/js/web/cidades-c8cb7b2a4c6c6784075dbe7331732c07.js","_expo/static/js/web/como-funciona-a703bf3946a0ca6c692fd903887fbbf8.js","_expo/static/js/web/compartilhar-8d2d3b1072f1edf24908c65e4376bfe1.js","_expo/static/js/web/configuracoes-c16246185ac85017a71c7135618b50d3.js","_expo/static/js/web/deslocamento-form-0852b73f308282ac358cbab57cf82a10.js","_expo/static/js/web/dia-e4cb798d436a3f73fd34b244333f354d.js","_expo/static/js/web/documento-form-692868537dcda284013a9afd6fcdec5c.js","_expo/static/js/web/documentos-e6e721b3d56ba9d20c545b1bdde06eed.js","_expo/static/js/web/entry-e14a8fd3e32697ad68ace3da5ae9ad3c.js","_expo/static/js/web/explorar-695154e1a435d73f0c0828bbae18d485.js","_expo/static/js/web/favoritos-4a914fd57e9713951d33ead0c800de91.js","_expo/static/js/web/form-757a3f25c59f6b908f16316e2912da0d.js","_expo/static/js/web/hospedagem-form-b094064ddde4c4a918859de9b6f63bba.js","_expo/static/js/web/hospedagem-importar-f54cc8aa8cb3a86440da7f43177e59e3.js","_expo/static/js/web/hospedagens-8c23ca77cb3947c6fedfe1e476c71dc6.js","_expo/static/js/web/index-24b7ba21799d2456608e6c185e9607c1.js","_expo/static/js/web/index-3304f09a7a4ef970b6cc5e2653b91f95.js","_expo/static/js/web/index-52d3875eb8778369a3255f31290aad98.js","_expo/static/js/web/index-9780d8a9c3114e3489b0df3a31bd7919.js","_expo/static/js/web/index-c9e63bf86e60a181655748ee5cab4675.js","_expo/static/js/web/info-form-ea4b0ce43e51362677c214b8a060cea4.js","_expo/static/js/web/instalar-3edacf58389f76ec67e868d10aa3ed3d.js","_expo/static/js/web/lembrete-form-529f908e7e0f8981bec13fdb4ff666b7.js","_expo/static/js/web/local-274840fd894694cff43b854c4e466bff.js","_expo/static/js/web/mapa-1eaa0eb4f06f66d4d269821071b08b5f.js","_expo/static/js/web/offline-070b9a168a83a8054e1b65f955b7b745.js","_expo/static/js/web/organizar-9f773335d6f7996fd9fbe2c948a8bbe8.js","_expo/static/js/web/otimizar-71e5864ddfa1e9470fc57a4342acf7c1.js","_expo/static/js/web/passagem-importar-a50e04f4e735029ef2ee9082668db319.js","_expo/static/js/web/passagens-65ec0064369ee0c6ced0f2779761481f.js","_expo/static/js/web/passeios-306d767e0ea7ed3edfb11398c55d0e48.js","_expo/static/js/web/pendentes-97626758cf5d734eaafc5e4b01dd52eb.js","_expo/static/js/web/proximidades-ca13c58982572004af09ecda93d44486.js","_expo/static/js/web/roteiro-73b466391a61db59f44cf705cc8ceba8.js","_expo/static/js/web/servicos-dfaddf6d7a48b4d00ff4c7ea4bca754e.js","_expo/static/js/web/sincronizacao-050d57596c87cd26c85e089a6a7d1b6a.js","_expo/static/js/web/sugestoes-164521d54f34e343742b682e56939117.js","_expo/static/js/web/transportes-080a1544da293bf01d0c2308e0dc70ac.js","_expo/static/js/web/turismo-f0011a216ae525ca1c21d278e5f32adb.js","_expo/static/js/web/viagem-form-ba6f8afe6a299fd8ea720bbd8affa3fe.js","_expo/static/js/web/voo-form-72070caafc9403583e0a36f2a6661edf.js","_expo/static/js/web/worker-9c31c48a96e87aa394548fb7856d1e24.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs"];
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
