// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { useAuth } from "@/store/auth";
// import Link from "next/link";
// import {
//   Menu,
//   LogOut,
//   Users,
//   CalendarDays,
//   Wallet,
//   User,
//   Settings,
//   LayoutDashboard,
//   Sun,
//   Moon,
// } from "lucide-react";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { ThemeProvider, useTheme } from "@/context/ThemeProvider";

// // ---- Fonts
// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// // ---- Helper: strip /hrm (basePath) from pathname for comparisons
// function useNormalizedPathname() {
//   const pathname = usePathname() || "/";
//   const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, ""); // "/hrm"
//   return useMemo(() => {
//     if (!base) return pathname;
//     return pathname.startsWith(base)
//       ? pathname.slice(base.length) || "/"
//       : pathname;
//   }, [pathname, base]);
// }

// // ---- Root
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ThemeProvider>
//       <AppLayout>{children}</AppLayout>
//     </ThemeProvider>
//   );
// }

// // ---- App Shell
// function AppLayout({ children }: { children: React.ReactNode }) {
//   const rawPathname = usePathname(); // e.g. "/hrm/login"
//   const pathname = useNormalizedPathname(); // e.g. "/login"
//   const router = useRouter();
//   const { role, logout, token, load } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const { theme, toggleTheme } = useTheme();

//   // Restore session once
//   useEffect(() => {
//     useAuth.getState().load();
//   }, []);

//   // Route guarding (compare against normalized path)
//   useEffect(() => {
//     // not logged in
//     if (!token) {
//       if (pathname.startsWith("/dashboard")) router.replace("/login");
//       else if (pathname !== "/" && !pathname.startsWith("/login"))
//         router.replace("/");
//       return;
//     }
//     // logged in
//     if (pathname === "/" || pathname.startsWith("/login"))
//       router.replace("/dashboard");
//   }, [pathname, token, router]);

//   const handleLogout = () => {
//     logout();
//     router.replace("/login");
//   };

//   const isLoginPage = pathname.startsWith("/login");
//   const isPublicPage = pathname === "/" || isLoginPage;

//   // Public pages (landing/login)
//   if (isPublicPage && !token) {
//     return (
//       <html lang="en" className={theme === "dark" ? "dark" : ""}>
//         <body
//           className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors`}
//         >
//           {children}
//         </body>
//       </html>
//     );
//   }

//   // Authenticated pages
//   return (
//     <html lang="en" className={theme === "dark" ? "dark" : ""}>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300`}
//       >
//         <div className="flex h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
//           {/* Sidebar */}
//           <aside
//             className={`${sidebarOpen ? "w-64" : "w-20"} border-r border-[var(--border-color)] bg-[var(--card-bg)] transition-all duration-300 flex flex-col`}
//           >
//             {/* Header */}
//             <div
//               className={`flex items-center border-b border-[var(--border-color)] ${sidebarOpen ? "justify-between px-4" : "justify-center px-0"} h-[61px]`}
//             >
//               {sidebarOpen && (
//                 <h1 className="font-semibold text-lg text-[var(--text-primary)]">
//                   HRM System
//                 </h1>
//               )}
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
//               >
//                 <Menu className="text-[var(--text-primary)]" size={22} />
//               </button>
//             </div>

//             {/* Navigation */}
//             <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
//               <SidebarLink
//                 href="/dashboard"
//                 icon={<LayoutDashboard size={18} />}
//                 label="Dashboard"
//                 open={sidebarOpen}
//               />
//               {role === "ADMIN" && (
//                 <SidebarLink
//                   href="/employees"
//                   icon={<Users size={18} />}
//                   label="Employees"
//                   open={sidebarOpen}
//                 />
//               )}
//               <SidebarLink
//                 href="/leave"
//                 icon={<CalendarDays size={18} />}
//                 label="Leave"
//                 open={sidebarOpen}
//               />
//               <SidebarLink
//                 href="/payroll"
//                 icon={<Wallet size={18} />}
//                 label="Payroll"
//                 open={sidebarOpen}
//               />
//               <SidebarLink
//                 href="/profile"
//                 icon={<User size={18} />}
//                 label="Profile"
//                 open={sidebarOpen}
//               />
//               <SidebarLink
//                 href="/settings"
//                 icon={<Settings size={18} />}
//                 label="Settings"
//                 open={sidebarOpen}
//               />
//             </nav>

//             {/* Footer actions */}
//             <div className="border-t border-[var(--border-color)] p-4 space-y-3">
//               <button
//                 onClick={toggleTheme}
//                 className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
//               >
//                 {theme === "dark" ? (
//                   <>
//                     <Sun size={18} /> {sidebarOpen && "Light Mode"}
//                   </>
//                 ) : (
//                   <>
//                     <Moon size={18} /> {sidebarOpen && "Dark Mode"}
//                   </>
//                 )}
//               </button>

//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-neutral-800 w-full px-3 py-2 rounded-lg"
//               >
//                 <LogOut size={18} /> {sidebarOpen && "Logout"}
//               </button>
//             </div>
//           </aside>

//           {/* Main */}
//           <div className="flex flex-col flex-1">
//             <Header role={role || ""} />
//             <main className="flex-1 overflow-y-auto p-6">{children}</main>
//           </div>
//         </div>
//       </body>
//     </html>
//   );
// }

// // ---- Sidebar Link (uses normalized pathname for active state)
// function SidebarLink({
//   href,
//   icon,
//   label,
//   open,
// }: {
//   href: string;
//   icon: React.ReactNode;
//   label: string;
//   open: boolean;
// }) {
//   const pathname = useNormalizedPathname(); // e.g. "/dashboard"
//   const active = pathname === href || pathname.startsWith(`${href}/`);

//   return (
//     <Link
//       href={href}
//       className={`group flex items-center rounded-lg transition-all duration-300
//         ${open ? "justify-start gap-3 px-3" : "justify-center px-0"} h-10
//         ${active ? "bg-[var(--hover-bg)] font-semibold" : "text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--button-hover-text)]"}`}
//     >
//       <span className="flex items-center justify-center w-6 min-w-[1.5rem]">
//         {icon}
//       </span>
//       <span
//         className={`transition-all duration-300 ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0 overflow-hidden"}`}
//       >
//         {label}
//       </span>
//     </Link>
//   );
// }

// // ---- Header
// function Header({ role }: { role: string }) {
//   return (
//     <header className="bg-[var(--card-bg)] border-b border-[var(--border-color)] px-6 py-3 flex justify-between items-center">
//       <h2 className="font-semibold text-[var(--text-primary)]">
//         Human Resource Management
//       </h2>
//       <div className="flex items-center gap-3">
//         <span className="text-sm text-gray-500 dark:text-gray-400">
//           Role: <strong>{role}</strong>
//         </span>
//         <div className="w-9 h-9 rounded-full border border-[var(--border-color)] flex items-center justify-center font-bold text-sm bg-blue-600 text-white shadow-sm">
//           {role?.toLowerCase() === "admin" ? "A" : "E"}
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import Link from "next/link";
import {
  Menu,
  LogOut,
  Users,
  CalendarDays,
  Wallet,
  User,
  Settings,
  LayoutDashboard,
  Sun,
  Moon,
  ShieldCheck, // 🛡️ new icon for Insurance
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, useTheme } from "@/context/ThemeProvider";

// ---- Fonts
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ---- Helper: strip /hrm (basePath) from pathname for comparisons
function useNormalizedPathname() {
  const pathname = usePathname() || "/";
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  return useMemo(() => {
    if (!base) return pathname;
    return pathname.startsWith(base)
      ? pathname.slice(base.length) || "/"
      : pathname;
  }, [pathname, base]);
}

// ---- Root
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AppLayout>{children}</AppLayout>
    </ThemeProvider>
  );
}

// ---- App Shell
function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = useNormalizedPathname();
  const router = useRouter();
  const { role, logout, token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // ---- Sidebar collapsible Insurance sublinks
  const [insuranceOpen, setInsuranceOpen] = useState(false);

  // Restore session
  useEffect(() => {
    useAuth.getState().load();
  }, []);

  // Route guarding
  useEffect(() => {
    if (!token) {
      if (pathname.startsWith("/dashboard")) router.replace("/login");
      else if (pathname !== "/" && !pathname.startsWith("/login"))
        router.replace("/");
      return;
    }
    if (pathname === "/" || pathname.startsWith("/login"))
      router.replace("/dashboard");
  }, [pathname, token, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isLoginPage = pathname.startsWith("/login");
  const isPublicPage = pathname === "/" || isLoginPage;

  if (isPublicPage && !token) {
    return (
      <html lang="en" className={theme === "dark" ? "dark" : ""}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors`}
        >
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300`}
      >
        <div className="flex h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
          {/* Sidebar */}
          <aside
            className={`${sidebarOpen ? "w-64" : "w-20"} border-r border-[var(--border-color)] bg-[var(--card-bg)] transition-all duration-300 flex flex-col`}
          >
            {/* Header */}
            <div
              className={`flex items-center border-b border-[var(--border-color)] ${sidebarOpen ? "justify-between px-4" : "justify-center px-0"} h-[61px]`}
            >
              {sidebarOpen && (
                <h1 className="font-semibold text-lg text-[var(--text-primary)]">
                  HRM System
                </h1>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-[var(--hover-bg)] transition"
              >
                <Menu className="text-[var(--text-primary)]" size={22} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              <SidebarLink
                href="/dashboard"
                icon={<LayoutDashboard size={18} />}
                label="Dashboard"
                open={sidebarOpen}
              />
              {role === "ADMIN" && (
                <SidebarLink
                  href="/employees"
                  icon={<Users size={18} />}
                  label="Employees"
                  open={sidebarOpen}
                />
              )}
              <SidebarLink
                href="/leave"
                icon={<CalendarDays size={18} />}
                label="Leave"
                open={sidebarOpen}
              />
              <SidebarLink
                href="/payroll"
                icon={<Wallet size={18} />}
                label="Payroll"
                open={sidebarOpen}
              />

              {/* 🧾 Insurance section with sub-items */}
              {role === "ADMIN" ? (
                <div className="space-y-1">
                  {/* Parent menu item */}
                  <button
                    onClick={() => setInsuranceOpen(!insuranceOpen)}
                    className={`group flex items-center rounded-lg w-full transition-all duration-300 ${
                      sidebarOpen
                        ? "justify-start gap-1.75 px-3"
                        : "justify-center"
                    } h-10 text-[var(--text-primary)] hover:bg-[var(--hover-bg)]`}
                  >
                    <span className=" w-6 min-w-[1.5rem]">
                      <ShieldCheck size={18} />
                    </span>
                    {sidebarOpen && (
                      <>
                        <span>Insurance</span>
                        <span className="ml-auto">
                          {insuranceOpen ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      insuranceOpen && sidebarOpen
                        ? "max-h-60 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="mt-1 pl-[2.7rem] space-y-1">
                      <SidebarLink
                        href="/insurance"
                        icon={<></>}
                        label="Overview"
                        open={sidebarOpen}
                      />
                      <SidebarLink
                        href="/insurance/increment"
                        icon={<></>}
                        label="Increment & Bonus"
                        open={sidebarOpen}
                      />
                      <SidebarLink
                        href="/insurance/ctc"
                        icon={<></>}
                        label="CTC Sheet"
                        open={sidebarOpen}
                      />
                      <SidebarLink
                        href="/insurance/convenience"
                        icon={<></>}
                        label="Convenience Charge"
                        open={sidebarOpen}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Employee menu items */}
                  <SidebarLink
                    href="/insurance/details"
                    icon={<ShieldCheck size={18} />}
                    label="My Insurance"
                    open={sidebarOpen}
                  />
                  {/* <SidebarLink
                    href="/insurance/ecash"
                    icon={<Wallet size={18} />}
                    label="E-Cash Claim"
                    open={sidebarOpen}
                  /> */}
                </>
              )}

              {/* Other menu items */}
              <SidebarLink
                href="/profile"
                icon={<User size={18} />}
                label="Profile"
                open={sidebarOpen}
              />
              <SidebarLink
                href="/settings"
                icon={<Settings size={18} />}
                label="Settings"
                open={sidebarOpen}
              />
            </nav>

            {/* Footer actions */}
            <div className="border-t border-[var(--border-color)] p-4 space-y-3">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition"
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={18} /> {sidebarOpen && "Light Mode"}
                  </>
                ) : (
                  <>
                    <Moon size={18} /> {sidebarOpen && "Dark Mode"}
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:bg-[var(--hover-bg)] w-full px-3 py-2 rounded-lg"
              >
                <LogOut size={18} /> {sidebarOpen && "Logout"}
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="flex flex-col flex-1">
            <Header role={role || ""} />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

// ---- Sidebar Link
function SidebarLink({
  href,
  icon,
  label,
  open,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
}) {
  const pathname = useNormalizedPathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`group flex items-center rounded-lg transition-all duration-300
        ${open ? "justify-start gap-3 px-3" : "justify-center px-0"} h-9
        ${
          active
            ? "bg-[var(--hover-bg)] font-semibold"
            : "text-[var(--text-primary)] hover:bg-[var(--hover-bg)] hover:text-[var(--button-hover-text)]"
        }`}
    >
      {icon}
      {open && <span>{label}</span>}
    </Link>
  );
}

// ---- Header
function Header({ role }: { role: string }) {
  return (
    <header className="bg-[var(--card-bg)] border-b border-[var(--border-color)] px-6 py-3 flex justify-between items-center">
      <h2 className="font-semibold text-[var(--text-primary)]">
        Human Resource Management
      </h2>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Role: <strong>{role}</strong>
        </span>
        <div className="w-9 h-9 rounded-full border border-[var(--border-color)] flex items-center justify-center font-bold text-sm bg-blue-600 text-white shadow-sm">
          {role?.toLowerCase() === "admin" ? "A" : "E"}
        </div>
      </div>
    </header>
  );
}
