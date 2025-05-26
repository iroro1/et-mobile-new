export interface Course {
  _id: string
  link: string
  title: string
  desc: string
  type: string
}

export async function getCourses(): Promise<Course[]> {
  // This would normally fetch from an API or database
  return [
    {
      _id: "663f332c1e3ec97f4ecf87f4",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/5QMVK4NSYRKL",
      title: "Blockchain",
      desc: " A four course specialization from Coursera and the University of Buffalo in the USA.",
      type: "web",
    },
    {
      _id: "663f333b1e3ec97f4ecf87f5",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/CADBL85A5YJ4",
      title: "Cybersecurity: Developing a Program for Your Business",
      desc: " A five course specialization from Coursera and ISC2.",
      type: "web",
    },
    {
      _id: "663f33491e3ec97f4ecf87f6",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/QRKD2RYHT6YC",
      title: "Cybersecurity: Developing a Program for Your Business",
      desc: " A four course specialization from Coursera and the University system of Georgia in the USA.",
      type: "web",
    },
    {
      _id: "663f33561e3ec97f4ecf87f7",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/33L2QLQ6R8Z6",
      title: "Java Programming and Software Engineering Fundamentals",
      desc: "A five course specialization from Coursera and Duke University in the USA.",
      type: "web",
    },
    {
      _id: "663f33641e3ec97f4ecf87f8",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/B43PBP5BU5W2",
      title: "Full-Stack Web Development with React",
      desc: "A four course specialization from Coursera and the University of science and technology Hong Kong.",
      type: "web",
    },
    {
      _id: "663f33731e3ec97f4ecf87f9",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/2U9DFUQ37GB6",
      title: "Meta Frontend Developer",
      desc: "A nine course specialization from Coursera and Meta team.",
      type: "web",
    },
    {
      _id: "663f33801e3ec97f4ecf87fa",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/DNUUUV644EKS",
      title: "Meta React Native Specialization",
      desc: "A nine course specialization from Coursera and Meta team.",
      type: "web",
    },
    {
      _id: "663f338f1e3ec97f4ecf87fb",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/8VH6RXRR7JGX",
      title: "Python for Everybody",
      desc: "A five course specialization from Coursera and the University of Michigan in the USA.",
      type: "web",
    },
    {
      _id: "663f339b1e3ec97f4ecf87fc",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/K7A97TUKF7LM",
      title: "Business Strategy ",
      desc: "A five course specialization from Amazon web services",
      type: "web",
    },
    {
      _id: "663f33ab1e3ec97f4ecf87fd",
      link: "https://www.coursera.org/account/accomplishments/specialization/C7HMVLGQUCAD",
      title: "DevOps on AWS ",
      desc: "A five course specialization from Amazon web services",
      type: "web",
    },
    {
      _id: "663f33b91e3ec97f4ecf87fe",
      link: "https://www.coursera.org/account/accomplishments/specialization/certificate/MEEBEQJ2WLT9",
      title: "AWS Cloud Solutions Architect",
      desc: "A four course specialization from Amazon web services",
      type: "web",
    },
  ]
}
