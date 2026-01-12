export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: "professor" | "aluno";
  institution?: string;
  guardianName?: string;
  group?: string;
  subjects?: string[];
}

export interface Article {
  _id: string;
  headline: string;
  summary: string;
  body: string;
  imageUrl: string;
  upvotes: number;
  reviews: number;
  tags: string[];
  createdAt: string;
  writer: User;
}

export interface Comment {
  _id: string;
  message: string;
  reviewer: User;
  likes: number;
  userLiked?: boolean;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}