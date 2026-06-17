// Homepage slider configuration
//
// Add optimized slider images to public/images/slider/ and then add one object
// to this array. Keep the id unique, use a useful alt text, and keep captions short.
//
// Owner note:
// - Use landscape images when possible: 1920 x 1080px minimum, 2560 x 1440px for large screens.
// - objectPosition controls which part of the photo stays visible when the image is cropped.
//   Examples: "center", "top", "bottom", "left center", "right center".
// - quality controls Next/Image output quality. Keep slider images high quality, usually 90-95.
// - title is the big headline shown on the slide. If you leave it out, the shared
//   default headline from siteContent.hero.title is used instead.
export interface SliderImage {
  id: string;
  src: string;
  alt: string;
  label: string;
  title?: string;
  caption: string;
  objectPosition?: string;
  quality?: number;
  priority?: boolean;
}
export const sliderImages: readonly SliderImage[] = [
    {
    id: "Glow",
    src: "/images/slider/Glow-pickleball.png",
    alt: "Elite Courts padel court and player area in Lahore",
    label: "New Launch",
    title: "Glow in the Dark Pickleball.",
    caption: "1st Ever Glow in the Dark Pickleball in Pakistan",
    objectPosition: "center",
    quality: 95,
    priority: true,
  },
    {
    id: "Elite-store",
    src: "/images/slider/rackets.jpg",
    alt: "Elite Courts padel court and player area in Lahore",
    label: "Elite Store",
    title: "Shop the Elite Store.",
    caption: "You can shop high quality padel, pickleball, cricket, badminton and table tennis gear.",
    objectPosition: "center",
    quality: 95,
    priority: true,
  },
  {
    id: "padel-court",
    src: "/images/slider/padel-pic.webp",
    alt: "Elite Courts padel court and player area in Lahore",
    label: "Padel",
    title: "High Quality Panoramic Padel Court",
    caption: "Book our Premium padel court for quick games, practice, and competitive rallies.",
    objectPosition: "center",
    quality: 95,
    priority: true,
  },
  {
    id: "Cricket",
    src: "/images/slider/cricket-practice.webp",
    alt: "High speed bowling machine at Elite Court",
    label: "Cricket Practice",
    title: "Train on our bowling machine.",
    caption: "Practice on our high speed bowling machine with swing, spin and adjustable speed",
    objectPosition: "center",
    quality: 95,
  },
  {
    id: "racket-court",
    src: "/images/slider/racket-court.webp",
    alt: "Racket sports court space at Elite Courts Lahore",
    label: "Racket Sports",
    title: "One facility, every racket sport.",
    caption: "Pickleball, badminton, table tennis, and court sessions in one facility.",
    objectPosition: "center",
    quality: 95,
  },
  {
    id: "facility-view",
    src: "/images/slider/Glow-wingjpeg.jpeg",
    alt: "Elite Courts multi-sport facility view in Lahore",
    label: "Facility",
    title: "A clean facility, built for play.",
    caption: "Clean courts, useful player amenities, and simple WhatsApp booking.",
    objectPosition: "center",
    quality: 95,
  },
  {
    id: "session-highlight",
    src: "/images/slider/DSC03258.JPG",
    alt: "Players enjoying a sports session at Elite Courts Lahore",
    label: "Highlights",
    title: "Real moments from Elite Courts.",
    caption: "Real match moments, training sessions, and everyday play at Elite Courts.",
    objectPosition: "center",
    quality: 95,
  },
  {
    id: "pickleball-court",
    src: "/images/slider/New-pickle.JPG",
    alt: "Racket sports court space at Elite Courts Lahore",
    label: "Pickleball Sports",
    title: "Pickleball, ready when you are.",
    caption: "Pickleball, badminton, table tennis, and court sessions in one facility.",
    objectPosition: "center",
    quality: 95,
  },

];
