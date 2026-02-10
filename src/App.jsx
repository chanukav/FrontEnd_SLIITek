import { useState } from 'react'
import TailwindTest from './components/TailwindTest'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TailwindTest />

    </>
  )
}

export default App
