import React, { useState } from "react";
import { NavLink } from "react-router";
import { MdDashboard, MdMenu, MdClose } from "react-icons/md";
import { ImProfile } from "react-icons/im";
import { AiOutlineProfile } from "react-icons/ai";
import { RiSkullFill } from "react-icons/ri";
import { IoPersonAddSharp } from "react-icons/io5";
import { FaFileCsv } from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/", icon: MdDashboard },
    { name: "Profile", path: "/profile", icon: ImProfile },
    {
      name: "Segmentation",
      path: "/segmentation",
      icon: AiOutlineProfile,
    },
    { name: "Risk", path: "/risks", icon: RiSkullFill },
    {
      name: "Add data",
      path: "/form",
      icon: IoPersonAddSharp,
    },
    {
      name: "Upload CSV",
      path: "/csv",
      icon: FaFileCsv,
    },
  ];

  const linkClasses = ({ isActive }) =>
    `py-3 px-4 rounded-3xl flex gap-3 items-center font-semibold
    transition-colors duration-200
    ${
      isActive
        ? "bg-white text-[#319574]"
        : "text-white hover:bg-white hover:text-[#319574]"
    }`;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
        className="fixed top-4 left-4 z-50 md:hidden
        bg-[#319574] text-white p-2 rounded-lg shadow-md"
      >
        {isOpen ? <MdClose size={26} /> : <MdMenu size={26} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40
          h-screen w-[260px] md:w-[220px]
          bg-[#319574] text-white
          flex flex-col gap-2 px-5 py-8
          shadow-lg
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Heading */}
        <h2 className="text-xl font-bold ms-6 mb-6 px-4">My Dashboard</h2>

        {/* Navigation Links */}
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={() => setIsOpen(false)}
            className={linkClasses}
          >
            <Icon size={20} />
            <span>{name}</span>
          </NavLink>
        ))}
      </aside>
    </>
  );
}

export default Sidebar;
