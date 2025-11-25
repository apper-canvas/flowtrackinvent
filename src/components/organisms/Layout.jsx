import { Outlet } from "react-router-dom";
import { useAuth } from "@/layouts/Root";
import { useSelector } from "react-redux";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

function Layout() {
  const { logout } = useAuth();
  const { user, isAuthenticated } = useSelector(state => state.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with logout */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">FlowTrack</h1>
            </div>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  Welcome, {user?.firstName || user?.emailAddress || 'User'}
                </span>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <ApperIcon name="LogOut" size={16} />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout