import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ThemeContext } from './Context/ThemeContext'
import Navigation from './Navigation/Navigation'
import Home from './Home/Home'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <ThemeContext defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<Navigation/>}>
          <Route index element={<Home/>}></Route>
        </Route>
      </Routes>
    </ThemeContext>
    </BrowserRouter>
  </StrictMode>,
)
