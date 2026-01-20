"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { User, Password } from "@/lib/icons";
import { useRouter } from "next/navigation";
import { Button, InputField } from "@/lib/imports";

interface LoginProps {
  initialRedirectTo?: string;
}

const LoginForm = ({ initialRedirectTo }: LoginProps) => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Save redirect URL from QR scan
  useEffect(() => {
    if (initialRedirectTo) {
      sessionStorage.setItem("redirectAfterLogin", initialRedirectTo);
    }
  }, [initialRedirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/login", {
       method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const savedRedirect = sessionStorage.getItem("redirectAfterLogin");
        
        if (savedRedirect) {
          sessionStorage.removeItem("redirectAfterLogin");
          router.push(savedRedirect);
          router.refresh(); // Important: refresh to re-run server checks
        } else {
          if (data.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
          router.refresh();
        }
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[470px] bg-white rounded-2xl shadow-2xl border border-gray-200">
      <div className="p-8 sm:p-10 space-y-8">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24">
            <Image
              src="/logo.svg"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-maroon-900 w-full">
              PUP ADSUM
            </h1>
            <p className="text-sm md:text-base text-maroon-800 w-full">
              Sign in to your account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Username"
            placeholder="Enter your username"
            icon={<User className="w-5 h-5" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            disabled={loading}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            icon={<Password className="w-5 h-5" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            showPasswordToggle={true}
            disabled={loading}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <Button
            text={loading ? "Signing in..." : "Login"}
            backgroundColor="bg-maroon-800 hover:bg-maroon-900"
            textColor="text-white w-full"
            type="submit"
            isDisabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default LoginForm;