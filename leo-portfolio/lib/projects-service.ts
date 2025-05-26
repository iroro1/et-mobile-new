export interface Project {
  _id: string
  title: string
  desc: string
  link?: string
  img?: string
  type: string
  premium?: boolean
  tags?: string[]
  demoUrl?: string
  slug?: string
  description?: string
  image?: string
  android?: string
  ios?: string
  hide?: boolean
}

// This would normally fetch from an API or database
export async function getAllProjects(): Promise<Project[]> {
  // Projects data from the JSON file
  const projects = [
    {
      _id: "6632b212379032c59e08ff0a",
      type: "mobile",
      ios: "exp://u.expo.dev/update/ba393cf1-d5f2-4aed-b89a-d195ce746d0a",
      android: "exp://u.expo.dev/update/0d9cb84e-a562-47d2-a4dc-f578918b3fc7",
      title: "Receipe Mobile App",
      desc: "A cross functional mobile app written in react native expo and published via the expo link. Download Expo Go on your device to test the app",
      img: "https://images.pexels.com/photos/1109197/pexels-photo-1109197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      _id: "6632b2de379032c59e08ff0c",
      link: "https://expo.dev/preview/update?message=first%20commit&updateRuntimeVersion=1.0.0&createdAt=2023-08-23T20%3A49%3A05.574Z&slug=exp&projectId=1efee68c-8e2d-44fd-b78f-f219281e2199&group=ec97448c-32dd-44fb-a3ac-71f657aa6911",
      title: "Chat Mobile App",
      desc: "A cross functional mobile app written in react native expo and published via the expo link. Download Expo Go on your device to test the app",
      type: "mobile",
      img: "https://images.pexels.com/photos/7241296/pexels-photo-7241296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      _id: "6632b339379032c59e08ff0d",
      link: "",
      title: "Job Search Mobile App",
      desc: "A cross functional mobile app written in react native expo and published via the expo link. Download Expo Go on your device to test the app",
      type: "mobile",
      img: "https://images.pexels.com/photos/4050216/pexels-photo-4050216.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      _id: "6632b36d379032c59e08ff0e",
      link: "https://www.virtualsoftconsult.co.uk/",
      title: "VirtualSoft Consult",
      desc: "A web application for a client in the Uk. At VirtualSoft Consultancy, we're your dedicated partner for success. Whether you're a business seeking transformation or an individual looking to excel in the IT industry, we have you covered. days.",
      type: "web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720283224/vsc_initru.png",
    },
    {
      _id: "663f27d81e3ec97f4ecf87c5",
      link: "https://pgraters.com/",
      title: "PGRaters Webapp",
      desc: "A platform uniting basketball players, coaches, officials, organizers, and enthusiasts from the playground to the professional leagues. PGRaters is transforming the way basketball is perceived on the continent with its unique data-driven platform that is fostering the growth of the game within the communities. I and my team built the website and mobile apps.",
      android: "",
      ios: "",
      type: "Web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720280548/pgr_rmpe9j.png",
    },
    {
      _id: "663f291e1e3ec97f4ecf87c6",
      link: "https://heallence.com/",
      title: "Heallence",
      desc: "A web application utilizing ML/AI run diagnoses for clients. I happen to be a part of the team that got this application from ideation to production.",
      android: "",
      ios: "",
      type: "web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720281470/heal_ndlm0l.png",
    },
    {
      _id: "663f296a1e3ec97f4ecf87c7",
      link: "https://vecul.co",
      title: "Vecul",
      desc: "The next big innovative mobility startup solutions. I happen to be a part of the team that got this application from ideation to production.",
      android: "",
      ios: "",
      type: "Web / Mobile",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720281557/vecul_kmwqgu.png",
    },
    {
      _id: "663f298c1e3ec97f4ecf87c8",
      link: "https://cecureintel.com/demo/ML/liveness",
      title: "Liveness Detector",
      desc: "A web application utilizes ML to test liveness",
      android: "",
      ios: "",
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1725537498/Screenshot_2024-09-05_at_12.57.52_PM_v5bpzm.png",
    },
    {
      _id: "663f29c91e3ec97f4ecf87ca",
      link: "https://cecureintel.com/demo/ML/cecure-ocr",
      title: "Cecure Ocr",
      desc: "A web application utilizes ML to convert image files to text",
      android: "",
      ios: "",
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1725537681/Screenshot_2024-09-05_at_1.01.09_PM_obto2r.png",
    },
    {
      _id: "663f29e61e3ec97f4ecf87cb",
      link: "https://cecureintel.com/demo/ML/compare-fingerprints",
      title: "Compare Fingerprints",
      desc: "A web application utilizes ML to check fingerprints",
      android: "",
      ios: "",
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1725537735/Screenshot_2024-09-05_at_1.02.05_PM_mrdki2.png",
    },
    {
      _id: "663f2a051e3ec97f4ecf87cc",
      link: "https://ask-betty.com/",
      title: "Ask Betty",
      desc: "A web application utilizes ML to predict the right gift items for your loved ones with a feature for wishes",
      android: "",
      ios: "",
      type: "web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720281636/askbetty_m11jq6.png",
    },
    {
      _id: "663f2a701e3ec97f4ecf87cf",
      link: "https://etiaba.com/",
      title: "Etiaba",
      desc: "Etiaba is an all in one accounting software created to solve all accounting needs. It consist of a website, webapp and mobile app. I led the frontend team to delivering this project as part of a scrum team.",
      android: "",
      ios: "",
      type: "web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720281708/etiaba_q5bicu.png",
    },
    {
      _id: "663f2a7d1e3ec97f4ecf87d0",
      link: "https://avencapp.com/",
      title: "Avenc",
      desc: "A website with the ability to run complex marketing campaigns with ease.  ",
      android: "",
      ios: "",
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720289148/avenc_c2p9ex.png",
      premium: true,
    },
    {
      _id: "663f2a8d1e3ec97f4ecf87d1",
      link: "https://react.dev.approko.be/",
      title: "Approko",
      desc: "The website for Approko saas accelerator template built by team. I was also responsible for building the virtual support center with ability for agents to take calls and chats",
      android: "",
      ios: "",
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1725537975/Screenshot_2024-09-05_at_1.06.03_PM_qdtybt.png",
    },
    {
      _id: "663f2a9d1e3ec97f4ecf87d2",
      link: "https://cecureintel.com/",
      title: "Cecure Intelligence",
      desc: "The website for CIL built and maintained by my team",
      android: "",
      ios: "",
      type: "web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720281795/cil_l99gea.png",
    },
    {
      _id: "663f2aab1e3ec97f4ecf87d3",
      link: "https://iroro1.github.io/lionK.com/imageFilter/index.html",
      title: "Image App",
      desc: "This app is created using the Duke Learn to Program Js Library which adds a layer of abstraction to image processing. This course has increased my interest in image processing and i intend to make additional research in that field as soon as possible. My most interesting part is the Steganography part . The idea of Steganography is to hide data in images using simple Math. Utilising base 2 numbers or even decimals, you can hide images under other images or even text under images.",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1725538026/Screenshot_2024-09-05_at_1.06.55_PM_crmbdc.png",
      android: "",
      ios: "",
      type: "web",
    },
    {
      _id: "663f2b411e3ec97f4ecf87d6",
      link: "https://iroro1.github.io/lionK.com/backgroundGen(DOM%20MANIPULATION%202)/index.html",
      title: "Background Gradient",
      desc: "This is a portfolio project made generate beautiful gradient colors and can be used for real projects or just for fun.",
      snapshots: [],
      android: "",
      ios: "",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720467456/Screenshot_2024-07-08_at_8.35.02_PM_x2eofx.png",
    },
    {
      _id: "663f2b721e3ec97f4ecf87d8",
      link: "https://fdo.netlify.app/",
      title: "Debt Office",
      desc: "This is a portfolio project made with react/Redux/Firebase. use(test@test.com/test@test.com) for login email and password. When logged in, you can enable registration from settings and test out registration.",
      snapshots: [],
      android: "",
      ios: "",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720467450/Screenshot_2024-07-08_at_8.35.31_PM_k1dnpm.png",
    },
    {
      _id: "663f2bcf1e3ec97f4ecf87db",
      link: "https://ojigboleo.netlify.app/",
      title: "Portfolio 2023",
      desc: "Portfolio website for leo ojigbo. Started with a simple design on Figma and implemented the code in react js. Moving to a newer design using the production ready NextJs react framework to be used from Q2 in 2024.",
      snapshots: [],
      android: "",
      ios: "",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720467438/Screenshot_2024-07-08_at_8.36.06_PM_pyrasc.png",
    },
    {
      _id: "663f2bdc1e3ec97f4ecf87dc",
      link: "https://colornames.netlify.app/",
      title: "Colornames",
      desc: "A website that gives users the names of about 2332 colours and also allows users to copy the color codes or generate random palletes.",
      snapshots: [],
      android: "",
      ios: "",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1723103276/Screenshot_2024-08-08_at_8.47.19_AM_cbhjbc.png",
    },
    {
      _id: "669795e02ab9997aba3a85ca",
      link: "https://drive.google.com/file/d/1vUQ7cKM1jgARsR6ISGDDFckjj6QASTIy/view?usp=sharing",
      title: "Health Tracker",
      desc: "A comprehensive mobile app for tracking blood sugar and pressure levels, designed to help users monitor and manage their blood sugar effectively. The app includes features for logging glucose readings and viewing historical data. An APK is available for straightforward installation on Android devices, making it easily accessible for users seeking to improve their glucose management.",
      android: "",
      ios: "",
      type: "Mobile",
      premium: true,
      img: "https://img.freepik.com/free-vector/glucose-meter-device-checking-blood-sugar-levels_1308-150535.jpg?t=st=1721210472~exp=1721214072~hmac=ac422e04e4afdd0fef85cc226943db509650d260e9fae2569d5b55d71e45dec5&w=1800",
    },
    {
      _id: "66a4a9606d8345099056e80f",
      link: "https://myauct.netlify.app/",
      title: "MyAuct",
      desc: "What began as a simple idea evolved into a fully functional auction web application after a series of design challenges. I secured a domain and engaged a designer in January 2024, but by March, the design progress was stalled. When a second designer took over, only a login page was completed by July. Undeterred, I decided to take matters into my own hands, starting from scratch on July 20th with no clear design in mind. By July 27th, I successfully developed a complete and functional auction web application.",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1722066859/myauct_qjdxfe.png",
    },
    {
      _id: "66a4ddd3bbfd4348dd868f81",
      link: "https://vocal-dango-c087e3.netlify.app/",
      title: "VueJs Todo",
      desc: "A Vue.js todo list application demonstrating proficiency in Vue Router, Vuex, and essential Vue components to showcase the ability to build and manage web applications in Vue JS effectively.",
      premium: true,
      type: "web",
      img: "https://images.unsplash.com/photo-1641261689141-ee46b8a0470c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      _id: "66a5817a78663f3736b3b922",
      link: "https://www.npmjs.com/package/js-helper-function",
      title: "Js-helper-function",
      desc: "An npm package for javascript users that holds well over 100 utility functions for manipulating strings, objects, dates and arrays.",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1722123321/npm-logo_xdgjre.png",
    },
    {
      _id: "66acb1cd36fa52ae0fd35f68",
      link: "https://elegant-gnome-a531af.netlify.app/",
      title: "Angular Todo",
      desc: "An Angular todo list application demonstrating proficiency in use of Angular and essential to showcase the ability to build and manage web applications in Angular effectively.",
      premium: true,
      type: "web",
      img: "https://images.unsplash.com/photo-1641261689141-ee46b8a0470c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      _id: "66afeec236fa52ae0fd35f6d",
      link: "https://turbogames.com.ng/",
      title: "TurboGames by Lab11",
      desc: "A gaming application that organizes multiplayer games for gamers with the possibilities of winning real money for winning tournaments.",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1722806828/Screenshot_2024-08-04_at_10.10.41_PM_toelyh.png",
    },
    {
      _id: "66b0a02236fa52ae0fd35f6e",
      link: "https://cecurestream.com",
      title: "Cecurestream",
      desc: "An application built to organise virtual meetings like the google meets, zooms and the others.",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1722851537/Screenshot_2024-08-05_at_10.51.22_AM_vxul5y.png",
    },
    {
      _id: "66b12af936fa52ae0fd35f6f",
      link: "https://unpopularjs.netlify.app/",
      title: "Unpopular-js React UI library",
      desc: "An npm package for react js users that is built to be a UI library with components and useful react hooks",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1722123321/npm-logo_xdgjre.png",
    },
    {
      _id: "66cc9a98f3c7190d5cb1d012",
      link: "https://spend-guard.netlify.app/",
      title: "Spend Guard",
      desc: "Your ultimate tool for smarter budgeting, saving, and investing. Whether you're looking to save more, invest wisely, or simply manage your expenses better, Spend Guard has you covered. Customize your financial plan to match your goals and take control of your future. Built with NextJs TypeScript with e2e Testing using Playwright",
      premium: true,
      type: "web",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1724684797/Screenshot_2024-08-26_at_4.03.04_PM_f5bk5y.png",
    },
    {
      _id: "66daa413a613cd802b6e27a7",
      link: "https://pgraters.com/download",
      title: "PGRaters MobileApp",
      desc: "A platform uniting basketball players, coaches, officials, organizers, and enthusiasts from the playground to the professional leagues. PGRaters is transforming the way basketball is perceived on the continent with its unique data-driven platform that is fostering the growth of the game within the communities. I and my team built the website and mobile apps. Visit link on Mobile to install app.",
      android: "",
      ios: "",
      type: "Mobile",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1720280548/pgr_rmpe9j.png",
    },
    {
      _id: "66e2c1e55572ecfd37e61089",
      link: "https://cecurecast.com/",
      title: "Cecurecast",
      desc: "Say goodbye to complicated setups and hello to effortless livestreaming!",
      android: "",
      ios: "",
      type: "web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1726136925/Screenshot_2024-09-12_at_11.25.58_AM_hu6wpk.png",
    },
    {
      _id: "66e2c2d55572ecfd37e6108a",
      link: "https://cecurefindme.com/",
      title: "Cecure Findme",
      desc: "Track your session attendance with ease and search for attendee with no hassle",
      android: "",
      ios: "",
      type: "web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1726137084/Screenshot_2024-09-12_at_11.30.22_AM_k9yn4o.png",
    },
    {
      _id: "66e2c3625572ecfd37e6108b",
      link: "https://app.zerobdc.com/ng",
      title: "ZeroBDC",
      desc: "Record transactions, view & monitor rates across Nigeria, update rates, generate reports, manage your teams, manage users, and more on ZeroBDC app.",
      android: "",
      ios: "",
      type: "web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1726137257/Screenshot_2024-09-12_at_11.34.08_AM_rkjryd.png",
    },
    {
      _id: "66e2db8a5572ecfd37e6108c",
      link: "https://musicyarns.com/",
      title: "Yarn",
      desc: "Explore new artists, join exclusive fan clubs, and immerse yourself in the music culture with Yarn.",
      android: "",
      ios: "",
      type: "web",
      premium: true,
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1726143501/Screenshot_2024-09-12_at_1.17.56_PM_higsqj.png",
    },
    {
      _id: "6632b212379032c59e08ff0aaa",
      type: "mobile",
      title: "Yarn Mobile",
      premium: true,
      link: "https://musicyarns.com/download",
      desc: "Explore new artists, join exclusive fan clubs, and immerse yourself in the music culture with Yarn.",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1726143501/Screenshot_2024-09-12_at_1.17.56_PM_higsqj.png",
    },
    {
      _id: "6632b212379032c59e08ff0aaa46",
      type: "web",
      title: "Hols",
      premium: true,
      link: "https://hols.netlify.app/",
      desc: "Hols is a holiday greetings app.Create and send customised greetings to your loved ones during holiday seasons",
      img: "https://images.pexels.com/photos/3370704/pexels-photo-3370704.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      _id: "6632b212379032c59e08ff0aaa49",
      type: "web",
      title: "TLZ",
      premium: true,
      link: "https://tlz.netlify.app/",
      desc: "Shorten those long urls and stop sharing annoyingly long links",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1735050998/Screenshot_2024-12-24_at_3.36.29_PM_nhpz6z.png",
    },
    {
      _id: "6632b212379032c59e08hff0aaa49",
      type: "web",
      title: "Chat POC",
      premium: true,
      link: "https://chatmoduletest.netlify.app/",
      desc: "Proof of concept for a chat module to be used in a messaging app",
      img: "https://images.pexels.com/photos/1111368/pexels-photo-1111368.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      _id: "6632b212379032c59e08ff0aaa496",
      type: "web",
      title: "Movie streaming app",
      premium: true,
      link: "",
      desc: "Built a movie streaming app like Netflix for a client. Worked on the frontend of the project. Finished the MVP and the client is satisfied with the app but had financial constraints. So the project didn't get to production.",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1740133171/TRIBEPIC_kl22a2.png",
    },
    {
      _id: "6632b212379032c59e08ff0aaa496as",
      type: "web",
      title: "Ecommerce app",
      premium: true,
      link: "",
      desc: "Built an ecommerce app for a client. Worked on the frontend of the project. Finished the MVP pushed to prod.",
      img: "https://res.cloudinary.com/dbpvtdta0/image/upload/v1740135950/et_rwuwze.png",
    },
  ]

  // Filter out hidden projects
  return projects
    .filter((project) => !project.hide)
    .map((project) => {
      // Normalize project data structure
      return {
        ...project,
        description: project.description || project.desc,
        image: project.image || project.img,
        demoUrl: project.link,
        slug: project.slug || project.title.toLowerCase().replace(/\s+/g, "-"),
        tags: project.tags || [project.type],
      }
    })
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const allProjects = await getAllProjects()
  return allProjects
    .filter((project) => project.premium)
    .slice(0, 6)
    .map((project) => ({
      ...project,
      tags: project.type.split("/").map((t) => t.trim()),
    }))
}

export async function getProjectsByType(type: string): Promise<Project[]> {
  const allProjects = await getAllProjects()
  if (type === "All") {
    return allProjects
  }
  return allProjects.filter(
    (project) =>
      project.type.toLowerCase().includes(type.toLowerCase()) ||
      (project.tags && project.tags.some((tag) => tag.toLowerCase() === type.toLowerCase())),
  )
}
