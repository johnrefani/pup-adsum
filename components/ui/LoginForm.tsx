"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Password } from "@/lib/icons";
import { useRouter } from "next/navigation";
import { Button, InputField } from "@/lib/imports";

const LoginForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.username === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[470px] h-auto bg-white rounded-lg shadow-xl mx-sm md:mx-md lg:mx-lg">
      <div className="inner flex flex-col p-6 gap-6">
        <div className="flex items-center gap-2">
          <div className="relative w-[100px] h-[100px]">
            <Image src="/logo.svg" alt="logo" fill className="object-contain" />
          </div>
          <div className="text-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-maroon-900">WELCOME BACK</h1>
            <p className="text-sm text-maroon-800">
              Sign in to your account.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Username"
            placeholder="Enter your username"
            icon={<Password />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
          />
          <InputField
            label="Password"
            placeholder="Enter your password"
            icon={<User />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            showPasswordToggle={true}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button
            text={loading ? "Logging in..." : "Login"}
            textColor="text-white"
            backgroundColor="bg-maroon-800 w-full"
            type="submit"
            isDisabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
