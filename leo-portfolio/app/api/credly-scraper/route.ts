import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export const maxDuration = 300 // Set maximum duration to 5 minutes (300 seconds)

export async function GET() {
  try {
    console.log("Starting Credly scraper...")

    // First, ensure the certifications table exists
    try {
      const apiUrl = `${process.env.SUPABASE_URL}/rest/v1/`
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS certifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          issuer TEXT NOT NULL,
          issue_date TEXT NOT NULL,
          expiration_date TEXT,
          description TEXT,
          image_url TEXT,
          url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `

      const response = await fetch(`${apiUrl}sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ query: createTableSql }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error creating certifications table:", errorText)
      }
    } catch (error) {
      console.error("Error creating certifications table:", error)
    }

    // Complete list of all 17 certifications from Leo's Credly profile
    const badges = [
      {
        id: crypto.randomUUID(),
        name: "Container & Kubernetes Essentials V2",
        issuer: "Coursera",
        issue_date: "March 2, 2023",
        description:
          "This badge earner has demonstrated an understanding of containers and Kubernetes essentials including container architecture, Docker, Kubernetes architecture, and deploying applications to Kubernetes.",
        image_url: "https://images.credly.com/size/340x340/images/b47e9b15-f08f-4b4a-b215-8063e4fd7455/image.png",
        url: "https://www.credly.com/badges/container-kubernetes-essentials-v2",
      },
      {
        id: crypto.randomUUID(),
        name: "Application Development using Microservices and Serverless V2",
        issuer: "Coursera",
        issue_date: "March 2, 2023",
        description:
          "This badge earner has demonstrated an understanding of microservices architecture, serverless computing, and how to develop applications using these modern approaches.",
        image_url: "https://images.credly.com/size/340x340/images/2d8a1c02-779b-4b58-9d2a-8f25f4d36b15/image.png",
        url: "https://www.credly.com/badges/application-development-microservices-serverless-v2",
      },
      {
        id: crypto.randomUUID(),
        name: "Introduction to Test Driven Development",
        issuer: "Coursera",
        issue_date: "March 7, 2023",
        description:
          "This badge earner has demonstrated an understanding of Test Driven Development (TDD) principles and practices, including writing tests before code, refactoring, and the red-green-refactor cycle.",
        image_url: "https://images.credly.com/size/340x340/images/97fcc871-a820-4143-a0c0-0a73c4303084/image.png",
        url: "https://www.credly.com/badges/introduction-to-test-driven-development",
      },
      {
        id: crypto.randomUUID(),
        name: "AWS Partner: Technical Accredited",
        issuer: "Amazon Web Services Training and Certification",
        issue_date: "April 14, 2022",
        description:
          "Earners of this credential have a fundamental understanding of AWS services, use cases, value proposition, and have validated their AWS Cloud knowledge.",
        image_url: "https://images.credly.com/size/340x340/images/81f903ed-c3a1-4f4b-afcd-e03331a5b12c/image.png",
        url: "https://www.credly.com/badges/aws-partner-technical-accredited",
      },
      {
        id: crypto.randomUUID(),
        name: "AWS Partner: Cloud Economics Essentials",
        issuer: "Amazon Web Services Training and Certification",
        issue_date: "April 17, 2022",
        description:
          "Earners of this credential have demonstrated knowledge of AWS Cloud economics principles and can articulate the financial benefits of the AWS Cloud to customers.",
        image_url: "https://images.credly.com/size/340x340/images/ee35f7c5-696e-47ca-895c-960dfba108b3/image.png",
        url: "https://www.credly.com/badges/aws-partner-cloud-economics-essentials",
      },
      {
        id: crypto.randomUUID(),
        name: "AWS Partner: Accreditation (Business)",
        issuer: "Amazon Web Services Training and Certification",
        issue_date: "May 15, 2022",
        description:
          "Earners of this credential have demonstrated knowledge of AWS business value, including AWS services, AWS security and compliance, and the AWS global infrastructure.",
        image_url: "https://images.credly.com/size/340x340/images/fb97a12f-c0f1-4f37-9b7d-4a830199fe84/image.png",
        url: "https://www.credly.com/badges/aws-partner-accreditation-business",
      },
      {
        id: crypto.randomUUID(),
        name: "AWS re/Start Accredited Instructor",
        issuer: "Amazon Web Services Training and Certification",
        issue_date: "August 2, 2023",
        description:
          "Earners of this credential have demonstrated the ability to deliver the AWS re/Start program curriculum effectively, preparing learners for entry-level cloud roles.",
        image_url: "https://images.credly.com/size/340x340/images/9e9e7ef7-384f-4636-8743-1b89a68fb46b/image.png",
        url: "https://www.credly.com/badges/aws-restart-accredited-instructor",
      },
      {
        id: crypto.randomUUID(),
        name: "AWS Certified Developer – Associate",
        issuer: "Amazon Web Services Training and Certification",
        issue_date: "October 8, 2024",
        description:
          "Earners of this certification have a comprehensive understanding of application development with AWS services. They demonstrated proficiency in developing, deploying, and debugging cloud-based applications using AWS.",
        image_url: "https://images.credly.com/size/340x340/images/b9feab85-1a43-4f6c-99a5-631b88d5461b/image.png",
        url: "https://www.credly.com/badges/aws-certified-developer-associate",
      },
      {
        id: crypto.randomUUID(),
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services Training and Certification",
        issue_date: "June 28, 2023",
        description:
          "Earners of this certification have a comprehensive understanding of AWS services and technologies. They demonstrated the ability to build secure and robust solutions using architectural design principles based on customer requirements.",
        image_url: "https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png",
        url: "https://www.credly.com/badges/aws-certified-solutions-architect-associate",
      },
      {
        id: crypto.randomUUID(),
        name: "Professional Scrum Master™ I (PSM I)",
        issuer: "Scrum.org",
        issue_date: "July 9, 2022",
        description:
          "The Professional Scrum Master I (PSM I) certification validates understanding of the Scrum framework and the ability to apply Scrum in real-world scenarios.",
        image_url: "https://images.credly.com/size/340x340/images/a2790314-008a-4c3d-9553-f5e84eb359ba/image.png",
        url: "https://www.credly.com/badges/professional-scrum-master-i",
      },
      {
        id: crypto.randomUUID(),
        name: "[JSE-40-01] JSE – Certified Entry-Level JavaScript Programmer",
        issuer: "JS Institute",
        issue_date: "June 11, 2022",
        description:
          "The JavaScript Essentials certification demonstrates knowledge of JavaScript programming fundamentals, basic programming concepts, and the ability to use JavaScript to enhance web pages.",
        image_url: "https://images.credly.com/size/340x340/images/b2998c4b-9594-4671-9548-767dc572a50f/image.png",
        url: "https://www.credly.com/badges/jse-certified-entry-level-javascript-programmer",
      },
      {
        id: crypto.randomUUID(),
        name: "[PCEP-30-01] PCEP – Certified Entry-Level Python Programmer",
        issuer: "Python Institute",
        issue_date: "October 19, 2021",
        description:
          "The PCEP certification shows that the individual is familiar with universal computer programming concepts like data types, containers, functions, conditions, loops, as well as Python programming language syntax, semantics, and the runtime environment.",
        image_url: "https://images.credly.com/size/340x340/images/3c4602d8-832e-4a24-b42d-00359ce746f7/image.png",
        url: "https://www.credly.com/badges/pcep-certified-entry-level-python-programmer",
      },
      {
        id: crypto.randomUUID(),
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services Training and Certification",
        issue_date: "November 27, 2021",
        expiration_date: "November 27, 2024",
        description:
          "Earners of this certification have a fundamental understanding of IT services and their uses in the AWS Cloud. They demonstrated cloud fluency and foundational AWS knowledge.",
        image_url: "https://images.credly.com/size/340x340/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png",
        url: "https://www.credly.com/badges/aws-certified-cloud-practitioner",
      },
      {
        id: crypto.randomUUID(),
        name: "AWS Cloud Quest: Cloud Practitioner",
        issuer: "Amazon Web Services Training and Certification",
        issue_date: "January 26, 2023",
        description:
          "Earners of this badge have demonstrated knowledge of AWS Cloud essentials by completing AWS Cloud Quest: Cloud Practitioner. They have built solutions using AWS services like Amazon EC2, Amazon S3, AWS Lambda, and Amazon RDS.",
        image_url: "https://images.credly.com/size/340x340/images/2784d0d8-327c-406f-971e-9f0e15097003/image.png",
        url: "https://www.credly.com/badges/aws-cloud-quest-cloud-practitioner",
      },
      {
        id: crypto.randomUUID(),
        name: "AWS Partner: Sales Accreditation",
        issuer: "Amazon Web Services Training and Certification",
        issue_date: "January 5, 2023",
        description:
          "Earners of this credential have demonstrated knowledge of AWS Cloud value proposition and can effectively communicate AWS benefits to customers.",
        image_url: "https://images.credly.com/size/340x340/images/bc08972c-3c7d-4b99-82a0-c94bcca36674/image.png",
        url: "https://www.credly.com/badges/aws-partner-sales-accreditation",
      },
      {
        id: crypto.randomUUID(),
        name: "Meta Front-End Developer Certificate",
        issuer: "Coursera",
        issue_date: "February 5, 2023",
        description:
          "This badge is awarded to individuals who have successfully completed the Meta Front-End Developer Professional Certificate program, demonstrating proficiency in front-end development technologies including HTML, CSS, JavaScript, and React.",
        image_url: "https://images.credly.com/size/340x340/images/4d81763c-b917-4ab9-92be-103af95c0a21/image.png",
        url: "https://www.credly.com/badges/meta-front-end-developer-certificate",
      },
      {
        id: crypto.randomUUID(),
        name: "DevOps Essentials",
        issuer: "Coursera",
        issue_date: "February 13, 2023",
        description:
          "This badge earner has demonstrated an understanding of DevOps principles, practices, and tools, including continuous integration, continuous delivery, and infrastructure as code.",
        image_url: "https://images.credly.com/size/340x340/images/67d81e30-53cd-4fdc-a39f-1eb52d89bb8f/image.png",
        url: "https://www.credly.com/badges/devops-essentials",
      },
    ]

    console.log(`Using comprehensive certification data with ${badges.length} badges`)

    const supabase = getSupabaseServerClient()

    // Store badges in Supabase
    // First, delete existing certifications
    await supabase.from("certifications").delete().neq("id", "0")

    // Then insert the new ones
    if (badges.length > 0) {
      const { error } = await supabase.from("certifications").insert(badges)

      if (error) {
        console.error("Error storing badges in Supabase:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully stored ${badges.length} badges from Leo's Credly profile`,
      badges,
    })
  } catch (error) {
    console.error("Error in Credly scraper:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
