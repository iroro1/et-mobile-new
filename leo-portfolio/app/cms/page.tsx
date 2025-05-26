"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderKanban,
  FileText,
  Award,
  Briefcase,
  Wrench,
  BookOpen,
} from "lucide-react";

export default function CmsDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const [projectsCount, setProjectsCount] = useState("0");
  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.push("/cms/login");
        return;
      }

      if (data.session.user.email !== "ojigboleo@gmail.com") {
        await supabase.auth.signOut();
        router.push("/cms/login?error=unauthorized");
        return;
      }

      setIsLoading(false);
    }

    checkSession();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // useEffect(() => {
  //   fetchProjects();
  // }, []);
  async function fetchProjects() {
    try {
      const { count, error } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      if (count !== null) {
        setProjectsCount(count.toString());
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error.message);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Projects"
          value={`${projectsCount}`}
          description="Total projects in your portfolio"
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <DashboardCard
          title="Blog Posts"
          value="10"
          description="Published articles"
          icon={<FileText className="h-5 w-5" />}
        />
        <DashboardCard
          title="Certifications"
          value="6"
          description="Professional certifications"
          icon={<Award className="h-5 w-5" />}
        />
        <DashboardCard
          title="Courses"
          value="11"
          description="Completed courses"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <DashboardCard
          title="Experiences"
          value="10"
          description="Work experiences"
          icon={<Briefcase className="h-5 w-5" />}
        />
        <DashboardCard
          title="Skills"
          value="7"
          description="Technical skills"
          icon={<Wrench className="h-5 w-5" />}
        />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your CMS</CardTitle>
            <CardDescription>
              Manage your portfolio content from this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use the navigation menu on the left to manage different sections
              of your portfolio. You can add, edit, or remove content from your
              projects, blog posts, certifications, experiences, and skills.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function DashboardCard({
  title,
  value,
  description,
  icon,
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full bg-secondary/10 p-2 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
