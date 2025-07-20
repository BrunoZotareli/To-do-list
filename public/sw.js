const CACHE_NAME = "agenda-offline-v2"
const OFFLINE_URL = "/"

// Arquivos essenciais para funcionar offline
const ESSENTIAL_FILES = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"]

// Install - cachear arquivos essenciais
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching essential files")
        return cache.addAll(ESSENTIAL_FILES)
      })
      .then(() => {
        console.log("Service Worker: Essential files cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Cache failed", error)
      }),
  )
})

// Activate - limpar caches antigos
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated")
        return self.clients.claim()
      }),
  )
})

// Fetch - estratégia cache-first para recursos, network-first para páginas
self.addEventListener("fetch", (event) => {
  // Só interceptar requisições GET
  if (event.request.method !== "GET") return

  // Ignorar requisições de extensões do browser
  if (event.request.url.includes("extension://")) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se encontrou no cache, retorna
      if (cachedResponse) {
        console.log("Service Worker: Serving from cache", event.request.url)
        return cachedResponse
      }

      // Se não encontrou, tenta buscar na rede
      return fetch(event.request)
        .then((response) => {
          // Se a resposta não é válida, retorna ela mesmo
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clona a resposta para cachear
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            console.log("Service Worker: Caching new resource", event.request.url)
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.log("Service Worker: Network failed, trying cache", error)

          // Se é uma navegação (página), retorna a página principal do cache
          if (event.request.destination === "document") {
            return caches.match(OFFLINE_URL)
          }

          // Para outros recursos, retorna erro
          throw error
        })
    }),
  )
})

// Mensagem para debug
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

console.log("Service Worker: Script loaded")
