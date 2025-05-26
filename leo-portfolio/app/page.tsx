import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Github, Linkedin, Mail, Twitter, ArrowRight, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContactForm from "@/components/contact-form"
import SkillBar from "@/components/skill-bar"
import Timeline from "@/components/timeline"
import ProjectCard from "@/components/project-card"
import { getFeaturedProjects } from "@/lib/projects-service"
import { getCredlyCertifications } from "@/lib/credly-service"
import { getSkills } from "@/lib/skills-service"
import CredlyCertificationCard from "@/components/credly-certification-card"

async function FeaturedProjects() {
  const featuredProjects = await getFeaturedProjects()

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {featuredProjects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  )
}

async function CredlyCertifications() {
  const certifications = await getCredlyCertifications()

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {certifications.slice(0, 6).map((certification) => (
        <CredlyCertificationCard key={certification.id} certification={certification} />
      ))}
    </div>
  )
}

async function SkillsSection() {
  const skills = await getSkills()

  return (
    <div className="space-y-6">
      {skills.map((skill) => (
        <SkillBar
          key={skill._id}
          name={skill.title}
          percentage={skill.rating * 20} // Convert 1-5 rating to percentage
        />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 animated-gradient-bg">
          <Image
            src="/images/polygon-background.png"
            alt="Background pattern"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="noise-bg container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center text-center">
              <Badge className="mb-6 bg-secondary px-4 py-1 text-sm font-medium text-foreground">
                Full Stack Engineer
              </Badge>
              <h1 className="gradient-text mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Crafting Digital Experiences
              </h1>
              <p className="mb-10 max-w-2xl text-xl text-muted-foreground">
                Building innovative web and cross-platform mobile solutions for impactful user experiences
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="group" asChild>
                  <a href="#projects">
                    View My Work
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#contact">Let's Talk</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <Badge className="mb-4 bg-secondary px-3 py-1 text-sm font-medium text-foreground">About Me</Badge>
              <h2 className="gradient-text mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Passionate about creating exceptional digital solutions
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  An accomplished engineer with a proven track record, competent in roles such as a Chief Technology
                  Officer (CTO), Engineering Lead, Frontend or Fullstack Engineer and other positions focused on the
                  development of secure, innovative digital products.
                </p>
                <p>
                  With over a decade of experience in the technology industry, including eight years dedicated to
                  software engineering for web and mobile platforms, I offer a unique blend of technical expertise and
                  leadership skills.
                </p>
                <p>
                  My career highlights include leading a mid-sized engineering team comprising approximately 60
                  professionals, direct involvement as a Frontend engineer in the development of user-friendly digital
                  products, and serving as a CTO, overseeing strategic direction and management of operations for a
                  music tech startup.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    Frontend Development
                  </Badge>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    Fullstack Development
                  </Badge>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    Mobile Development
                  </Badge>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    Security
                  </Badge>
                </div>
                <div className="mt-8">
                  <Button asChild>
                    <Link href="/CV-Leo-Ojigbo.pdf" target="_blank"  download>
                      Download Resume
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="order-1 flex items-center justify-center md:order-2">
              <div className="gradient-border p-1">
                <div className="overflow-hidden rounded-lg">
                  <Image
                    src="/images/leo.jpeg"
                    alt="Leo Ojigbo"
                    width={400}
                    height={400}
                    className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Badge className="mb-4 bg-secondary px-3 py-1 text-sm font-medium text-foreground">My Expertise</Badge>
            <h2 className="gradient-text mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Skills & Experience
            </h2>
            <Tabs defaultValue="skills" className="mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="skills">Skills & Technologies</TabsTrigger>
                <TabsTrigger value="timeline">Work Experience</TabsTrigger>
              </TabsList>
              <TabsContent value="skills" className="mt-8">
                <Suspense fallback={<div className="text-center">Loading skills...</div>}>
                  <SkillsSection />
                </Suspense>
              </TabsContent>
              <TabsContent value="timeline" className="mt-8">
                <Suspense fallback={<div className="text-center">Loading timeline...</div>}>
                  <Timeline />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-secondary px-3 py-1 text-sm font-medium text-foreground">Portfolio</Badge>
            <h2 className="gradient-text mb-6 text-3xl font-bold tracking-tight sm:text-4xl">Featured Projects</h2>
            <p className="mb-10 text-lg text-muted-foreground">
              Explore some of my latest work across various platforms and technologies.
            </p>
          </div>

          <Suspense fallback={<div className="text-center">Loading projects...</div>}>
            <FeaturedProjects />
          </Suspense>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="group" asChild>
              <Link href="/projects">
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-secondary px-3 py-1 text-sm font-medium text-foreground">Blog</Badge>
            <h2 className="gradient-text mb-6 text-3xl font-bold tracking-tight sm:text-4xl">Latest Articles</h2>
            <p className="mb-12 text-lg text-muted-foreground">Read my thoughts on tech, blockchain, and business.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recentBlogPosts.map((post, index) => (
              <Card
                key={index}
                className="hover-card overflow-hidden border-secondary/10 bg-secondary/5 backdrop-blur-sm"
              >
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg?height=340&width=600"}
                    alt={post.title}
                    width={600}
                    height={340}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {post.date}
                    </div>
                  </div>
                  <CardTitle className="mt-2 line-clamp-2 text-balance">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-muted-foreground">{post.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="group ml-auto" asChild>
                    <Link href={post.url} target="_blank">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="group" asChild>
              <Link href="/blog">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-secondary px-3 py-1 text-sm font-medium text-foreground">Education</Badge>
            <h2 className="gradient-text mb-6 text-3xl font-bold tracking-tight sm:text-4xl">Certifications</h2>
            <p className="mb-12 text-lg text-muted-foreground">
              I'm committed to continuous learning and professional development.
            </p>
          </div>

          <Suspense fallback={<div className="text-center">Loading certifications...</div>}>
            <CredlyCertifications />
          </Suspense>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="group" asChild>
              <Link href="/certifications">
                View All Certifications
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-secondary px-3 py-1 text-sm font-medium text-foreground">Services</Badge>
            <h2 className="gradient-text mb-6 text-3xl font-bold tracking-tight sm:text-4xl">What I Offer</h2>
            <p className="mb-12 text-lg text-muted-foreground">
              I provide a range of development services to help bring your ideas to life.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Card key={index} className="hover-card border-secondary/10 bg-secondary/5 backdrop-blur-sm">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-secondary/10 bg-secondary/5 p-8 backdrop-blur-sm">
              <div className="text-center">
                <Badge className="mb-4 bg-secondary px-3 py-1 text-sm font-medium text-foreground">Contact</Badge>
                <h2 className="gradient-text mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                  Let's Work Together
                </h2>
                <p className="mb-10 text-lg text-muted-foreground">
                  I'm excited to help you bring your project to life! Whether you're looking for consultation, a partner
                  on your next project, or just want to chat about tech, I'd love to hear from you.
                </p>
              </div>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary/20 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="gradient-text text-xl font-bold">Let's Connect</h3>
              <p className="mt-2 text-muted-foreground">
                Whether you have a project in mind or just want a conversation, feel free to reach out!
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <Link href="https://github.com/iroro1" target="_blank" aria-label="GitHub">
                  <Github className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <Link href="https://www.linkedin.com/in/iroro1/" target="_blank" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <Link href="https://x.com/LeoOjigbo" target="_blank" aria-label="Twitter/X">
                  <Twitter className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <Link href="mailto:ojigbo.pro@gmail.com" aria-label="Email">
                  <Mail className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-8 border-t border-secondary/20 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Leo Ojigbo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Recent blog posts data
const recentBlogPosts = [
  {
    title: "The Flywheel and Hedgehog Concepts: Driving Greatness in Business",
    url: "https://www.linkedin.com/pulse/flywheel-hedgehog-concepts-driving-greatness-business-leo-ojigbo-iqkif",
    date: "October 21, 2024",
    image:
      "https://media.licdn.com/dms/image/v2/D4D12AQGqNgAY2M2B5w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1726138446043?e=1735171200&v=beta&t=ELq5NxdYZR-A0LSUm6zQLypl3PYjdTwSx1QCnUjAE5U",
    excerpt:
      "Jim Collins' influential book, Good to Great, explores key principles that differentiate good companies from great ones.",
    category: "Business",
  },
  {
    title: "The Stockdale Paradox: Embracing Hope and Brutal Reality",
    url: "https://www.linkedin.com/pulse/stockdale-paradox-embracing-hope-brutal-reality-cilteams-y1xdf/?trackingId=VyxtlItWQQGk7nuD3Vz%2B%2BQ%3D%3D",
    date: "November 21, 2024",
    image:
      "https://media.licdn.com/dms/image/v2/D4D12AQHYdYCA00ZG0Q/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1732101323516?e=2147483647&v=beta&t=pEE-UtEgJTu2PpZmsTfNA8d7farbvZfVw5Ue6yBAHlc",
    excerpt:
      "Few leadership, personal development, and resilience concepts resonate as profoundly as the Stockdale Paradox.",
    category: "Leadership",
  },
  {
    title: "Navigating the Web3 Landscape: Unraveling the Future of Decentralized Innovation",
    url: "https://www.linkedin.com/pulse/navigating-web3-landscape-unraveling-future-leo-ojigbo-zimcf/",
    date: "March 09, 2024",
    image: "/placeholder.svg?height=340&width=600",
    excerpt:
      "In the ever-evolving realm of digital technologies, the emergence of Web3 has ushered in a new era characterized by decentralization.",
    category: "Web3",
  },
]

// Services data
const services = [
  {
    title: "Frontend Development",
    description: "Modern, responsive web applications built with React, Next.js, and other cutting-edge technologies.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 3v4c0 2-2 4-4 4H4c-2 0-4-2-4-4V3" />
        <path d="M18 13v4c0 2-2 4-4 4H4c-2 0-4-2-4-4v-4" />
        <path d="M10 7H8" />
        <path d="M10 17H8" />
      </svg>
    ),
  },
  {
    title: "Backend Development",
    description: "Robust server-side solutions using Node.js, Express, Nest Js, Go, and various database technologies.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
        <line x1="6" x2="6.01" y1="6" y2="6" />
        <line x1="6" x2="6.01" y1="18" y2="18" />
      </svg>
    ),
  },
  {
    title: "Mobile App Development",
    description: "Cross-platform mobile applications for iOS and Android using React Native and related technologies.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <line x1="12" x2="12.01" y1="18" y2="18" />
      </svg>
    ),
  },
  {
    title: "Database Design",
    description:
      "Efficient database architecture and optimization using SQL and NoSQL solutions like PostgreSQL, MongoDB, and Supabase.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    title: "API Development",
    description: "RESTful and GraphQL APIs that are secure, scalable, and well-documented for seamless integration.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 15v-6l7.745 10.65A9 9 0 1 1 19 17.657" />
        <path d="M15 9h.01" />
      </svg>
    ),
  },
  {
    title: "Cloud Solutions",
    description:
      "Deployment and management of applications on cloud platforms like AWS, GCP, and Vercel for optimal performance.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    ),
  },
]
