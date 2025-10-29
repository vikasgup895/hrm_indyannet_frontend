"use client";

import { Briefcase, Users, Calendar, Wallet } from "lucide-react"; // lucide-react icons
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 font-sans flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/next.svg" alt="Logo" width={32} height={32} />
            <span className="font-bold text-lg text-blue-700">Telecom HRM</span>
          </div>
          <nav className="hidden sm:flex gap-6 text-gray-600 font-medium">
            <a href="#" className="hover:text-blue-600">
              Dashboard
            </a>
            <a href="#" className="hover:text-blue-600">
              Employees
            </a>
            <a href="#" className="hover:text-blue-600">
              Leave
            </a>
            <a href="#" className="hover:text-blue-600">
              Payroll
            </a>
          </nav>
          {/* <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">
            Login
          </button> */}
          <Link href="/login">
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-800">
          Streamline Your <span className="text-blue-600">HR</span> Operations
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600 text-lg">
          Manage employees, leave policies, payroll, and attendance seamlessly —
          all in one modern HRM solution tailored for telecom companies.
        </p>
        <div className="mt-6 flex gap-4">
          <button className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">
            Get Started
          </button>
          <button className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">
            Learn More
          </button>
        </div>
      </main>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-2xl bg-white shadow hover:shadow-lg transition flex flex-col items-center text-center">
          <Users className="text-blue-600 mb-3" size={36} />
          <h3 className="font-semibold text-lg">Employee Management</h3>
          <p className="text-sm text-gray-500 mt-2">
            Track employee details, roles, and performance with ease.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white shadow hover:shadow-lg transition flex flex-col items-center text-center">
          <Calendar className="text-blue-600 mb-3" size={36} />
          <h3 className="font-semibold text-lg">Leave & Attendance</h3>
          <p className="text-sm text-gray-500 mt-2">
            Simplify leave requests and attendance tracking for teams.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white shadow hover:shadow-lg transition flex flex-col items-center text-center">
          <Wallet className="text-blue-600 mb-3" size={36} />
          <h3 className="font-semibold text-lg">Payroll Automation</h3>
          <p className="text-sm text-gray-500 mt-2">
            Generate payslips and handle salaries securely.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white shadow hover:shadow-lg transition flex flex-col items-center text-center">
          <Briefcase className="text-blue-600 mb-3" size={36} />
          <h3 className="font-semibold text-lg">Compliance Ready</h3>
          <p className="text-sm text-gray-500 mt-2">
            Stay compliant with policies and regulatory requirements.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/70 backdrop-blur-md py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Telecom HRM. All rights reserved.
      </footer>
    </div>
  );
}
