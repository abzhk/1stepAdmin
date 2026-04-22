import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import MainDashboard from "./pages/Dashboard/MainDashboard.jsx";
import Layout from "./Components/Layout.jsx";
import Categories from "./pages/ArticleCategories/AddCategories.jsx";
import ViewCategories from "./pages/ArticleCategories/ViewCategories.jsx";
import ViewArticle from "./pages/Article/ViewArticle.jsx";
import AddAssessmentCategory from "./pages/Assessment/AddAssessmentCategory.jsx";
import ProviderAssessment from "./pages/Assessment/ProviderAssessment.jsx";
import ViewProvider from "./pages/Provider/ProviderView.jsx";
import ProviderStats from "./pages/Provider/ProviderStats.jsx";
import ViewParent from "./pages/Parent/ParentView.jsx";
import ParentStats from "./pages/parent/ParentStatsCard.jsx";
import EditProvider from "./pages/Provider/ProviderEdit.jsx";
import EditParent from "./pages/parent/ParentEdit.jsx";
import PrivateRoute from "./pages/PrivateRoute.jsx";
import CreateAdmin from "./pages/CreateUser/CreateAdmin.jsx";
// import UserTab from "./pages/CreateUser/UserTab.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setUser, logout } from "./redux/slice/authSlice.js";
import RoleTab from "./pages/RoleAccess/RoleTab.jsx";
import Plans from "./pages/Subscription/ViewPlans.jsx";
import Addplans from "./pages/Subscription/Addplans.jsx";
import { Toaster } from "react-hot-toast";
import InactiveParents from "./pages/parent/ParentInactive.jsx";
import InactiveProviders from "./pages/Provider/ProviderInactive.jsx";
import ListViewArticle from "./pages/Article/ListViewArticle.jsx";
import MasterData from "./pages/Master/MasterData.jsx";
import UserReport from "./pages/Reports/UserReport.jsx";
import ReportDashboard from "./pages/Reports/ReportDashboard.jsx";
import CenterReport from "./pages/Reports/CenterReport.jsx";
import AddArticle from "./pages/Article/AddArticle.jsx";
import TagArticle from "./pages/Master/TagArticle.jsx";
import MasterPage from "./pages/Master/MasterTab.jsx";
import { api } from "./utils/api.js";
import CentreDashBoard from "./pages/Centre/CentreDashBoard.jsx";
import CentreList from "./pages/Centre/CentreList.jsx";
import CentreDetail from "./pages/Centre/CentreDetails.jsx";
import UpcomingSession from "./pages/Centre/UpcomingSession.jsx"
import EditCentre from "./pages/Centre/CentreEdit.jsx";
import InactiveCentre from "./pages/Centre/CentreInActive.jsx";
import AdminVerificationPanel from "./pages/VerificationPanel/AdminVerificationPanel.jsx";
import AdminProfile from "./pages/Settings/AdminProfile.jsx";
import ProfileSettings from "./pages/Settings/ProfileSettings.jsx";
import Help from "./pages/HelpDesk/Help.jsx";
import AllComplaints from "./pages/HelpDesk/AllComplaints.jsx";

const App = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await api("/api/admin/verify-token", {
          method: "GET",
          credentials: "include", 
        });

        if (data?.success) {
          dispatch(setUser(data.user));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Error restoring session:", error);
        dispatch(logout());
      }
    };

    restoreSession();
  }, [dispatch]);

  if (loading) return null;

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/log" />} />
        <Route path="/log" element={<Login />} />

        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/viewcat" element={<ViewCategories />} />
          <Route path="/viewarticle" element={<ViewArticle />} />
          <Route path="/addassessment" element={<AddAssessmentCategory />} />
          <Route path="/providerassessment" element={<ProviderAssessment />} />
          <Route path="/allproviders" element={<ViewProvider />} />
          <Route path="/provider-stats/:id" element={<ProviderStats />} />
          <Route path="/view-parent" element={<ViewParent />} />
          <Route path="/parent-stats-card/:userId" element={<ParentStats />} />
          <Route path="/providers/edit/:id" element={<EditProvider />} />
          <Route path="/parent/edit/:parentId" element={<EditParent />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
          {/* <Route path="/create-admin-role" element={<UserTab />} /> */}
          <Route path="/create-Role" element={<RoleTab />} />
          <Route path="/view-plans" element={<Plans />} />
          <Route path="/add-plans" element={<Addplans />} />
          <Route path="/addplans/:id" element={<Addplans />} />
          <Route path="/inactive-parents" element={<InactiveParents />} />
          <Route path="/inactive-providers" element={<InactiveProviders />} />
          <Route path="/list-view-article" element={<ListViewArticle />} />
          <Route path="/master-data" element={<MasterData />} />
          <Route path="/report" element={<UserReport />} />
          <Route path="/reportdashboard" element={<ReportDashboard />} />
          <Route path="/center-report" element={<CenterReport />} />
          <Route path="/add-article" element={<AddArticle />} />
          <Route path="/add-article/:id" element={<AddArticle />} />
          <Route path="/tag" element={<TagArticle />} />
          <Route path="/master" element={<MasterPage />} />
          <Route path="/centre" element={<CentreDashBoard/>}/>
          <Route path="/centre-list" element ={<CentreList/>}/>
          <Route path ="/centre-detail/:id" element ={<CentreDetail/>}/>
          <Route path ="/upcoming-session" element={<UpcomingSession/>}/>
          <Route path ="/edit-centre/:id" element={<EditCentre/>}/>
          <Route path="/inactive-centre" element={<InactiveCentre/>}/>
          <Route path="/admin-verify" element={<AdminVerificationPanel/>} />
          <Route path="/admin-profile" element={<AdminProfile/>} />
          <Route path="/profile-settings" element={<ProfileSettings/>} />
          <Route path="/help" element={<Help/>} />
          <Route path="/all-complaints" element={<AllComplaints/>} />
        </Route>
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
};

export default App;
