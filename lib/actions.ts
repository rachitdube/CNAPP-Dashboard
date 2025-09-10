"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addWidgetToCategory(templateId: string, categoryId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data: existingWidget } = await supabase
        .from("user_widgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("category_id", categoryId)
        .eq("template_id", templateId)
        .single();

    if (existingWidget) {
        throw new Error("Widget already exists in this category");
    }

    const { data: maxPosition } = await supabase
        .from("user_widgets")
        .select("position_order")
        .eq("user_id", user.id)
        .eq("category_id", categoryId)
        .order("position_order", { ascending: false })
        .limit(1)
        .single();

    const nextPosition = (maxPosition?.position_order || 0) + 1;

    const { error } = await supabase
        .from("user_widgets")
        .insert({
            user_id: user.id,
            category_id: categoryId,
            template_id: templateId,
            position_order: nextPosition,
        });

    if (error) {
        throw new Error("Failed to add widget");
    }

    revalidatePath("/dashboard");
}

export async function removeWidgetFromCategory(userWidgetId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from("user_widgets")
        .delete()
        .eq("id", userWidgetId)
        .eq("user_id", user.id);

    if (error) {
        throw new Error("Failed to remove widget");
    }

    revalidatePath("/dashboard");
}

export async function updateWidgetContent(userWidgetId: string, content: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from("user_widgets")
        .update({ custom_content: content })
        .eq("id", userWidgetId)
        .eq("user_id", user.id);

    if (error) {
        throw new Error("Failed to update widget content");
    }

    revalidatePath("/dashboard");
}

export async function getDashboardData() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select(`
      id,
      title,
      description,
      display_order,
      created_at,
      user_widgets:user_widgets(
        id,
        template_id,
        custom_content,
        position_order,
        is_visible,
        created_at
      )
    `)
        .eq("user_id", user.id)
        .order("display_order", { ascending: true });

    if (categoriesError) {
        throw new Error("Failed to fetch categories");
    }

    const { data: templates, error: templatesError } = await supabase
        .from("widget_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

    if (templatesError) {
        throw new Error("Failed to fetch widget templates");
    }

    const templateMap = new Map(templates?.map(t => [t.id, t]) || []);

    const categoriesWithTemplates = categories?.map(category => ({
        ...category,
        user_widgets: category.user_widgets.map(widget => ({
            ...widget,
            widget_templates: templateMap.get(widget.template_id)!
        }))
    })) || [];

    return {
        categories: categoriesWithTemplates,
        availableWidgets: templates || [],
    };
}
