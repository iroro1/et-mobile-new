"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Award,
  Briefcase,
  Wrench,
  Settings,
  BookOpen,
  Database,
} from "lucide-react";
import { CmsNavLink } from "@/components/cms/cms-nav-link";
import { SignOutButton } from "@/components/cms/sign-out-button";
import { AuthProvider } from "@/contexts/auth-context";

export default function CmsLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-secondary/20 bg-background/95 backdrop-blur-md md:flex md:flex-col">
          <div className="flex h-20 items-center border-b border-secondary/20 px-6">
            <Link href="/cms" className="flex items-center gap-2">
              <span className="gradient-text text-xl font-bold">Leo CMS</span>
            </Link>
          </div>
          <div className="flex flex-1 flex-col justify-between overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              <CmsNavLink
                href="/cms"
                icon={<LayoutDashboard className="h-5 w-5" />}
              >
                Dashboard
              </CmsNavLink>
              <CmsNavLink
                href="/cms/projects"
                icon={<FolderKanban className="h-5 w-5" />}
              >
                Projects
              </CmsNavLink>
              <CmsNavLink
                href="/cms/blog"
                icon={<FileText className="h-5 w-5" />}
              >
                Blog Posts
              </CmsNavLink>
              <CmsNavLink
                href="/cms/certifications"
                icon={<Award className="h-5 w-5" />}
              >
                Certifications
              </CmsNavLink>
              <CmsNavLink
                href="/cms/courses"
                icon={<BookOpen className="h-5 w-5" />}
              >
                Courses
              </CmsNavLink>
              <CmsNavLink
                href="/cms/experiences"
                icon={<Briefcase className="h-5 w-5" />}
              >
                Experiences
              </CmsNavLink>
              <CmsNavLink
                href="/cms/skills"
                icon={<Wrench className="h-5 w-5" />}
              >
                Skills
              </CmsNavLink>
              <CmsNavLink
                href="/cms/settings"
                icon={<Settings className="h-5 w-5" />}
              >
                Settings
              </CmsNavLink>
              {/* <CmsNavLink href="/cms/settings/data" icon={<Database className="h-5 w-5" />}>
                Data Management
              </CmsNavLink> */}
            </nav>
            <div className="px-3">
              <SignOutButton />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:pl-64">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
