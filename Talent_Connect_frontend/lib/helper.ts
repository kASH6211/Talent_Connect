export const getDashboardRoute = (role: string) => {
  switch (role) {
    case "superadmin":
      return "/admin/dashboard";
    case "institute":
      return "/institute/dashboard";
    case "industry":
      return "/find-institutes";
    default:
      return "/";
  }
};
