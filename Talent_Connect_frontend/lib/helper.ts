export const getDashboardRoute = (role: string) => {
  switch (role) {
    case "superadmin":
    case "admin":
      return "/admin/dashboard";
    case "institute":
      return "/institute/dashboard";
    case "industry":
      return "/sent-offers";
    case "dept_admin":
      return "/all-requests";
    default:
      return "/";
  }
};
