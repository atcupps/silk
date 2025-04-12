import { Routes, Route } from 'react-router-dom'
import './App.css'
import Browse from './pages/Browse'
import Fufillments from './pages/Fufillments'
import Listing from './pages/Listing'
import Wishlist from './pages/Wishlist'
import Create from './pages/Create'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Browse />} />
      <Route path="/fufillments" element={<Fufillments />} />
      <Route path="/listing" element={<Listing />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/create" element={<Create />} />
    </Routes>
  )
}

export default App
