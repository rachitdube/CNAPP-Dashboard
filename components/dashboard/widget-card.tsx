"use client";

import { useState, useTransition } from "react";
import { removeWidgetFromCategory, updateWidgetContent } from "@/lib/actions";
import { UserWidget } from "@/lib/types";
import { X, Edit3, Save, AlertTriangle, Shield, Server, Cloud } from "lucide-react";

interface WidgetCardProps {
  widget: UserWidget;
}

const categoryIcons = {
  cspm: Shield,
  cwpp: Server,
  'cloud-accounts': Cloud,
  general: AlertTriangle,
};

const severityColors = {
  critical: "border-l-red-500 bg-red-50",
  high: "border-l-orange-500 bg-orange-50",
  medium: "border-l-yellow-500 bg-yellow-50",
  low: "border-l-blue-500 bg-blue-50",
  info: "border-l-gray-500 bg-gray-50",
};

export default function WidgetCard({ widget }: WidgetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(
    widget.custom_content || widget.widget_templates.default_content
  );
  const [isPending, startTransition] = useTransition();

  if (!widget.is_visible) return null;

  const CategoryIcon = categoryIcons[widget.widget_templates.category_type as keyof typeof categoryIcons] || AlertTriangle;
  const severityClass = widget.widget_templates.severity 
    ? severityColors[widget.widget_templates.severity as keyof typeof severityColors]
    : "border-l-gray-500 bg-gray-50";

  const handleRemove = () => {
    startTransition(() => {
      removeWidgetFromCategory(widget.id);
    });
  };

  const handleSave = () => {
    startTransition(() => {
      updateWidgetContent(widget.id, editContent).then(() => {
        setIsEditing(false);
      });
    });
  };

  const displayContent = widget.custom_content || widget.widget_templates.default_content;

  return (
    <div className={`relative border-l-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow ${severityClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <CategoryIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <h4 className="font-medium text-gray-900 text-sm leading-tight">
            {widget.widget_templates.name}
          </h4>
          {widget.widget_templates.severity && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              widget.widget_templates.severity === 'critical' ? 'bg-red-100 text-red-800' :
              widget.widget_templates.severity === 'high' ? 'bg-orange-100 text-orange-800' :
              widget.widget_templates.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              widget.widget_templates.severity === 'low' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {widget.widget_templates.severity}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isPending}
            className="text-gray-400 hover:text-blue-500 p-1"
            title="Edit content"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-gray-400 hover:text-red-500 p-1"
            title="Remove widget"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {widget.widget_templates.description && (
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          {widget.widget_templates.description}
        </p>
      )}

      {/* Content */}
      <div className="mb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(widget.custom_content || widget.widget_templates.default_content);
                }}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border">
            {displayContent}
          </div>
        )}
      </div>

      {/* Tags */}
      {widget.widget_templates.tags && widget.widget_templates.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {widget.widget_templates.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {widget.widget_templates.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{widget.widget_templates.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}