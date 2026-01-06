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
// import CreateAdmin from './Pages/CreateUser/CreateAdmin.jsx';
import UserTab from './Pages/CreateUser/UserTab.jsx';
import { useDispatch,useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setUser, logout } from '../../Client/src/redux/slice/authSlice.js';

const App = () => {

  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/api/admin/verify-token",
          {
            method: "GET",
            credentials: "include", 
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          dispatch(setUser(data.user));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        dispatch(logout());
      }
    };

    restoreSession();
  }, [dispatch]);

  if (loading) return null;
  
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
      {/* <Route path="/create-admin" element={<CreateAdmin/>}/> */}
      <Route path="/create-admin" element={<UserTab/>}/>
    </Route>
    </Routes>
  )
}

export default App