import { useState } from "react";
import { Category, WidgetTemplate } from "@/lib/types";
import WidgetCard from "./widget-card";
import WidgetSelector from "./widget-selector";
import { Plus, Shield, Server, Cloud, AlertTriangle } from "lucide-react";

interface CategorySectionProps {
  category: Category;
  availableWidgets: WidgetTemplate[];
  searchQuery: string;
}

const categoryIcons = {
  cspm: Shield,
  cwpp: Server,
  'cloud-accounts': Cloud,
  general: AlertTriangle,
};

export default function CategorySection({
  category,
  availableWidgets,
  searchQuery,
}: CategorySectionProps) {
  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);

  // Filter visible widgets based on search query
  const visibleWidgets = category.user_widgets.filter((widget) => {
    if (!widget.is_visible) return false;
    
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const widgetTemplate = widget.widget_templates;
    
    return (
      widgetTemplate.name.toLowerCase().includes(query) ||
      widgetTemplate.description?.toLowerCase().includes(query) ||
      widgetTemplate.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      widget.custom_content?.toLowerCase().includes(query) ||
      widgetTemplate.default_content.toLowerCase().includes(query)
    );
  });

  // Get IDs of widgets already added to this category
  const existingWidgetIds = category.user_widgets.map(w => w.template_id);

  // Determine category icon
  const categoryType = category.title.toLowerCase().includes('cspm') ? 'csmp' :
                      category.title.toLowerCase().includes('cwpp') ? 'cwpp' :
                      category.title.toLowerCase().includes('cloud') ? 'cloud-accounts' : 'general';
  
  const CategoryIcon = categoryIcons[categoryType as keyof typeof categoryIcons] || AlertTriangle;

  return (
    <section className="mb-12">
      {/* Category Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <CategoryIcon className="w-6 h-6 text-gray-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
            {category.description && (
              <p className="text-gray-600 mt-1">{category.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {visibleWidgets.length} widgets
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsWidgetSelectorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Widget
        </button>
      </div>

      {/* Widgets Grid */}
      {visibleWidgets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <CategoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No widgets match your search" : "No widgets yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? "Try adjusting your search terms"
              : "Add widgets to this category to get started"
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsWidgetSelectorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Your First Widget
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleWidgets
            .sort((a, b) => a.position_order - b.position_order)
            .map((widget) => (
              <WidgetCard key={widget.id} widget={widget} />
            ))}
        </div>
      )}

      {/* Widget Selector Modal */}
      <WidgetSelector
        isOpen={isWidgetSelectorOpen}
        onClose={() => setIsWidgetSelectorOpen(false)}
        categoryId={category.id}
        categoryTitle={category.title}
        availableWidgets={availableWidgets}
        existingWidgetIds={existingWidgetIds}
      />
    </section>
  );
}