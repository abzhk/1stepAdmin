export const enforceBasePermissions = (
  defaultModules = [],
  permissions = []
) => {
  const map = new Map();

  permissions.forEach((p) => {
    map.set(p.module, new Set(p.actions));
  });

  ["dashboard", "profile"].forEach((module) => {
    if (defaultModules.includes(module)) {
      if (!map.has(module)) {
        map.set(module, new Set(["read"]));
      } else {
        map.get(module).add("read");
      }
    }
  });

  return Array.from(map.entries()).map(([module, actions]) => ({
    module,
    actions: Array.from(actions),
  }));
};
