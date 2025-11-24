import React from 'react'
import { Route,Routes,Navigate } from 'react-router-dom'
import Navbar from './Components/Navbar.jsx';
import Login from './Pages/Login.jsx';
import Landing from './Pages/Landing.jsx';
import DashboardNavbar from './Pages/Dashboard/DashboardNavbar.jsx';
import MainDashboard from './Pages/Dashboard/MainDashboard.jsx';
import Layout from './Pages/Dashboard/Layout.jsx';
import Categories from './Pages/Categories/AddCategories.jsx'
import ViewCategories from './Pages/Categories/ViewCategories.jsx';

const App = () => {
  return (
  <Routes>
    <Route path='/' element={<Navigate to = "/landing"/>}/>
    <Route path='/navbar' element={<Navbar />} />
    <Route path='/log' element={<Login />} />
    <Route path='/landing' element={<Landing />} />
    <Route path ='/dashnav'element={<DashboardNavbar/>}/>
   

    <Route element={<Layout/>}>
     <Route path ='/dashboard'element={<MainDashboard/>}/>
     <Route path ='/categories' element={<Categories/>}/>
     <Route path ='/viewcat' element={<ViewCategories/>}/>
    </Route>
    </Routes>
  )
}

export default App