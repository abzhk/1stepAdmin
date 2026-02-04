import Role from "../models/Role.js";

const MODULES = {
  DASHBOARD: "dashboard",
  PROFILE: "profile",
  PATIENTS: "patients",
  MESSAGES: "messages",
  ASSESSMENT: "assessment",
  APPOINTMENTS: "appointments",
  VIDEO_SESSIONS: "video_sessions",
  REPORTS: "reports",
  BILLING: "billing",
  RESOURCE_LIBRARY: "resource_library",
  SETTINGS: "settings",
};

const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  EXPORT: "export",
};

const seedRoles = async () => {
  try {
    const roles = [
      {
        role: "Parent",
        description: "Parent of child receiving therapy",
        isSuperAdmin: false,
        defaultModules: ["dashboard", "profile"], // Initial unlock
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.PROFILE, actions: [ACTIONS.READ, ACTIONS.UPDATE] },
          { module: MODULES.MESSAGES, actions: [ACTIONS.READ, ACTIONS.CREATE] },
          {
            module: MODULES.ASSESSMENT,
            actions: [ACTIONS.READ, ACTIONS.CREATE],
          },
          {
            module: MODULES.APPOINTMENTS,
            actions: [ACTIONS.READ, ACTIONS.CREATE],
          },
          { module: MODULES.BILLING, actions: [ACTIONS.READ] },
        ],
      },
      {
        role: "Provider",
        description: "Therapist or healthcare provider",
        isSuperAdmin: false,
        defaultModules: ["dashboard", "profile"],
        permissions: [
          { module: MODULES.DASHBOARD, actions: [ACTIONS.READ] },
          { module: MODULES.PROFILE, actions: [ACTIONS.READ, ACTIONS.UPDATE] },
          { module: MODULES.PATIENTS, actions: [ACTIONS.READ, ACTIONS.UPDATE] },
          { module: MODULES.MESSAGES, actions: [ACTIONS.READ, ACTIONS.CREATE] },
          {
            module: MODULES.ASSESSMENT,
            actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
          },
          {
            module: MODULES.APPOINTMENTS,
            actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE],
          },
          {
            module: MODULES.REPORTS,
            actions: [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.EXPORT],
          },
        ],
      },
      {
        role: "Admin",
        description: "System administrator",
        isSuperAdmin: false,
        defaultModules: Object.values(MODULES),
        permissions: Object.values(MODULES).map((module) => ({
          module,
          actions: Object.values(ACTIONS),
        })),
      },
      {
        role: "super_admin",
        description: "Full system access",
        isSuperAdmin: true,
        defaultModules: Object.values(MODULES),
        permissions: [], // Not needed, bypasses all checks
      },
    ];

    for (const roleData of roles) {
      await Role.findOneAndUpdate({ role: roleData.role }, roleData, {
        upsert: true,
        new: true,
      });
    }

    console.log("✅ Roles seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
  }
};

export default seedRoles;
