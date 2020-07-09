import React from 'react'
import ReactDOM from 'react-dom'
import VisualizationStore from 'radar-viz'
import * as inputRuleFuncs from 'radar-viz'
/* eslint import/no-webpack-loader-syntax: off */
import VisualizationStyle from '!!raw-loader!radar-viz/dist/index.css'
/* eslint import/no-webpack-loader-syntax: off */
import visualizationConfigForm from '!!raw-loader!radar-viz/dist/form.xml'
import { account } from '../package.json'

const App = () => {
  return global['__Pandora__VisualizationAppRender'](
    VisualizationStore,
    visualizationConfigForm,
    VisualizationStyle,
    inputRuleFuncs,
    account
  )
}
ReactDOM.render(<App />, document.getElementById('root'))
