
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'
import {BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Auth from './pages/auth/Auth'
import Dashboard from './pages/dashboard/dashboard'
import IsLogin from './pages/auth/isLogin.jsx'

function App() {
  

  return (
    <Router>
      <Routes>
        <Route element ={<IsLogin/>}>
          <Route path='/' element={<Dashboard/>}/>
        </Route>
        <Route path='/signup' element={<Auth type="signup"/>}/>
        <Route path='/login' element={<Auth type="login"/>}/>
      </Routes>
    </Router>

  )
}

export default App
