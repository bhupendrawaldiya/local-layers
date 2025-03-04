
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
  description?: string;
  reviews?: Review[];
  created_at?: string;
  seller_id?: string;
  is_visible?: boolean;
}
