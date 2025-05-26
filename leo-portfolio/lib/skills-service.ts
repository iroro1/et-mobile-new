export interface Skill {
  _id: string
  title: string
  rating: number
}

export async function getSkills(): Promise<Skill[]> {
  // This would normally fetch from an API or database
  return [
    {
      _id: "663f34041e3ec97f4ecf8800",
      title: "HTML / CSS / JAVASCRIPT",
      rating: 5,
    },
    {
      _id: "663f34121e3ec97f4ecf8801",
      title: "REACT / REDUX / REST / GRApHQL/ WEBSOCKETS",
      rating: 5,
    },
    {
      _id: "663f34211e3ec97f4ecf8802",
      title: "NEXT JS ",
      rating: 5,
    },
    {
      _id: "663f34331e3ec97f4ecf8803",
      title: "AWS CLOUD ",
      rating: 4,
    },
    {
      _id: "663f344d1e3ec97f4ecf8804",
      title: "NODE / EXPRESS / SQL / NOSQL ",
      rating: 4,
    },
    {
      _id: "663f345b1e3ec97f4ecf8805",
      title: "REACT NATIVE",
      rating: 5,
    },
    {
      _id: "663f346d1e3ec97f4ecf8806",
      title: "UI/ / UX",
      rating: 3,
    },
  ]
}
