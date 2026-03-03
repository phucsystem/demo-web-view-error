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
    </div>
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
