import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, ChevronRight } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import Button from "../common/Button";

const signedInNav = [
  { label: "Workspace", to: "/app" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Verify Content", to: "/analysis" },
  { label: "Media Authenticity", to: "/media-authenticity" },
  { label: "Source Intelligence", to: "/source-intelligence" },
];

const signedOutNav = [
  { label: "Mission", to: "/mission" },
  { label: "Why Choose Us", to: "/why-choose-us" },
  { label: "Exclusives", to: "/exclusives" },
  { label: "About", to: "/team" },
];

export default function SiteHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);
  const closeMobileNav = () => setMobileNavOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileNav();
    navigate("/");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
          ? "bg-slate-950/80 backdrop-blur-md border-slate-800/60 shadow-xl py-3"
          : "bg-transparent border-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg transition-opacity duration-300 group-hover:opacity-100 opacity-50" />
                <img
                  src="/logo-v2.png"
                  alt="DeFraudAI Logo"
                  className="relative w-10 h-10 object-cover rounded-full shadow-md"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors">
                  DeFraudAI
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none mt-1">
                  Truth Verification
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {isLoggedIn ? (
                <>
                  <nav className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-full border border-slate-800/50 backdrop-blur-sm mr-4">
                    {signedInNav.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                    {/* Separate About link for logged in users */}
                    <NavLink
                      to="/team"
                      className={({ isActive }) =>
                        `text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`
                      }
                    >
                      About
                    </NavLink>
                  </nav>

                  {/* User Profile & Logout */}
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                    <div className="flex items-center gap-2 pr-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white leading-none">
                          {user?.name?.split(" ")[0]}
                        </span>
                        <span className="text-[10px] text-slate-500 leading-none mt-0.5">
                          Basic Plan
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0 rounded-full"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <nav className="flex items-center gap-6 mr-8">
                    {signedOutNav.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `text-sm font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-300 hover:text-white"
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>

                  <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                        Log in
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-900/20">
                        Get Scanned <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-300 hover:text-white"
              onClick={toggleMobileNav}
            >
              {mobileNavOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content jump */}
      <div className="h-20" />

      {/* Mobile Navigation Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl lg:hidden animation-fade-in">
          <div className="flex flex-col h-full pt-28 px-6 pb-10">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{user?.name || user?.email}</h3>
                    <p className="text-xs text-slate-500">Workspace Owner</p>
                  </div>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto">
                  {signedInNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileNav}
                      className={({ isActive }) =>
                        `flex items-center text-base font-medium px-4 py-3.5 rounded-xl transition-all ${isActive
                          ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <NavLink
                    to="/team"
                    onClick={closeMobileNav}
                    className={({ isActive }) =>
                      `flex items-center text-base font-medium px-4 py-3.5 rounded-xl transition-all ${isActive
                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`
                    }
                  >
                    About
                  </NavLink>
                </nav>

                <div className="pt-6 border-t border-slate-800">
                  <Button variant="outline" className="w-full justify-center border-slate-700 hover:bg-slate-800" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <nav className="flex-1 space-y-4">
                  {signedOutNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileNav}
                      className={({ isActive }) =>
                        `block text-2xl font-bold ${isActive ? "text-blue-400" : "text-white"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="grid grid-cols-1 gap-4 pt-8">
                  <Link to="/login" onClick={closeMobileNav}>
                    <Button variant="outline" className="w-full justify-center py-6 text-lg border-slate-700">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileNav}>
                    <Button className="w-full justify-center py-6 text-lg bg-blue-600 hover:bg-blue-500">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
