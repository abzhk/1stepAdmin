import React from 'react'
import { Route,Routes,Navigate } from 'react-router-dom'
// import Navbar from './Components/Navbar.jsx';
import Login from './Pages/Login.jsx';
// import Landing from './Pages/Landing.jsx';
// import DashboardNavbar from './Pages/Dashboard/DashboardNavbar.jsx';
import MainDashboard from './Pages/Dashboard/MainDashboard.jsx';
import Layout from './Pages/Dashboard/Layout.jsx';
import Categories from './Pages/Categories/AddCategories.jsx'
import ViewCategories from './Pages/Categories/ViewCategories.jsx';
import ViewArticle from './Pages/Article/ViewArticle.jsx';
import AddAssessmentCategory from './Pages/Assessment/AddAssessmentCategory.jsx';
import ProviderAssessment from './Pages/Assessment/ProviderAssessment.jsx';
import ViewProvider from './Pages/Provider/ViewProvider.jsx';
import ProviderStats from './Pages/Provider/ProviderStats.jsx';
import ViewParent from './Pages/Parent/ViewParent.jsx';
import ParentStats from './Pages/parent/ParentStatsCard.jsx'
import EditProvider from './Pages/Provider/EditProvider.jsx'
import EditParent from './Pages/parent/EditParent.jsx';
import PrivateRoute from './Pages/PrivateRoute.jsx';

const App = () => {
  return (
  <Routes>
    <Route path='/' element={<Navigate to = "/log"/>}/>
    {/* <Route path='/navbar' element={<Navbar />} /> */}
    <Route path='/log' element={<Login />} />
    {/* <Route path='/landing' element={<Landing />} /> */}
    {/* <Route path ='/dashnav'element={<DashboardNavbar/>}/> */}
   

    <Route element={<PrivateRoute><Layout/></PrivateRoute>}>
     <Route path ='/dashboard'element={<MainDashboard/>}/>
     <Route path ='/categories' element={<Categories/>}/>
     <Route path ='/viewcat' element={<ViewCategories/>}/>
     <Route path ='/viewarticle' element={<ViewArticle/>}/>
    <Route path ='/addassessment' element={<AddAssessmentCategory/>}/>
    <Route path ='/providerassessment' element={<ProviderAssessment/>}/>
     <Route path ='/allproviders' element={<ViewProvider/>}/>
     <Route path ='/provider-stats/:id' element={<ProviderStats/>}/>
     <Route path ='/view-parent' element={<ViewParent/>}/>
      <Route path="/parent-stats-card/:userId" element={<ParentStats />} />
      <Route path="/providers/edit/:id" element={<EditProvider />} />
      <Route path="/parent/edit/:parentId" element={<EditParent />} />
    </Route>
    </Routes>
  )
}

export default App