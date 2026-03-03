import { useLaunch } from '@tarojs/taro'
import './app.scss'

function App(props) {
  const { children } = props
  useLaunch(() => {
    console.log('App launched.')
  })

  return children
}

export default App
