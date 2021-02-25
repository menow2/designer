import { render } from 'rxui'

import App from './App'

const parent = document.createElement('div')

render(App, parent, () => {
    document.getElementById('app').replaceWith(...[...parent.childNodes])
  }
)