
export interface Review {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ListingCard {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
  reviews?: Review[];
  created_at?: string;
}
