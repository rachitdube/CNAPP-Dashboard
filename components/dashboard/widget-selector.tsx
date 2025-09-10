"use client";

import { useState, useTransition } from "react";
import { addWidgetToCategory } from "@/lib/actions";
import { WidgetTemplate, CategoryType } from "@/lib/types";
import { X, Search, Plus, Shield, Cloud, Server, AlertTriangle } from "lucide-react";

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryTitle: string;
  availableWidgets: WidgetTemplate[];
  existingWidgetIds: string[];
}

const categoryIcons = {
  cspm: Shield,
  cwpp: Server,
  'cloud-accounts': Cloud,
  general: AlertTriangle,
};

const severityColors = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-blue-100 text-blue-800 border-blue-300",
  info: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function WidgetSelector({
  isOpen,
  onClose,
  categoryId,
  categoryTitle,
  availableWidgets,
  existingWidgetIds,
}: WidgetSelectorProps) {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  // Filter widgets based on search and category
  const filteredWidgets = availableWidgets.filter((widget) => {
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || widget.category_type === selectedCategory;
    
    // Don't show widgets that are already added to this category
    const notAlreadyAdded = !existingWidgetIds.includes(widget.id);
    
    return matchesSearch && matchesCategory && notAlreadyAdded;
  });

  const categories = [
    { value: "all" as CategoryType, label: "All Categories", icon: AlertTriangle },
    { value: "cspm" as CategoryType, label: "CSPM", icon: Shield },
    { value: "cwpp" as CategoryType, label: "CWPP", icon: Server },
    { value: "cloud-accounts" as CategoryType, label: "Cloud Accounts", icon: Cloud },
    { value: "general" as CategoryType, label: "General", icon: AlertTriangle },
  ];

  const handleAddWidget = () => {
    if (!selectedWidget) return;
    
    startTransition(() => {
      addWidgetToCategory(selectedWidget, categoryId).then(() => {
        onClose();
        setSelectedWidget(null);
        setSearchQuery("");
        setSelectedCategory("all");
      }).catch((error) => {
        console.error("Failed to add widget:", error);
      });
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Widget to {categoryTitle}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search and Filter */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Widget List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredWidgets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No widgets available to add.</p>
              <p className="text-sm">
                {existingWidgetIds.length > 0
                  ? "All matching widgets are already added to this category."
                  : "Try adjusting your search or category filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {filteredWidgets.map((widget) => {
                const CategoryIcon = categoryIcons[widget.category_type as keyof typeof categoryIcons] || AlertTriangle;
                
                return (
                  <div
                    key={widget.id}
                    onClick={() => setSelectedWidget(widget.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedWidget === widget.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className="w-4 h-4 text-gray-500" />
                          <h3 className="font-medium text-gray-900">{widget.name}</h3>
                          {widget.severity && (
                            <span className={`px-2 py-1 text-xs rounded-full border ${
                              severityColors[widget.severity as keyof typeof severityColors] || severityColors.info
                            }`}>
                              {widget.severity}
                            </span>
                          )}
                        </div>
                        
                        {widget.description && (
                          <p className="text-sm text-gray-600 mb-2">{widget.description}</p>
                        )}
                        
                        <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
                          {widget.default_content}
                        </p>
                        
                        {widget.tags && widget.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {widget.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {widget.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{widget.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-3 flex-shrink-0">
                        {selectedWidget === widget.id ? (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWidget}
              disabled={isPending || !selectedWidget}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isPending ? "Adding..." : "Add Widget"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}