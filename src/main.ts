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
    </div>
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
