import { useState } from "react";
import { User, Lock } from "lucide-react";
import FloatingCard from "../common/FloatingCard";
import Button from "../common/Button";
import Input from "../common/Input";
import { useAuth } from "../../shared/context/AuthContext";

export default function LoginModal() {
  const { isLoggedIn, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  if (isLoggedIn) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(username.trim(), password.trim());

    if (!result.success) {
      setLoginError(result.message ?? "Unable to login");
    } else {
      setLoginError("");
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/95 backdrop-blur-md pt-[7%]">
      <div className="w-full max-w-md p-4">
        <FloatingCard>
          <div className="text-center">
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
                <img
                  src="/DeFraudAI_Logo.png"
                  alt="DeFraudAI Logo"
                  className="relative w-20 h-20 object-contain rounded-full border-2 border-blue-500/50 shadow-xl"
                />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome to DeFraudAI
            </h1>
            <p className="text-slate-400">Please login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-300">
                {loginError}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Password Is Important</p>
          </div>
        </FloatingCard>
      </div>
    </div>
  );
}
