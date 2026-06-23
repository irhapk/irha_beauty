export interface Review {
  name: string;
  designation: string;
  image: string;
  rating: number;
  text: string;
}

export const REVIEWS: Review[] = [
  {
    name: "Sarah K.",
    designation: "Karachi",
    image: "/review_placeholder.png",
    rating: 5,
    text: "This facewash completely transformed my skin routine. My skin feels so clean and fresh!",
  },
  {
    name: "Fatima R.",
    designation: "Lahore",
    image: "/review_placeholder.png",
    rating: 5,
    text: "Finally found a product that works for my sensitive skin. Highly recommend!",
  },
  {
    name: "Ayesha M.",
    designation: "Islamabad",
    image: "/review_placeholder.png",
    rating: 5,
    text: "Been using this for 3 weeks and the difference is visible. Will definitely reorder.",
  },
];
