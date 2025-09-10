"use client";

import { useState } from "react";
import { DashboardData } from "@/lib/types";
import SearchBar from "./search-bar";
import CategorySection from "./category-section";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Settings, MoreHorizontal, Calendar } from "lucide-react";

interface DashboardViewProps {
  data: DashboardData;
}

export default function DashboardView({ data }: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const { categories, availableWidgets } = data;

  const totalWidgets = categories.reduce(
    (sum, category) => sum + category.user_widgets.filter(w => w.is_visible).length,
    0
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <nav className="text-sm text-gray-500">
            <span>Home</span> <span className="mx-2">›</span> <span className="text-gray-900">Dashboard V2</span>
          </nav>
          <div className="flex items-center gap-4">
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">CNAPP Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <Calendar className="w-4 h-4" />
              Last 2 days
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to your CNAPP Dashboard
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating categories and adding widgets to build your security dashboard.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Categories help organize your widgets by security domain (CSPM, CWPP, Registry Scan, etc.)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            categories
              .sort((a, b) => a.display_order - b.display_order)
              .map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  availableWidgets={availableWidgets}
                  searchQuery={searchQuery}
                />
              ))
          )}
        </div>

        {/* Summary Stats */}
        {totalWidgets > 0 && (
          <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dashboard Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalWidgets}</div>
                <div className="text-sm text-gray-600">Active Widgets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{availableWidgets.length}</div>
                <div className="text-sm text-gray-600">Available Templates</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}