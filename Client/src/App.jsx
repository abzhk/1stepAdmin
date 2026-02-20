import React from 'react'
import { Route,Routes,Navigate } from 'react-router-dom'
// import Navbar from './Components/Navbar.jsx';
import Login from './pages/Login.jsx';
// import Landing from './pages/Landing.jsx';
// import DashboardNavbar from './pages/Dashboard/DashboardNavbar.jsx';
import MainDashboard from './pages/Dashboard/MainDashboard.jsx';
import Layout from './pages/Dashboard/Layout.jsx';
import Categories from './pages/Categories/AddCategories.jsx'
import ViewCategories from './pages/Categories/ViewCategories.jsx';
import ViewArticle from './pages/Article/ViewArticle.jsx';
import AddAssessmentCategory from './pages/Assessment/AddAssessmentCategory.jsx';
import ProviderAssessment from './pages/Assessment/ProviderAssessment.jsx';
import ViewProvider from './pages/Provider/ViewProvider.jsx';
import ProviderStats from './pages/Provider/ProviderStats.jsx';
import ViewParent from './pages/parent/ViewParent.jsx';
import ParentStats from './pages/parent/ParentStatsCard.jsx'
import EditProvider from './pages/Provider/EditProvider.jsx'
import EditParent from './pages/parent/EditParent.jsx';
import PrivateRoute from './pages/PrivateRoute.jsx';
import CreateAdmin from './pages/CreateUser/CreateAdmin.jsx';
import UserTab from './pages/CreateUser/UserTab.jsx';
import { useDispatch,useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setUser, logout } from './redux/slice/authSlice.js';
import RoleTab from './pages/RoleAccess/RoleTab.jsx'
import Plans from './pages/Subscription/ViewPlans.jsx';
import Addplans from './pages/Subscription/Addplans.jsx';
import { Toaster } from "react-hot-toast";
import InactiveParents from './pages/parent/InactiveParents.jsx';
import InactiveProviders from './pages//Provider/InactiveProvider.jsx';
import ListViewArticle from './pages/Article/ListViewArticle.jsx';
import MasterData from "./pages/Master/MasterData.jsx"

const App = () => {

  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const API = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API}/api/admin/verify-token`, {
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
     <>
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
      <Route path="/create-admin" element={<CreateAdmin/>}/>
      <Route path="/create-admin-role" element={<UserTab/>}/>
       <Route path="/create-Role" element={<RoleTab/>}/>
        <Route path="/view-plans" element={<Plans/>}/>
        <Route path="/add-plans" element={<Addplans/>}/>
        <Route path="/addplans/:id" element={<Addplans />} />
        <Route path="/inactive-parents" element={<InactiveParents />} />
     <Route path="/inactive-providers" element={<InactiveProviders />} />
     <Route path="/list-view-article" element={<ListViewArticle />} />
     <Route path="/master-data" element={<MasterData />} />
    </Route>
    </Routes>
     <Toaster
        position="top-right"
        toastOptions={{ duration: 3000 }}
      />
    </>
  )
}

export default App