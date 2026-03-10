export const getDashboardRoute = (role: string) => {
  switch (role) {
    case "superadmin":
    case "admin":
      return "/admin/dashboard";
    case "institute":
      return "/institute/dashboard";
    case "industry":
      return "/find-institutes";
    case "dept_admin":
      return "/dept-admin/dashboard";
    default:
      return "/";
  }
};
