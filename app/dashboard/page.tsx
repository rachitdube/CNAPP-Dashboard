import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardView from "@/components/dashboard/dashboard-view";
import { getDashboardData } from "@/lib/actions";

export default async function DashboardPage() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    try {
        const dashboardData = await getDashboardData();
        return <DashboardView data={dashboardData} />;
    } catch (error) {
        console.error("Error loading dashboard:", error);
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
                    <p className="text-gray-600">Please try refreshing the page.</p>
                </div>
            </div>
        );
    }
}