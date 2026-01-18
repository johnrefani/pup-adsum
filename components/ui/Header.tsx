"use client";

import Image from "next/image";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Close } from "@/lib/icons";
import { memberLinks, adminLinks, mainLinks } from "@/lib/imports";
import { HeaderProps } from "@/lib/types";


const Header: React.FC<HeaderProps & { type?: "admin" | "member" | "main" }> = ({
  type = "member",
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Determine which links to use
  const links =
    type === "admin" ? adminLinks : type === "main" ? mainLinks : memberLinks;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/");
      } else {
        console.error("Logout failed");
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="z-80 w-full bg-maroon-900 shadow-md px-4 md:px-10 lg:px-16 xl:px-28">
      <div className="flex items-center py-3 gap-2">
        {/* Logo + Title */}
        <div className="flex items-center gap-1">
          <div className="relative h-12 w-12 md:h-16 md:w-16 lg:w-20 lg:h-20">
            <Image src="/logo.svg" alt="logo" fill className="object-contain" />
          </div>
          <h1 className="text-sm md:text-base lg:text-lg font-bold whitespace-wrap text-white">
            PUP{" "}
            <span className="block text-xs md:text-sm lg:text-base font-semibold">
              Attendance System
            </span>
          </h1>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-6">
          <ul className="flex items-center gap-1">
            {links.map((link, idx) => (
              <li key={idx}>
                <Link
                  href={link.href}
                  className={`px-6 py-3 text-center text-base rounded-md transition whitespace-nowrap ${
                    pathname === link.href
                      ? "text-maroon-900 bg-bg font-medium"
                      : "text-white hover:text-maroon-900 hover:bg-bg hover:font-medium"
                  }`}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right section: Logout (desktop) + Hamburger (mobile) */}
        <div className="flex items-center ml-auto">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`hidden lg:flex px-6 py-3 text-base rounded-md border-2 font-medium transition ${
              isLoggingOut
                ? "bg-bg text-maroon-900 cursor-not-allowed"
                : "bg-white text-maroon-900 hover:bg-bg"
            }`}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>

          {/* Mobile + Tablet Hamburger */}
          <button
            className="lg:hidden text-bg"
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={isLoggingOut}
          >
            {menuOpen ? <Close className="w-auto h-8 md:h-10" /> : <Menu className="w-auto h-8 md:h-10" />}
          </button>
        </div>
      </div>

      {/* Mobile + Tablet Dropdown */}
      {menuOpen && (
        <div className="flex flex-col items-center gap-1 lg:hidden">
          <hr className="w-full border-gray-300" />
          <ul className="flex flex-col items-center gap-1 w-full">
            {links.map((link, idx) => (
              <li key={idx} className="w-full text-center">
                <Link
                  href={link.href}
                  className={`block w-full px-6 py-3 rounded-md text-base transition ${
                    pathname === link.href
                      ? "text-maroon-900 bg-bg font-medium"
                      : "text-white hover:text-maroon-900 hover:bg-bg hover:font-medium"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.title}
                </Link>
              </li>
            ))}
            <hr className="w-full my-2 border-gray-300" />
            <li className="w-full text-center">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`block w-full px-6 py-3 mb-4 text-base font-medium rounded-md border transition ${
                  isLoggingOut
                    ? "bg-bg text-maroon-900 cursor-not-allowed"
                    : "bg-white text-maroon-900 hover:bg-bg"
                }`}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
