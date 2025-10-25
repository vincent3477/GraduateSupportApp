export const ROOMS = [
  {
    id: "engineering",
    label: "College of Engineering",
    description: "Product builds, capstone check-ins, and lab breakthroughs from builders and makers.",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "liberal-arts",
    label: "College of Liberal Arts",
    description: "Discussions on storytelling, research, civic impact, and creative practice.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "architecture",
    label: "College of Architecture",
    description: "Studio critiques, design inspiration, and portfolio feedback with peers.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "business",
    label: "College of Business",
    description: "Recruiting updates, case prep, startup wins, and leadership lessons.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "science",
    label: "College of Science",
    description: "Lab breakthroughs, grad school tips, and STEM career navigation.",
    image: "https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "agriculture",
    label: "College of Agriculture",
    description: "Sustainable farming, food systems innovation, and ag-tech discoveries.",
    image: "https://images.unsplash.com/photo-1500937386664-56b8cf822e96?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "education",
    label: "College of Education",
    description: "Teaching strategies, classroom wins, and inclusive pedagogy conversations.",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "health-sciences",
    label: "College of Health Sciences",
    description: "Clinical rotations, patient stories, and wellbeing research threads.",
    image: "https://images.unsplash.com/photo-1580281657521-4b46f4dcbbf0?auto=format&fit=crop&w=1200&q=80",
  },
];

export const NAV_SPLIT_INDEX = 4;
export const NAV_LEFT = ROOMS.slice(0, NAV_SPLIT_INDEX);
export const NAV_RIGHT = ROOMS.slice(NAV_SPLIT_INDEX);

export function getRoomById(id) {
  return ROOMS.find((room) => room.id === id);
}
