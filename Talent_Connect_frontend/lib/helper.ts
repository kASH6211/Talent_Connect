export const getDashboardRoute = (role: string) => {
  switch (role) {
    case "superadmin":
    case "admin":
      return "/admin/dashboard";
    case "institute":
      return "/institute/inbox";
    case "industry":
      return "/sent-offers";
    case "dept_admin":
      return "/dept-admin/state-overview";
    default:
      return "/";
  }
};
