import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import Button from "../common/Button";

const signedInNav = [
  { label: "Workspace", to: "/app" },
  { label: "Verify Content", to: "/analysis" },
  { label: "Media Authenticity", to: "/media-authenticity" },
  { label: "Source Intelligence", to: "/source-intelligence" },
  { label: "About", to: "/team" },
];

const signedOutNav = [
  { label: "Mission", to: "/#mission" },
  { label: "Why Choose Us", to: "/#why-us" },
  { label: "Exclusives", to: "/#exclusives" },
  { label: "Team", to: "/team" },
];

export default function SiteHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <header className="bg-slate-900/80 backdrop-blur-2xl border-b border-slate-700/50 fixed top-0 left-0 right-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl transition-opacity duration-300 group-hover:opacity-70" />
                <img
                  src="/DeFraudAI_Logo.png"
                  alt="DeFraudAI Logo"
                  className="relative w-16 h-16 object-contain rounded-full border-2 border-blue-500/50 shadow-xl"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DeFraudAI</h1>
                <p className="text-sm text-slate-400">
                  AI-Powered Truth Verification
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <SignedIn>
                <nav className="flex space-x-2">
                  {signedInNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileNav}
                      className={({ isActive }) =>
                        `text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-colors ${
                          isActive ? "bg-blue-500/20 text-white" : ""
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <UserButton afterSignOutUrl="/" appearance={{ baseTheme: "dark" }} />
              </SignedIn>

              <SignedOut>
                <nav className="flex space-x-2">
                  {signedOutNav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileNav}
                      className={({ isActive }) =>
                        `text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-colors ${
                          isActive ? "bg-blue-500/20 text-white" : ""
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="flex items-center gap-3">
                  <SignInButton mode="modal" afterSignInUrl="/app" afterSignUpUrl="/app">
                    <Button variant="outline" size="sm">
                      Sign in
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal" afterSignUpUrl="/app" afterSignInUrl="/app">
                    <Button size="sm">Get started</Button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
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

      <div className="h-24" />

      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-900/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            <SignedIn>
              <nav className="space-y-3">
                {signedInNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileNav}
                    className={({ isActive }) =>
                      `block text-lg font-medium px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? "bg-blue-500/20 text-white"
                          : "text-slate-300 hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="pt-4">
                <UserButton afterSignOutUrl="/" appearance={{ baseTheme: "dark" }} />
              </div>
            </SignedIn>

            <SignedOut>
              <nav className="space-y-3">
                {signedOutNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileNav}
                    className={({ isActive }) =>
                      `block text-lg font-medium px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? "bg-blue-500/20 text-white"
                          : "text-slate-300 hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="grid grid-cols-1 gap-3 pt-6">
                <SignInButton mode="modal" afterSignInUrl="/app" afterSignUpUrl="/app">
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal" afterSignUpUrl="/app" afterSignInUrl="/app">
                  <Button className="w-full">Create account</Button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </>
  );
}
