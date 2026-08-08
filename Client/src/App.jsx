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
import ViewParent from "./pages/parent/ParentView.jsx";
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
import UpcomingSession from "./pages/Centre/UpcomingSession.jsx";
import EditCentre from "./pages/Centre/CentreEdit.jsx";
import InactiveCentre from "./pages/Centre/CentreInActive.jsx";
import AdminVerificationPanel from "./pages/VerificationPanel/AdminVerificationPanel.jsx";
import AdminProfile from "./pages/Settings/AdminProfile.jsx";
import ProfileSettings from "./pages/Settings/ProfileSettings.jsx";
import Help from "./pages/HelpDesk/Help.jsx";
import AllComplaints from "./pages/HelpDesk/AllComplaints.jsx";
import PermissionRoute from "./pages/PermissionRoute.jsx";
import { MODULES, ACTIONS } from "./constants/permission.js";
import Asssessmentquestionary from "./pages/Assessment/AssessmentCreation.jsx";
import AssessmentList from "./pages/Assessment/AssessmentList.jsx";
import AssessmentQuestions from "./pages/Assessment/AssessmentQuestion.jsx";
import AdminHelpdesk from "./pages/adminHelpdesk/AdminHelpdesk.jsx";
import AdminInbox from "./pages/ContactUs/InboxQuery.jsx";

const App = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

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
        <Route
          path="/log"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route
            path="/viewcat"
            element={
              <PermissionRoute module={MODULES.ARTICLES} action={ACTIONS.READ}>
                <ViewCategories />
              </PermissionRoute>
            }
          />
          <Route
            path="/viewarticle"
            element={
              <PermissionRoute module={MODULES.ARTICLES} action={ACTIONS.READ}>
                <ViewArticle />
              </PermissionRoute>
            }
          />
          <Route
            path="/addassessment"
            element={
              <PermissionRoute
                module={MODULES.ASSESSMENT}
                action={ACTIONS.READ}
              >
                <AddAssessmentCategory />
              </PermissionRoute>
            }
          />
          <Route
            path="/providerassessment"
            element={
              <PermissionRoute
                module={MODULES.ASSESSMENT}
                action={ACTIONS.READ}
              >
                <ProviderAssessment />
              </PermissionRoute>
            }
          />
          <Route
            path="/allproviders"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <ViewProvider />
              </PermissionRoute>
            }
          />
          <Route
            path="/provider-stats/:id"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <ProviderStats />
              </PermissionRoute>
            }
          />
          <Route
            path="/view-parent"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <ViewParent />
              </PermissionRoute>
            }
          />
          <Route
            path="/parent-stats-card/:userId"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <ParentStats />
              </PermissionRoute>
            }
          />
          <Route
            path="/providers/edit/:id"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.UPDATE}>
                <EditProvider />
              </PermissionRoute>
            }
          />
          <Route
            path="/parent/edit/:parentId"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.UPDATE}>
                <EditParent />
              </PermissionRoute>
            }
          />

          <Route
            path="/create-admin"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.CREATE}>
                <CreateAdmin />
              </PermissionRoute>
            }
          />
          {/* <Route path="/create-admin-role" element={<UserTab />} /> */}
          <Route
            path="/create-Role"
            element={
              <PermissionRoute
                module={MODULES.SETTINGS}
                action={ACTIONS.CREATE}
              >
                <RoleTab />
              </PermissionRoute>
            }
          />
          <Route
            path="/view-plans"
            element={
              <PermissionRoute module={MODULES.PLANS} action={ACTIONS.READ}>
                <Plans />{" "}
              </PermissionRoute>
            }
          />
          <Route
            path="/add-plans"
            element={
              <PermissionRoute module={MODULES.PLANS} action={ACTIONS.CREATE}>
                <Addplans />
              </PermissionRoute>
            }
          />
          <Route
            path="/addplans/:id"
            element={
              <PermissionRoute module={MODULES.PLANS} action={ACTIONS.CREATE}>
                <Addplans />
              </PermissionRoute>
            }
          />
          <Route
            path="/inactive-parents"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <InactiveParents />
              </PermissionRoute>
            }
          />
          <Route
            path="/inactive-providers"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <InactiveProviders />
              </PermissionRoute>
            }
          />
          <Route
            path="/list-view-article"
            element={
              <PermissionRoute module={MODULES.ARTICLES} action={ACTIONS.READ}>
                <ListViewArticle />
              </PermissionRoute>
            }
          />
          <Route path="/master-data" element={<PermissionRoute
                module={MODULES.MASTER_DATA}
                action={ACTIONS.READ}
              ><MasterData /> </PermissionRoute>} />
          <Route path="/report" element={<PermissionRoute
                module={MODULES.REPORTS}
                action={ACTIONS.READ}
              ><UserReport /> </PermissionRoute>} />
          <Route path="/reportdashboard" element={<PermissionRoute
                module={MODULES.REPORTS}
                action={ACTIONS.READ}
              ><ReportDashboard /></PermissionRoute>} />
          <Route path="/center-report" element={<PermissionRoute
                module={MODULES.REPORTS}
                action={ACTIONS.READ}
              ><CenterReport /> </PermissionRoute>} />
          <Route
            path="/add-article"
            element={
              <PermissionRoute
                module={MODULES.ARTICLES}
                action={ACTIONS.CREATE}
              >
                <AddArticle />
              </PermissionRoute>
            }
          />
          <Route
            path="/add-article/:id"
            element={
              <PermissionRoute
                module={MODULES.ARTICLES}
                action={ACTIONS.CREATE}
              >
                <AddArticle />
              </PermissionRoute>
            }
          />
          <Route
            path="/tag"
            element={
              <PermissionRoute
                module={MODULES.MASTER_DATA}
                action={ACTIONS.READ}
              >
                <TagArticle />
              </PermissionRoute>
            }
          />
          <Route
            path="/master"
            element={
              <PermissionRoute
                module={MODULES.MASTER_DATA}
                action={ACTIONS.READ}
              >
                <MasterPage />
              </PermissionRoute>
            }
          />
          <Route
            path="/centre"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <CentreDashBoard />
              </PermissionRoute>
            }
          />
          <Route
            path="/centre-list"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <CentreList />
              </PermissionRoute>
            }
          />
          <Route
            path="/centre-detail/:id"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <CentreDetail />
              </PermissionRoute>
            }
          />
          <Route
            path="/upcoming-session"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <UpcomingSession />
              </PermissionRoute>
            }
          />
          <Route
            path="/edit-centre/:id"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.UPDATE}>
                <EditCentre />
              </PermissionRoute>
            }
          />
          <Route
            path="/inactive-centre"
            element={
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
                <InactiveCentre />
              </PermissionRoute>
            }
          />
          <Route
            path="/admin-verify"
            element={
              <PermissionRoute module={MODULES.SETTINGS} action={ACTIONS.READ}>
                <AdminVerificationPanel />
              </PermissionRoute>
            }
          />
          <Route
            path="/admin-profile"
            element={
              <PermissionRoute module={MODULES.SETTINGS} action={ACTIONS.READ}>
                <AdminProfile />
              </PermissionRoute>
            }
          />
          {/* <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/all-complaints" element={<AllComplaints />} /> */}
          <Route
            path="/create-assessment"
            element={
              <PermissionRoute
                module={MODULES.ASSESSMENT}
                action={ACTIONS.CREATE}
              >
                <Asssessmentquestionary />
              </PermissionRoute>
            }
          />
          <Route
            path="/create-assessment/:id"
            element={
              <PermissionRoute
                module={MODULES.ASSESSMENT}
                action={ACTIONS.CREATE}
              >
                <Asssessmentquestionary />
              </PermissionRoute>
            }
          />
          <Route
            path="/assessment-list"
            element={
              <PermissionRoute
                module={MODULES.ASSESSMENT}
                action={ACTIONS.READ}
              >
                <AssessmentList />{" "}
              </PermissionRoute>
            }
          />
          {/* <Route path="/help-desk" element={<AdminHelpdesk />}/> */}
          <Route path="/questions/:id" element={<PermissionRoute
                module={MODULES.ASSESSMENT}
                action={ACTIONS.READ}
              ><AssessmentQuestions /> </PermissionRoute>} />
          <Route
            path="/admin-help-desk"
            element={
              <PermissionRoute module={MODULES.HELP} action={ACTIONS.READ}>
                <AdminHelpdesk />{" "}
              </PermissionRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PermissionRoute module={MODULES.HELP} action={ACTIONS.READ}>
                <AdminInbox />{" "}
              </PermissionRoute>
            }
          />
          <Route
            path="/addassessment/:id"
            element={
              <PermissionRoute
                module={MODULES.ASSESSMENT}
                action={ACTIONS.UPDATE}
              >
                <AddAssessmentCategory />
              </PermissionRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
};

export default App;
