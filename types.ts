
export interface Project {
  id: string;
  title: string;
  location: string;
  venue: string; // Installation place name
  venueUrl?: string; // Optional venue website URL
  installDate: string; // Format: "Month YYYY" e.g., "June 2023"
  coordinates: { top: string; left: string }; // % positioning for the map
  shortDescription: string;
  fullDescription: {
    vision: string;
    approach: string;
    experience: string;
    connection: string;
  };
  tags: string[];
  image: string;
  color: string; // Hex code for the magnet/theme
  prototypes?: {
    captions?: string[];
    annotations?: string[];
  };
  myRole?: {
    title: string;
    responsibilities: string[];
  };
  stickers?: string[]; // Array of image paths for badges/awards to display on postcard
  award?: {
    title: string;
    category: string;
    url?: string;
    logo?: string;
  };
  featured?: boolean; // Show on homepage
  featuredOrder?: number; // Order on homepage (lower numbers first)
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  image: string;
  width: number; // Aspect ratio helper
  height: number;
}

export interface MagnetProps {
  project: Project;
  onClick: (project: Project) => void;
}
