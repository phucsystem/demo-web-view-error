import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="container">
    <h1>Demo Web View</h1>
    <p class="subtitle">Click buttons to trigger console logs</p>
    <div class="button-group">
      <button id="btn-info" class="btn btn-info" type="button">Info Log</button>
      <button id="btn-warning" class="btn btn-warning" type="button">Warning Log</button>
      <button id="btn-error" class="btn btn-error" type="button">Error Log</button>
      <button id="btn-heavy-images" class="btn btn-heavy" type="button">Load Heavy Images</button>
      <button id="btn-light-api" class="btn btn-light-api" type="button">Light API Request</button>
      <button id="btn-heavy-api" class="btn btn-heavy-api" type="button">Heavy API Request</button>
      <button id="btn-slow-dom" class="btn btn-slow-dom" type="button">Slow DOM Load</button>
      <button id="btn-random-api" class="btn btn-random-api" type="button">Random API Chaos</button>
    </div>
    <div id="slow-dom-container" class="slow-dom-container"></div>
    <div id="api-result" class="api-result"></div>
    <div id="image-grid" class="image-grid"></div>
    <div id="log-output" class="log-output"></div>
  </div>
`

const logOutput = document.querySelector<HTMLDivElement>('#log-output')!

function appendLogEntry(level: 'info' | 'warning' | 'error', message: string) {
  const timestamp = new Date().toLocaleTimeString()
  const entry = document.createElement('div')
  entry.className = `log-entry log-${level}`
  entry.textContent = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  logOutput.prepend(entry)
}

document.querySelector('#btn-info')!.addEventListener('click', () => {
  const message = 'This is an informational message'
  console.info(message)
  appendLogEntry('info', message)
})

document.querySelector('#btn-warning')!.addEventListener('click', () => {
  const message = 'This is a warning message'
  console.warn(message)
  appendLogEntry('warning', message)
})

document.querySelector('#btn-error')!.addEventListener('click', () => {
  const message = 'This is an error message'
  console.error(message)
  appendLogEntry('error', message)
})

function loadHeavyImages() {
  const imageGrid = document.querySelector<HTMLDivElement>('#image-grid')!
  imageGrid.innerHTML = ''

  const heavyImageUrls = [
    'https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Sunrise_over_the_sea.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png',
    'https://upload.wikimedia.org/wikipedia/commons/a/a2/Tropical_Forest_with_Monkeys.jpg',
  ]

  appendLogEntry('info', `Starting to load ${heavyImageUrls.length} heavy images...`)
  const startTime = performance.now()

  heavyImageUrls.forEach((url, index) => {
    const imageContainer = document.createElement('div')
    imageContainer.className = 'image-card loading'
    imageContainer.innerHTML = `<div class="image-placeholder">Loading image ${index + 1}...</div>`
    imageGrid.appendChild(imageContainer)

    const imageElement = new Image()
    const imageStartTime = performance.now()

    imageElement.onload = () => {
      const loadDuration = (performance.now() - imageStartTime).toFixed(0)
      imageContainer.classList.remove('loading')
      imageContainer.innerHTML = ''
      imageContainer.appendChild(imageElement)

      const caption = document.createElement('div')
      caption.className = 'image-caption'
      caption.textContent = `Image ${index + 1} — ${loadDuration}ms — ${(imageElement.naturalWidth)}x${imageElement.naturalHeight}`
      imageContainer.appendChild(caption)

      appendLogEntry('info', `Image ${index + 1} loaded in ${loadDuration}ms (${imageElement.naturalWidth}x${imageElement.naturalHeight})`)

      const allLoaded = imageGrid.querySelectorAll('.loading').length === 0
      if (allLoaded) {
        const totalDuration = (performance.now() - startTime).toFixed(0)
        appendLogEntry('warning', `All ${heavyImageUrls.length} heavy images loaded in ${totalDuration}ms total`)
      }
    }

    imageElement.onerror = () => {
      imageContainer.classList.remove('loading')
      imageContainer.classList.add('error')
      imageContainer.innerHTML = `<div class="image-placeholder">Failed to load image ${index + 1}</div>`
      appendLogEntry('error', `Failed to load image ${index + 1}: ${url}`)
    }

    imageElement.src = url
  })
}

document.querySelector('#btn-heavy-images')!.addEventListener('click', () => {
  loadHeavyImages()
})

const apiResult = document.querySelector<HTMLDivElement>('#api-result')!

function renderApiResult(title: string, data: unknown, duration: number) {
  const jsonString = JSON.stringify(data, null, 2)
  apiResult.innerHTML = `
    <div class="api-result-header">
      <strong>${title}</strong>
      <span class="api-duration">${duration}ms</span>
    </div>
    <pre class="api-json">${jsonString}</pre>
  `
}

document.querySelector('#btn-light-api')!.addEventListener('click', async () => {
  appendLogEntry('info', 'Starting lightweight API request...')
  apiResult.innerHTML = '<div class="api-loading">Fetching...</div>'
  const startTime = performance.now()

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1')
    const data = await response.json()
    const duration = Math.round(performance.now() - startTime)
    appendLogEntry('info', `Light API responded in ${duration}ms — single post object`)
    renderApiResult('Light API — Single Post', data, duration)
  } catch (fetchError) {
    const duration = Math.round(performance.now() - startTime)
    appendLogEntry('error', `Light API failed after ${duration}ms: ${fetchError}`)
    apiResult.innerHTML = `<div class="api-error">Request failed: ${fetchError}</div>`
  }
})

document.querySelector('#btn-heavy-api')!.addEventListener('click', async () => {
  appendLogEntry('info', 'Starting heavy API request (5000 photos)...')
  apiResult.innerHTML = '<div class="api-loading">Fetching large dataset...</div>'
  const startTime = performance.now()

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/photos')
    const data = await response.json()
    const duration = Math.round(performance.now() - startTime)
    const payloadSize = new Blob([JSON.stringify(data)]).size
    const sizeLabel = payloadSize > 1024 * 1024
      ? `${(payloadSize / (1024 * 1024)).toFixed(1)} MB`
      : `${(payloadSize / 1024).toFixed(0)} KB`
    appendLogEntry('warning', `Heavy API responded in ${duration}ms — ${data.length} items, ${sizeLabel}`)
    renderApiResult(`Heavy API — ${data.length} Photos (${sizeLabel})`, data.slice(0, 20), duration)
    appendLogEntry('info', 'Showing first 20 items in preview (full dataset received)')
  } catch (fetchError) {
    const duration = Math.round(performance.now() - startTime)
    appendLogEntry('error', `Heavy API failed after ${duration}ms: ${fetchError}`)
    apiResult.innerHTML = `<div class="api-error">Request failed: ${fetchError}</div>`
  }
})

function blockMainThread(durationMs: number) {
  const endTime = performance.now() + durationMs
  while (performance.now() < endTime) {
    Math.random() * Math.random()
  }
}

function forceLayoutThrash(element: HTMLElement) {
  element.style.width = `${Math.random() * 100}%`
  void element.offsetHeight
  element.style.padding = `${Math.random() * 20}px`
  void element.offsetWidth
  element.style.margin = `${Math.random() * 10}px`
  void element.getBoundingClientRect()
}

function simulateSlowDom() {
  const container = document.querySelector<HTMLDivElement>('#slow-dom-container')!
  container.innerHTML = ''

  const totalNodes = 200 + Math.floor(Math.random() * 300)
  const totalBlockMs = 1000 + Math.floor(Math.random() * 4000)
  const blockPerNode = totalBlockMs / totalNodes

  appendLogEntry('warning', `Slow DOM: inserting ${totalNodes} nodes with ~${totalBlockMs}ms total main-thread block`)

  const startTime = performance.now()
  let insertedCount = 0

  function insertBatch() {
    const batchSize = 5 + Math.floor(Math.random() * 15)
    const batchEnd = Math.min(insertedCount + batchSize, totalNodes)

    for (let nodeIndex = insertedCount; nodeIndex < batchEnd; nodeIndex++) {
      const randomDelay = blockPerNode * (0.5 + Math.random())
      blockMainThread(randomDelay)

      const card = document.createElement('div')
      card.className = 'slow-dom-card'

      const depth = 1 + Math.floor(Math.random() * 4)
      let innerHtml = `<span class="slow-dom-text">Node ${nodeIndex + 1}</span>`
      for (let nestLevel = 0; nestLevel < depth; nestLevel++) {
        innerHtml = `<div class="slow-dom-nested">${innerHtml}</div>`
      }
      card.innerHTML = innerHtml

      container.appendChild(card)

      if (Math.random() < 0.3) {
        forceLayoutThrash(card)
      }

      insertedCount++
    }

    const elapsed = Math.round(performance.now() - startTime)
    appendLogEntry('info', `Slow DOM: ${insertedCount}/${totalNodes} nodes inserted (${elapsed}ms elapsed)`)

    if (insertedCount < totalNodes) {
      const jitterDelay = Math.floor(Math.random() * 50)
      setTimeout(insertBatch, jitterDelay)
    } else {
      const totalDuration = Math.round(performance.now() - startTime)
      appendLogEntry('warning', `Slow DOM: completed ${totalNodes} nodes in ${totalDuration}ms`)
    }
  }

  insertBatch()
}

document.querySelector('#btn-slow-dom')!.addEventListener('click', () => {
  simulateSlowDom()
})

const ERROR_SCENARIOS = [
  { status: 400, statusText: 'Bad Request', body: { error: 'Invalid parameters', message: 'The request payload contains malformed JSON', code: 'INVALID_PAYLOAD' } },
  { status: 401, statusText: 'Unauthorized', body: { error: 'Authentication required', message: 'Bearer token expired or missing', code: 'AUTH_EXPIRED' } },
  { status: 403, statusText: 'Forbidden', body: { error: 'Access denied', message: 'Insufficient permissions for this resource', code: 'FORBIDDEN' } },
  { status: 404, statusText: 'Not Found', body: { error: 'Resource not found', message: 'The requested endpoint does not exist', code: 'NOT_FOUND' } },
  { status: 408, statusText: 'Request Timeout', body: { error: 'Timeout', message: 'Server did not respond within 30s', code: 'TIMEOUT' } },
  { status: 429, statusText: 'Too Many Requests', body: { error: 'Rate limited', message: 'Exceeded 100 requests/min. Retry after 60s', code: 'RATE_LIMIT', retryAfter: 60 } },
  { status: 500, statusText: 'Internal Server Error', body: { error: 'Internal error', message: 'Unexpected null reference in UserService.getProfile()', code: 'INTERNAL_ERROR', trace: 'at UserService.getProfile (user-service.js:142)' } },
  { status: 502, statusText: 'Bad Gateway', body: { error: 'Bad gateway', message: 'Upstream server returned invalid response', code: 'BAD_GATEWAY' } },
  { status: 503, statusText: 'Service Unavailable', body: { error: 'Service unavailable', message: 'Server is under maintenance. ETA: 15 minutes', code: 'MAINTENANCE' } },
  { status: 504, statusText: 'Gateway Timeout', body: { error: 'Gateway timeout', message: 'Upstream server did not respond in time', code: 'GATEWAY_TIMEOUT' } },
] as const

const SUCCESS_SCENARIOS = [
  { delay: 50, body: { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' }, label: 'Fast user lookup (50ms)' },
  { delay: 800, body: { items: Array.from({ length: 50 }, (_, idx) => ({ id: idx + 1, title: `Item ${idx + 1}` })), total: 50, page: 1 }, label: 'Paginated list (800ms)' },
  { delay: 2000, body: { report: { generated: new Date().toISOString(), rows: 15000, status: 'complete' } }, label: 'Slow report generation (2s)' },
  { delay: 3500, body: { upload: { fileId: 'abc-123', size: '4.2MB', status: 'processed' } }, label: 'Very slow file processing (3.5s)' },
] as const

function renderErrorPage(scenario: typeof ERROR_SCENARIOS[number], duration: number) {
  const container = document.querySelector<HTMLDivElement>('#api-result')!
  container.innerHTML = `
    <div class="error-page">
      <div class="error-page-header error-page-${scenario.status >= 500 ? 'server' : 'client'}">
        <span class="error-page-status">${scenario.status}</span>
        <span class="error-page-status-text">${scenario.statusText}</span>
      </div>
      <div class="error-page-body">
        <div class="error-page-code">${scenario.body.code}</div>
        <p class="error-page-message">${scenario.body.message}</p>
        <pre class="error-page-json">${JSON.stringify(scenario.body, null, 2)}</pre>
        <div class="error-page-meta">
          <span>Response time: ${duration}ms</span>
          <span>Timestamp: ${new Date().toISOString()}</span>
        </div>
      </div>
    </div>
  `
}

function simulateRandomApi() {
  const apiResultContainer = document.querySelector<HTMLDivElement>('#api-result')!
  const failRate = 0.6
  const willFail = Math.random() < failRate
  const simulatedLatency = willFail
    ? 200 + Math.floor(Math.random() * 3000)
    : 0

  appendLogEntry('info', `Random API: firing request... (${willFail ? 'will fail' : 'will succeed'} after ~${willFail ? simulatedLatency : '?'}ms)`)
  apiResultContainer.innerHTML = '<div class="api-loading">Requesting...</div>'

  const startTime = performance.now()

  if (willFail) {
    const scenario = ERROR_SCENARIOS[Math.floor(Math.random() * ERROR_SCENARIOS.length)]
    setTimeout(() => {
      const duration = Math.round(performance.now() - startTime)
      appendLogEntry('error', `Random API: ${scenario.status} ${scenario.statusText} — ${scenario.body.code} (${duration}ms)`)
      console.error(`[API Error] ${scenario.status} ${scenario.statusText}`, scenario.body)
      renderErrorPage(scenario, duration)
    }, simulatedLatency)
  } else {
    const scenario = SUCCESS_SCENARIOS[Math.floor(Math.random() * SUCCESS_SCENARIOS.length)]
    setTimeout(() => {
      const duration = Math.round(performance.now() - startTime)
      appendLogEntry('info', `Random API: 200 OK — ${scenario.label} (${duration}ms)`)
      console.info(`[API Success] 200 OK`, scenario.body)
      renderApiResult(`200 OK — ${scenario.label}`, scenario.body, duration)
    }, scenario.delay)
  }
}

document.querySelector('#btn-random-api')!.addEventListener('click', () => {
  simulateRandomApi()
})
