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
import ViewArticle from './Pages/Article/ViewArticle.jsx';
import AddAssessmentCategory from './Pages/Assessment/AddAssessmentCategory.jsx';
import ProviderAssessment from './Pages/Assessment/ProviderAssessment.jsx';

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
     <Route path ='/viewarticle' element={<ViewArticle/>}/>
    <Route path ='/addassessment' element={<AddAssessmentCategory/>}/>
    <Route path ='/providerassessment' element={<ProviderAssessment/>}/>
    </Route>
    </Routes>
  )
}

export default App