export interface WidgetTemplate {
  id: string;
  name: string;
  description: string | null;
  default_content: string;
  category_type: string | null;
  tags: string[];
  icon: string | null;
  severity: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  created_at: string;
  user_widgets: UserWidget[];
}

export interface UserWidget {
  id: string;
  template_id: string;
  custom_content: string | null;
  position_order: number;
  is_visible: boolean;
  created_at: string;
  widget_templates: WidgetTemplate;
}

export interface DashboardData {
  categories: Category[];
  availableWidgets: WidgetTemplate[];
}

export type CategoryType = 'cspm' | 'cwpp' | 'cloud-accounts' | 'general' | 'all';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';