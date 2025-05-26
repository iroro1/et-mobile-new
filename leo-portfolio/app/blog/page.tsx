"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectFilter } from "@/components/project-filter"

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All")

  const categories = ["All", "Technology", "Blockchain", "Web3", "Career", "Business", "Leadership"]

  const filteredPosts =
    activeCategory === "All" ? blogPosts : blogPosts.filter((post) => post.category === activeCategory)

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="gradient-text text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">My Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Thoughts, insights, and tutorials on web development, blockchain, and technology.
          </p>
        </div>

        <ProjectFilter tags={categories} activeTag={activeCategory} onChange={setActiveCategory} />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <Card
              key={index}
              className="hover-card flex h-full flex-col overflow-hidden border-secondary/10 bg-secondary/5 backdrop-blur-sm"
            >
              <div className="aspect-video w-full overflow-hidden">
                <Image
                  src={post.image || "/placeholder.svg?height=340&width=600"}
                  alt={post.title}
                  width={600}
                  height={340}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
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
              <CardContent className="flex-grow">
                <p className="line-clamp-3 text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="ghost" size="sm" className="group ml-auto" asChild>
                  <Link href={post.url} target="_blank">
                    Read on {post.platform}
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

const blogPosts = [
  {
    title: "The Flywheel and Hedgehog Concepts: Driving Greatness in Business",
    url: "https://www.linkedin.com/pulse/flywheel-hedgehog-concepts-driving-greatness-business-leo-ojigbo-iqkif",
    date: "October 21, 2024",
    image:
      "https://media.licdn.com/dms/image/v2/D4D12AQGqNgAY2M2B5w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1726138446043?e=1735171200&v=beta&t=ELq5NxdYZR-A0LSUm6zQLypl3PYjdTwSx1QCnUjAE5U",
    excerpt:
      "Jim Collins' influential book, Good to Great, explores key principles that differentiate good companies from great ones. Among these principles, the Flywheel and Hedgehog Concepts stand out as essential frameworks for achieving and maintaining excellence.",
    category: "Business",
    platform: "LinkedIn",
  },
  {
    title: "The Stockdale Paradox: Embracing Hope and Brutal Reality",
    url: "https://www.linkedin.com/pulse/stockdale-paradox-embracing-hope-brutal-reality-cilteams-y1xdf/?trackingId=VyxtlItWQQGk7nuD3Vz%2B%2BQ%3D%3D",
    date: "November 21, 2024",
    image:
      "https://media.licdn.com/dms/image/v2/D4D12AQHYdYCA00ZG0Q/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1732101323516?e=2147483647&v=beta&t=pEE-UtEgJTu2PpZmsTfNA8d7farbvZfVw5Ue6yBAHlc",
    excerpt:
      "Few leadership, personal development, and resilience concepts resonate as profoundly as the Stockdale Paradox. Named after Admiral James Stockdale, a Vietnam War veteran and prisoner of war for over seven years, this paradox encapsulates a powerful approach to facing adversity.",
    category: "Leadership",
    platform: "LinkedIn",
  },
  {
    title: "Striking a Balance Between Career and Family",
    url: "https://www.linkedin.com/pulse/striking-balance-between-career-family-leo-ojigbo-zij2f/",
    date: "April 13, 2024",
    image: "/placeholder.svg?height=340&width=600",
    excerpt:
      "In the ever-evolving landscape of modern life, individuals often find themselves grappling with the challenge of balancing a successful career and a fulfilling family life. The pursuit of professional goals and the desire to create a nurturing family environment can sometimes seem like competing forces.",
    category: "Career",
    platform: "LinkedIn",
  },
  {
    title: "Navigating the Web3 Landscape: Unraveling the Future of Decentralized Innovation",
    url: "https://www.linkedin.com/pulse/navigating-web3-landscape-unraveling-future-leo-ojigbo-zimcf/",
    date: "March 09, 2024",
    image: "/placeholder.svg?height=340&width=600",
    excerpt:
      "In the ever-evolving realm of digital technologies, the emergence of Web3 has ushered in a new era characterized by decentralization, transparency, and increased user empowerment. Web3 represents a paradigm shift from traditional, centralized systems.",
    category: "Web3",
    platform: "LinkedIn",
  },
  {
    title: "Tech Short Story: A Tale of Decentralized Careers",
    url: "https://www.linkedin.com/pulse/tech-short-stories-tale-decentralized-careers-leo-ojigbo-y4awf",
    date: "February 09, 2024",
    image: "/placeholder.svg?height=340&width=600",
    excerpt:
      "In the bustling metropolis of Bitropolis, where neon lights reflected off sleek skyscrapers and the hum of technology filled the air, a quiet revolution was brewing. In the heart of this digital realm, a groundbreaking platform named CryptoHire was changing the landscape of employment.",
    category: "Blockchain",
    platform: "LinkedIn",
  },
  {
    title: "Tech Short Story: Maintaining Anonymity on the Blockchain",
    url: "https://www.linkedin.com/pulse/tech-short-story-maintaining-anonymity-blockchain-d8zrc?trk=news-guest_share-article",
    date: "November 14, 2023",
    image: "/placeholder.svg?height=340&width=600",
    excerpt:
      "In a world not too far from our own, where technology and innovation have taken center stage, there exists a revolutionary concept known as the blockchain. This technology, which initially gained fame through cryptocurrencies, has now evolved into a powerful tool for maintaining anonymity and privacy in the digital realm.",
    category: "Blockchain",
    platform: "LinkedIn",
  },
  {
    title: "Tech Short Story: Amazon QLDB",
    url: "https://www.linkedin.com/pulse/tech-short-story-amazon-qldb-cecureintelligence",
    date: "August 15, 2023",
    image: "/placeholder.svg?height=340&width=600",
    excerpt:
      "In today's data-driven world, understanding and interpreting the vast amount of information we collect is crucial for making informed decisions. Analytics is the scientific process of discovering and communicating meaningful patterns found in data, and it is increasingly being used in various industries to gain insights and make better decisions.",
    category: "Technology",
    platform: "LinkedIn",
  },
  {
    title: "Smart contract: A short story",
    url: "https://www.linkedin.com/pulse/smart-contract-short-story-cecureintelligence/?trackingId=wl6raNqToBN5zM3n6RplbQ%3D%3D",
    date: "June 6, 2023",
    image: "/placeholder.svg?height=340&width=600",
    excerpt:
      "A smart contract is used in the blockchain as an automated way to transact. Let's explain this with an illustration. A man named Paul and his wife Amy live in Africa. Amy loves to buy expensive designer shoes and bags. Amy works as a Software Engineer. Amy expects to get paid next weekend but saw a designer shoe for sale at 1000 dollars.",
    category: "Blockchain",
    platform: "LinkedIn",
  },
  {
    title: "WEB 3: How We Got Here!",
    url: "https://www.linkedin.com/pulse/web-3-how-we-got-here-cecureintelligence/?trackingId=b2mFMhw0ijHwNwT%2BARyuOQ%3D%3D",
    date: "April 20, 2023",
    image: "/placeholder.svg?height=340&width=600",
    excerpt:
      "Web 3 is a term that is often associated with the latest and greatest advancements in the field of digital communication. It refers to the next evolution of the internet, where the web will become more advanced and connected than ever before.",
    category: "Web3",
    platform: "LinkedIn",
  },
  {
    title: "How to Become a Self-taught Developer",
    url: "https://www.linkedin.com/pulse/how-become-self-taught-developer-cecureintelligence/?trackingId=cCkpyuBF0ywGhxtvxM1w9g%3D%3D",
    date: "October 17, 2022",
    image: "/placeholder.svg?height=340&width=600",
    excerpt:
      "With new technologies and the 10X growth of tech in every sphere of life, the demand for highly skilled and qualified individuals to write software is on a steady rise. The great thing about this era is the large pool of resources available to us to pick up awesome coding skills quickly.",
    category: "Career",
    platform: "LinkedIn",
  },
]
