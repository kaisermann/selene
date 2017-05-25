import aph from 'aph'
import Router from './utils/Router.js'
import common from './routes/common.js'

// Modify the 'routes' object to include or remove other routes
const routes = {
  common,
}

// Usually, you won't need to modify anything below this line.
const router = new Router(routes)

aph.onDOMLoaded(() => router.loadRoutes())
