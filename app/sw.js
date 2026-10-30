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
const BUILD = "ce830de2fcdf";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-3310cf0de2f623f43b9cfc87c4d97bbb.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-dd08a8877f7125b109fad7a88f943de1.js","_expo/static/js/web/_layout-ff1b9662be48011208d7afab438b8f72.js","_expo/static/js/web/ajustes-2e51a1469c4fce13ce053c6b8d1b0b3b.js","_expo/static/js/web/atividade-form-ab18bbc73e1e028e10faf2b0850720f8.js","_expo/static/js/web/atividade-importar-111cc54b3e422db629fb1a13f5e77db5.js","_expo/static/js/web/buscar-828f17ed1dfd57cc4dd82432dce0b649.js","_expo/static/js/web/card-rapido-def51aa28b9aa2498f928b8a99c6df8d.js","_expo/static/js/web/card-rapido-form-3eb5154b86d0aebe48000b1365a4148b.js","_expo/static/js/web/card-rapido-item-c46cb3d764f09e0018bc151a7af829c1.js","_expo/static/js/web/card-rapido-item-form-b635431bfc986686dd2a2c57b5203273.js","_expo/static/js/web/cards-dd8162f31751cd4980c05ac94e063e71.js","_expo/static/js/web/cidade-form-2bbebb806edb74b8e601af02c458e244.js","_expo/static/js/web/cidades-5765c058c6ffd35a9c902be7e5c1ccef.js","_expo/static/js/web/como-funciona-49b95ae302a919b5cc3ef15241527895.js","_expo/static/js/web/compartilhar-7ebe48d01c47357c625982646cd07554.js","_expo/static/js/web/configuracoes-088c3bc581ea8e633773d12cec0fbcc0.js","_expo/static/js/web/deslocamento-form-9e0ffa5c06d33ba85a2321352e6ec078.js","_expo/static/js/web/dia-30db9681c245694ca052104170a4cdb0.js","_expo/static/js/web/documento-form-eb9a5bf5a64df4df6e889d2b4bee25d1.js","_expo/static/js/web/documentos-28c643de4aaf6eb87b2a3b08236676d4.js","_expo/static/js/web/entry-977e12cf6484926f2c5907a87c2929f4.js","_expo/static/js/web/explorar-9cb4c3b47bcec221131fe0aaaead2700.js","_expo/static/js/web/favoritos-4e0adb900ee08929666c0c77372d76ac.js","_expo/static/js/web/form-40b1440319a2bf818f11f9c39a1ab34e.js","_expo/static/js/web/form-4e8d9440762c23fd15662820c00e0c1b.js","_expo/static/js/web/hospedagem-form-f3d6938c6a4c4ed9d0cc20df99861782.js","_expo/static/js/web/hospedagem-importar-8728c715fbef37b1f636f2eaa9a92119.js","_expo/static/js/web/hospedagens-f919b0770712f5ce3bdfbe4bceef4ba3.js","_expo/static/js/web/index-033c9d38a8e1f1d3e45968d00f87cf86.js","_expo/static/js/web/index-19ba079ba6f1a0ed696da236ae29c5b1.js","_expo/static/js/web/index-2d59e7ea3cf4f5707d728b11efafc7ae.js","_expo/static/js/web/index-34da748bc15316f95c34436628cf67b7.js","_expo/static/js/web/index-655e1a82b224e278b945e885900b30f5.js","_expo/static/js/web/index-f6115292762e4338ddd1977652107f46.js","_expo/static/js/web/info-form-72f2f266094437c5fb82c10c44e7a9c3.js","_expo/static/js/web/instalar-1d22866cfbd0e5666558097ce8356c40.js","_expo/static/js/web/item-form-8be1e527e7760a170dc742ce5ea6130a.js","_expo/static/js/web/lembrete-form-6dae2db6bc30368762a19d5f32754b57.js","_expo/static/js/web/lista-d2e611988be63561b40ba066acf214d4.js","_expo/static/js/web/local-b1230e88d8e8ff1605f5a036836b120b.js","_expo/static/js/web/mapa-8c8a07ad4714c19a1af3da4a352f4796.js","_expo/static/js/web/mapa-fce23d90214104762f4f673f88c705b1.js","_expo/static/js/web/offline-39bafb54e249a449b3e9a09ad68e12ea.js","_expo/static/js/web/organizar-a12ddc24f86555979fa6235830208743.js","_expo/static/js/web/otimizar-3a5d7385a73cc171bd9f89501bd31bac.js","_expo/static/js/web/passagem-importar-543a32b95a8c5d070012a262427fc885.js","_expo/static/js/web/passagens-2db2f9a67d7970b4f8781eefbf951443.js","_expo/static/js/web/passeios-f14c6cf6c770c19b9d8266e561299ccc.js","_expo/static/js/web/pendentes-02eea5fdcf3011f28e35dafc55de4799.js","_expo/static/js/web/proximidades-f9202dda9c3e5936adf4d21a4bd7525c.js","_expo/static/js/web/roteiro-0ae560b117e9f93bc0c8d59bd0c78f62.js","_expo/static/js/web/servicos-e527716a76789ca3759809d118a7c92b.js","_expo/static/js/web/sincronizacao-b6b84d928d1d706bfd6b4a9b0a8803a9.js","_expo/static/js/web/sugestoes-73beee76e92b2dc3ac5864a6214a0e1d.js","_expo/static/js/web/transportes-04fc14ef0e1caf3102392802a7cb8db8.js","_expo/static/js/web/turismo-6b8084289ba9b72202fff5cd30d57c12.js","_expo/static/js/web/viagem-form-20750aad70e404a013cbd7d467952b7b.js","_expo/static/js/web/voo-form-c89177ec657116d74f6f79350bb9cfbb.js","_expo/static/js/web/worker-2d385205cf4fae8ae7e931fb95031150.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","exceljs/LICENSE","exceljs/exceljs.bare.min.js","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs","sqljs/sql-wasm-browser.js","sqljs/sql-wasm-browser.wasm"];
const ESSENTIAL = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-3310cf0de2f623f43b9cfc87c4d97bbb.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/entry-977e12cf6484926f2c5907a87c2929f4.js","favicon.ico","icons/apple-touch-icon.png","manifest.webmanifest"];
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
