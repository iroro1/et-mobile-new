import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((post) => post.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-4">
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              {post.category}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              {post.date}
            </div>
          </div>

          <h1 className="gradient-text mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{post.title}</h1>

          <div className="mb-8 overflow-hidden rounded-lg">
            <Image
              src={post.image || "/placeholder.svg?height=500&width=1000"}
              alt={post.title}
              width={1000}
              height={500}
              className="h-auto w-full object-cover"
            />
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">{post.excerpt}</p>

            <div className="my-8 rounded-lg border border-secondary/20 bg-secondary/5 p-6">
              <p className="mb-4 text-lg font-medium">This article is available on {post.platform}</p>
              <Button asChild>
                <Link href={post.url} target="_blank">
                  Read Full Article
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// This would typically come from a database or API
const blogPosts = [
  {
    title: "The Flywheel and Hedgehog Concepts: Driving Greatness in Business",
    slug: "flywheel-hedgehog-concepts",
    url: "https://www.linkedin.com/pulse/flywheel-hedgehog-concepts-driving-greatness-business-leo-ojigbo-iqkif",
    date: "October 21, 2024",
    image:
      "https://media.licdn.com/dms/image/v2/D4D12AQGqNgAY2M2B5w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1726138446043?e=1735171200&v=beta&t=ELq5NxdYZR-A0LSUm6zQLypl3PYjdTwSx1QCnUjAE5U",
    excerpt:
      "Jim Collins' influential book, Good to Great, explores key principles that differentiate good companies from great ones. Among these principles, the Flywheel and Hedgehog Concepts stand out as essential frameworks for achieving and maintaining excellence. Both concepts offer valuable insights into how organizations can build momentum and focus on their core strengths to drive long-term success.",
    category: "Business",
    platform: "LinkedIn",
  },
  {
    title: "The Stockdale Paradox: Embracing Hope and Brutal Reality",
    slug: "stockdale-paradox",
    url: "https://www.linkedin.com/pulse/stockdale-paradox-embracing-hope-brutal-reality-cilteams-y1xdf/?trackingId=VyxtlItWQQGk7nuD3Vz%2B%2BQ%3D%3D",
    date: "November 21, 2024",
    image:
      "https://media.licdn.com/dms/image/v2/D4D12AQHYdYCA00ZG0Q/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1732101323516?e=2147483647&v=beta&t=pEE-UtEgJTu2PpZmsTfNA8d7farbvZfVw5Ue6yBAHlc",
    excerpt:
      "Few leadership, personal development, and resilience concepts resonate as profoundly as the Stockdale Paradox. Named after Admiral James Stockdale, a Vietnam War veteran and prisoner of war for over seven years, this paradox encapsulates a powerful approach to facing adversity with unwavering hope while confronting harsh realities head-on. The lessons embedded in this paradox are as relevant today as they were in Stockdale's time, offering timeless wisdom for individuals and leaders navigating the complexities of life and work.",
    category: "Leadership",
    platform: "LinkedIn",
  },
  {
    title: "Striking a Balance Between Career and Family",
    slug: "striking-balance-career-family",
    url: "https://www.linkedin.com/pulse/striking-balance-between-career-family-leo-ojigbo-zij2f/",
    date: "April 13, 2024",
    image: "/placeholder.svg?height=500&width=1000",
    excerpt:
      "In the ever-evolving landscape of modern life, individuals often find themselves grappling with the challenge of balancing a successful career and a fulfilling family life. The pursuit of professional goals and the desire to create a nurturing family environment can sometimes seem like competing forces, making it a delicate tightrope walk.",
    category: "Career",
    platform: "LinkedIn",
  },
  {
    title: "Navigating the Web3 Landscape: Unraveling the Future of Decentralized Innovation",
    slug: "navigating-web3-landscape",
    url: "https://www.linkedin.com/pulse/navigating-web3-landscape-unraveling-future-leo-ojigbo-zimcf/",
    date: "March 09, 2024",
    image: "/placeholder.svg?height=500&width=1000",
    excerpt:
      "In the ever-evolving realm of digital technologies, the emergence of Web3 has ushered in a new era characterized by decentralization, transparency, and increased user empowerment. Web3 represents a paradigm shift from traditional, centralized systems.",
    category: "Web3",
    platform: "LinkedIn",
  },
  {
    title: "Tech Short Story: A Tale of Decentralized Careers",
    slug: "tale-decentralized-careers",
    url: "https://www.linkedin.com/pulse/tech-short-stories-tale-decentralized-careers-leo-ojigbo-y4awf",
    date: "February 09, 2024",
    image: "/placeholder.svg?height=500&width=1000",
    excerpt:
      "In the bustling metropolis of Bitropolis, where neon lights reflected off sleek skyscrapers and the hum of technology filled the air, a quiet revolution was brewing. In the heart of this digital realm, a groundbreaking platform named CryptoHire was changing the landscape of employment, weaving a tale of decentralized careers and rewriting the rules of corporate engagement.",
    category: "Blockchain",
    platform: "LinkedIn",
  },
  {
    title: "Tech Short Story: Maintaining Anonymity on the Blockchain",
    slug: "maintaining-anonymity-blockchain",
    url: "https://www.linkedin.com/pulse/tech-short-story-maintaining-anonymity-blockchain-d8zrc?trk=news-guest_share-article",
    date: "November 14, 2023",
    image: "/placeholder.svg?height=500&width=1000",
    excerpt:
      "In a world not too far from our own, where technology and innovation have taken center stage, there exists a revolutionary concept known as the blockchain. This technology, which initially gained fame through cryptocurrencies, has now evolved into a powerful tool for maintaining anonymity and privacy in the digital realm. Our story takes us through the intriguing journey of how individuals have harnessed the potential of blockchain to maintain their anonymity, ensuring a secure and confidential online existence.",
    category: "Blockchain",
    platform: "LinkedIn",
  },
  {
    title: "Tech Short Story: Amazon QLDB",
    slug: "amazon-qldb",
    url: "https://www.linkedin.com/pulse/tech-short-story-amazon-qldb-cecureintelligence",
    date: "August 15, 2023",
    image: "/placeholder.svg?height=500&width=1000",
    excerpt:
      "In today's data-driven world, understanding and interpreting the vast amount of information we collect is crucial for making informed decisions. Analytics is the scientific process of discovering and communicating meaningful patterns found in data, and it is increasingly being used in various industries to gain insights and make better decisions.",
    category: "Technology",
    platform: "LinkedIn",
  },
  {
    title: "Smart contract: A short story",
    slug: "smart-contract-short-story",
    url: "https://www.linkedin.com/pulse/smart-contract-short-story-cecureintelligence/?trackingId=wl6raNqToBN5zM3n6RplbQ%3D%3D",
    date: "June 6, 2023",
    image: "/placeholder.svg?height=500&width=1000",
    excerpt:
      "A smart contract is used in the blockchain as an automated way to transact. Let's explain this with an illustration. A man named Paul and his wife Amy live in Africa. Amy loves to buy expensive designer shoes and bags. Amy works as a Software Engineer. Amy expects to get paid next weekend but saw a designer shoe for sale at 1000 dollars.",
    category: "Blockchain",
    platform: "LinkedIn",
  },
  {
    title: "WEB 3: How We Got Here!",
    slug: "web3-how-we-got-here",
    url: "https://www.linkedin.com/pulse/web-3-how-we-got-here-cecureintelligence/?trackingId=b2mFMhw0ijHwNwT%2BARyuOQ%3D%3D",
    date: "April 20, 2023",
    image: "/placeholder.svg?height=500&width=1000",
    excerpt:
      "Web 3 is a term that is often associated with the latest and greatest advancements in the field of digital communication. It refers to the next evolution of the internet, where the web will become more advanced and connected than ever before.",
    category: "Web3",
    platform: "LinkedIn",
  },
  {
    title: "How to Become a Self-taught Developer",
    slug: "become-self-taught-developer",
    url: "https://www.linkedin.com/pulse/how-become-self-taught-developer-cecureintelligence/?trackingId=cCkpyuBF0ywGhxtvxM1w9g%3D%3D",
    date: "October 17, 2022",
    image: "/placeholder.svg?height=500&width=1000",
    excerpt:
      "With new technologies and the 10X growth of tech in every sphere of life, the demand for highly skilled and qualified individuals to write software is on a steady rise. The great thing about this era is the large pool of resources available to us to pick up awesome coding skills quickly. This is aimed at non-developers looking at learning to code or newbie developers still struggling with the bunch of resources out there.",
    category: "Career",
    platform: "LinkedIn",
  },
]
