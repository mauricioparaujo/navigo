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
const BUILD = "8865d7c47892";
const PRECACHE = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-90e65746c9b2bb08f2c751626f204389.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/_layout-969301715e6ceb1d0f0de37afc237132.js","_expo/static/js/web/_layout-ef4defd7e248814d74f9881979b5a0c3.js","_expo/static/js/web/ajustes-d598aaa6b18d783d45145eb23c47c154.js","_expo/static/js/web/atividade-form-399c218bf845a7812dd30432f1f730a2.js","_expo/static/js/web/atividade-importar-1bcf4e1090a3a666c38fefbb4fb79ebf.js","_expo/static/js/web/cidade-form-8ecb07bc913b8df06b7ead06e4d2cffe.js","_expo/static/js/web/cidades-d9f6fc9afddac3186be219afcd8ab53c.js","_expo/static/js/web/como-funciona-04a09aebcfb3f711f8e07f22c74278b0.js","_expo/static/js/web/compartilhar-eab08ef320fc438d629e2e381516cb16.js","_expo/static/js/web/configuracoes-f0039e806cd2003d1d670466c3252458.js","_expo/static/js/web/deslocamento-form-1e0992c94e5a8169e691e523f1aafb46.js","_expo/static/js/web/dia-020ca1a94acc1c543d11c6efdcc938bd.js","_expo/static/js/web/documento-form-0d75210059a6915d787f099814aa570f.js","_expo/static/js/web/documentos-0a2016f1925c5085b118ad1f2af83ed1.js","_expo/static/js/web/entry-d5c53f959c14c06298ff9a1568126b01.js","_expo/static/js/web/explorar-cf24f11b04dda8c5fad2869dd7f695d8.js","_expo/static/js/web/favoritos-02964c5c987c37b76d25c593f83f3c3c.js","_expo/static/js/web/form-8a5e10c0b0dedabc35dfae6fa941c83a.js","_expo/static/js/web/hospedagem-form-82de8431ce905c26813d1e74d774e5e6.js","_expo/static/js/web/hospedagem-importar-05eea38391d26f3d47d856c760557165.js","_expo/static/js/web/hospedagens-3b065c5fc7fd22cf65ea1d07d758d7df.js","_expo/static/js/web/index-8b9707bd37b1fa5aafb7c88f7bf6c626.js","_expo/static/js/web/index-a3fcc95588e8bdefc4fabd644bef2979.js","_expo/static/js/web/index-bad37500e1e54f8396de32032bd6e1a8.js","_expo/static/js/web/index-c5fedad75fc65c53b8754a3982b7f878.js","_expo/static/js/web/index-e89c4655fe71f0cd20fb63e72d5905d6.js","_expo/static/js/web/info-form-5bd8bfb7614c7d19513086fb45418d96.js","_expo/static/js/web/instalar-3d19ee4d0da111038857e8ec992cad14.js","_expo/static/js/web/lembrete-form-a4dcb9de2a3bbf4046c1c7bb551eb37d.js","_expo/static/js/web/local-35352405850bf4a400181c696dbc7d54.js","_expo/static/js/web/mapa-b2888fb4945857fca0c667a9428fd6ff.js","_expo/static/js/web/offline-154789a3d42d73fb9a1beb5ed96f5b78.js","_expo/static/js/web/organizar-81285e2798fa7d3820cf1e333f91ae59.js","_expo/static/js/web/otimizar-b2470d02f3d8b16581ef4c53e8af5925.js","_expo/static/js/web/passagem-importar-80384dc88925ec7fe39f172e24c179aa.js","_expo/static/js/web/passagens-d64f7c6a30ffab0f8a655ced52c54b54.js","_expo/static/js/web/passeios-a8616c5b7ef18ec843766d2e1f60aceb.js","_expo/static/js/web/pendentes-96925ea068cab8a784bf247bf011c753.js","_expo/static/js/web/proximidades-44f7555dba7af407e7ae1c6f6980f932.js","_expo/static/js/web/roteiro-363e4a30ddbcc723a3f0918e6bf33096.js","_expo/static/js/web/servicos-7dd45152791fd2dc0fe19e2c6ea46c36.js","_expo/static/js/web/sincronizacao-9ba76f6f78b1e7cb2b89b24ead4d1ada.js","_expo/static/js/web/sugestoes-cf454f2e8f080d7a2709d7d458763d05.js","_expo/static/js/web/transportes-b18b48b71790b1b8cf24948e69c55ee3.js","_expo/static/js/web/turismo-eddc208795adaeda1c2994ca6be48d15.js","_expo/static/js/web/viagem-form-a1864eb0ce7543106896ddc8e8c56be4.js","_expo/static/js/web/voo-form-07dff60c2b4f35d879f8828fb80eb1a8.js","_expo/static/js/web/worker-5b080ec7b44200280fed98311e0897e0.js","assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","assets/node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.5e61fe84c4a4f49e0b1a33661b45c791.wasm","assets/node_modules/react-native-calendars/src/calendar/img/next.5cd69239c26b01e3a70a5b852b034f8e.png","assets/node_modules/react-native-calendars/src/calendar/img/previous.87e5b6811f7ec9c6b4991b334b565992.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@1.5x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@2x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@3x.png","assets/node_modules/react-native-calendars/src/img/down.5d3a5c3005bed13682ef9f27207b2019@4x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@1.5x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@2x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@3x.png","assets/node_modules/react-native-calendars/src/img/up.09f8dc4c9ffd6c59e9884027c5008080@4x.png","favicon.ico","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","manifest.webmanifest","maplibre-gl-worker.mjs","pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs","sqljs/sql-wasm-browser.js","sqljs/sql-wasm-browser.wasm"];
const ESSENTIAL = ["_expo/static/css/maplibre-gl-dc3f9f1339c2c312db0e4c8f314a98f9.css","_expo/static/js/web/__common-90e65746c9b2bb08f2c751626f204389.js","_expo/static/js/web/__expo-metro-runtime-97703ae02682710149335928b974f18d.js","_expo/static/js/web/entry-d5c53f959c14c06298ff9a1568126b01.js","favicon.ico","icons/apple-touch-icon.png","manifest.webmanifest"];
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
