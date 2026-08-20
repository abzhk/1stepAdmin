import React, { lazy, Suspense, useEffect } from "react";

import { Route, Routes, Navigate } from "react-router-dom";

import Layout from "./Components/Layout.jsx";

import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "./redux/slice/authSlice.js";

import { Toaster } from "react-hot-toast";

import { api } from "./utils/api.js";

import PrivateRoute from "./pages/PrivateRoute.jsx";
import PermissionRoute from "./pages/PermissionRoute.jsx";

import { MODULES, ACTIONS } from "./constants/permission.js";



const Login = lazy(() =>
  import("./pages/Login.jsx")
);

const MainDashboard = lazy(() =>
  import("./pages/Dashboard/MainDashboard.jsx")
);

const Categories = lazy(() =>
  import("./pages/ArticleCategories/AddCategories.jsx")
);

const ViewCategories = lazy(() =>
  import("./pages/ArticleCategories/ViewCategories.jsx")
);

const ViewArticle = lazy(() =>
  import("./pages/Article/ViewArticle.jsx")
);

const AddAssessmentCategory = lazy(() =>
  import("./pages/Assessment/AddAssessmentCategory.jsx")
);

const ProviderAssessment = lazy(() =>
  import("./pages/Assessment/ProviderAssessment.jsx")
);

const ViewProvider = lazy(() =>
  import("./pages/Provider/ProviderView.jsx")
);

const ProviderStats = lazy(() =>
  import("./pages/Provider/ProviderStats.jsx")
);

const ViewParent = lazy(() =>
  import("./pages/parent/ParentView.jsx")
);

const ParentStats = lazy(() =>
  import("./pages/parent/ParentStatsCard.jsx")
);

const EditProvider = lazy(() =>
  import("./pages/Provider/ProviderEdit.jsx")
);

const EditParent = lazy(() =>
  import("./pages/parent/ParentEdit.jsx")
);

const CreateAdmin = lazy(() =>
  import("./pages/CreateUser/CreateAdmin.jsx")
);

const RoleTab = lazy(() =>
  import("./pages/RoleAccess/RoleTab.jsx")
);

const Plans = lazy(() =>
  import("./pages/Subscription/ViewPlans.jsx")
);

const Addplans = lazy(() =>
  import("./pages/Subscription/Addplans.jsx")
);

const InactiveParents = lazy(() =>
  import("./pages/parent/ParentInactive.jsx")
);

const InactiveProviders = lazy(() =>
  import("./pages/Provider/ProviderInactive.jsx")
);

const ListViewArticle = lazy(() =>
  import("./pages/Article/ListViewArticle.jsx")
);

const MasterData = lazy(() =>
  import("./pages/Master/MasterData.jsx")
);

const UserReport = lazy(() =>
  import("./pages/Reports/UserReport.jsx")
);

const ReportDashboard = lazy(() =>
  import("./pages/Reports/ReportDashboard.jsx")
);

const CenterReport = lazy(() =>
  import("./pages/Reports/CenterReport.jsx")
);

const AddArticle = lazy(() =>
  import("./pages/Article/AddArticle.jsx")
);

const TagArticle = lazy(() =>
  import("./pages/Master/TagArticle.jsx")
);

const MasterPage = lazy(() =>
  import("./pages/Master/MasterTab.jsx")
);

const CentreDashBoard = lazy(() =>
  import("./pages/Centre/CentreDashBoard.jsx")
);

const CentreList = lazy(() =>
  import("./pages/Centre/CentreList.jsx")
);

const CentreDetail = lazy(() =>
  import("./pages/Centre/CentreDetails.jsx")
);

const UpcomingSession = lazy(() =>
  import("./pages/Centre/UpcomingSession.jsx")
);

const EditCentre = lazy(() =>
  import("./pages/Centre/CentreEdit.jsx")
);

const InactiveCentre = lazy(() =>
  import("./pages/Centre/CentreInActive.jsx")
);

const AdminVerificationPanel = lazy(() =>
  import("./pages/VerificationPanel/AdminVerificationPanel.jsx")
);

const AdminProfile = lazy(() =>
  import("./pages/Settings/AdminProfile.jsx")
);

const ProfileSettings = lazy(() =>
  import("./pages/Settings/ProfileSettings.jsx")
);

const Help = lazy(() =>
  import("./pages/HelpDesk/Help.jsx")
);

const AllComplaints = lazy(() =>
  import("./pages/HelpDesk/AllComplaints.jsx")
);

const Asssessmentquestionary = lazy(() =>
  import("./pages/Assessment/AssessmentCreation.jsx")
);

const AssessmentList = lazy(() =>
  import("./pages/Assessment/AssessmentList.jsx")
);

const AssessmentQuestions = lazy(() =>
  import("./pages/Assessment/AssessmentQuestion.jsx")
);

const AdminHelpdesk = lazy(() =>
  import("./pages/adminHelpdesk/AdminHelpdesk.jsx")
);

const AdminInbox = lazy(() =>
  import("./pages/ContactUs/InboxQuery.jsx")
);

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
      <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-offwhite">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
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
                module={MODULES.Roles}
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
              <PermissionRoute module={MODULES.Roles} action={ACTIONS.READ}>
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
      </Suspense>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
};

export default App;
