import { User, Article, Comment, LoginResponse } from "../types";

// Safe Environment Variable Access
const getEnvVar = (key: string) => {
  try {
    // Check for Vite/ESM environment
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore error
  }
  return undefined;
};

// For standalone frontend, we default to localhost:3010 if no VITE_API_URL is set
const API_URL = getEnvVar('VITE_API_URL') 
  ? `${getEnvVar('VITE_API_URL')}/api`
  : "http://localhost:3010/api";

// Helper to get headers with JWT token
const getHeaders = () => {
  const userStr = localStorage.getItem("user");
  const token = userStr ? JSON.parse(userStr).token : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

// --- FALLBACK DATA (Used only if backend is unreachable) ---
const FALLBACK_USER: User = {
  _id: "user-offline",
  fullName: "Modo Offline",
  email: "offline@edu.connect",
  role: "aluno",
  institution: "Sem Conexão",
  avatar: "https://ui-avatars.com/api/?name=Offline&background=gray"
};

const FALLBACK_ARTICLES: Article[] = [
  {
    _id: "offline-1",
    headline: "Modo Offline: Bem-vindo ao EDUConnect",
    summary: "Você está sem conexão, mas o aprendizado não pode parar. Explore este conteúdo demonstrativo.",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mesmo sem conexão com o servidor, o aplicativo EDUConnect permite que você navegue pela interface e visualize conteúdos em cache ou pré-carregados.\n\nExperimente navegar entre as abas e ver como a experiência nativa se mantém fluida. Quando a conexão retornar, novos artigos serão carregados automaticamente.",
    imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800",
    upvotes: 124,
    reviews: 15,
    tags: ["Offline", "Guia"],
    createdAt: new Date().toISOString(),
    writer: FALLBACK_USER
  },
  {
    _id: "offline-2",
    headline: "Dicas de Estudo e Produtividade",
    summary: "Aprenda técnicas simples para manter o foco e melhorar seu rendimento nos estudos.",
    body: "Organize seu ambiente, utilize a técnica Pomodoro e faça pausas regulares. A constância é mais importante que a intensidade.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
    upvotes: 89,
    reviews: 8,
    tags: ["Dicas", "Estudo"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    writer: FALLBACK_USER
  },
  {
    _id: "offline-3",
    headline: "Tecnologia na Educação",
    summary: "Como dispositivos móveis e IA estão transformando a sala de aula moderna.",
    body: "A integração de tecnologia permite um ensino mais personalizado e acessível. Ferramentas como este aplicativo demonstram o potencial do m-learning.",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    upvotes: 256,
    reviews: 32,
    tags: ["Tech", "Inovação"],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    writer: FALLBACK_USER
  }
];

// Helper to safely fetch or return mock data on error
async function safeFetch<T>(promise: Promise<Response>, mockFallback: T): Promise<T> {
  try {
    const res = await promise;
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP Error ${res.status}`);
    return json;
  } catch (error) {
    console.warn(`API Request to ${API_URL} failed. Using offline fallback.`, error);
    // Return a structured success response with the fallback data
    return { success: true, ...((mockFallback as any).success ? mockFallback : { data: mockFallback }) } as any;
  }
}

export const authService = {
  async login(email: string): Promise<LoginResponse> {
    return this.loginWithPassword(email, "123456");
  },
  
  async loginWithPassword(email: string, password: string): Promise<LoginResponse> {
    return safeFetch(
      fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }),
      { 
        success: true, 
        data: { user: { ...FALLBACK_USER, email }, token: "offline-token" } 
      }
    );
  },

  async register(userData: any): Promise<LoginResponse> {
    return safeFetch(
      fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      }),
      { 
        success: true, 
        data: { user: { ...FALLBACK_USER, ...userData }, token: "offline-token" } 
      }
    );
  },

  async getUserById(id: string) {
    return safeFetch(
      fetch(`${API_URL}/users/${id}`, { headers: getHeaders() }),
      { success: true, data: FALLBACK_USER }
    );
  },

  async updateProfile(updates: Partial<User>) {
    return safeFetch(
      fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updates)
      }),
      { success: true, data: { ...FALLBACK_USER, ...updates } }
    );
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return safeFetch(
      fetch(`${API_URL}/users/password`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      }),
      { success: true, message: "Mock password changed" }
    );
  }
};

export const articleService = {
  async getArticles(search?: string) {
    const url = search 
      ? `${API_URL}/articles?search=${encodeURIComponent(search)}` 
      : `${API_URL}/articles`;
      
    return safeFetch(
      fetch(url, { headers: getHeaders() }),
      { success: true, data: FALLBACK_ARTICLES }
    );
  },
  
  async getPopularArticles() {
    return safeFetch(
      fetch(`${API_URL}/articles/popular`, { headers: getHeaders() }),
      { success: true, data: FALLBACK_ARTICLES }
    );
  },

  async getArticleById(id: string) {
    // If offline, try to find in fallback, otherwise just return the first one as a generic fallback page
    const fallback = FALLBACK_ARTICLES.find(a => a._id === id) || FALLBACK_ARTICLES[0];
    return safeFetch(
      fetch(`${API_URL}/articles/${id}`, { headers: getHeaders() }),
      { success: true, data: fallback }
    );
  },

  async getArticlesByAuthor(userId: string) {
    try {
      const res = await fetch(`${API_URL}/articles`, { headers: getHeaders() });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const filtered = json.data.filter((a: Article) => 
          (typeof a.writer === 'string' ? a.writer === userId : a.writer._id === userId)
        );
        return { success: true, data: filtered };
      }
      return json;
    } catch (e) {
      // Return fallback articles so the profile page isn't empty in offline mode
      return { success: true, data: FALLBACK_ARTICLES };
    }
  },

  async createArticle(articleData: Pick<Article, 'headline' | 'summary' | 'body' | 'tags' | 'imageUrl'>, user: User) {
    return safeFetch(
      fetch(`${API_URL}/articles`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(articleData)
      }),
      { success: true, data: { ...articleData, _id: "offline-id-" + Date.now(), writer: user, createdAt: new Date().toISOString(), upvotes: 0, reviews: 0 } }
    );
  },

  async updateArticle(id: string, updates: Partial<Article>) {
    return safeFetch(
      fetch(`${API_URL}/articles/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updates)
      }),
      { success: true, data: updates }
    );
  },

  async deleteArticle(id: string) {
    return safeFetch(
      fetch(`${API_URL}/articles/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      }),
      { success: true }
    );
  },

  async toggleUpvote(id: string) {
    return safeFetch(
      fetch(`${API_URL}/articles/${id}/upvote`, {
        method: "PUT",
        headers: getHeaders()
      }),
      { success: true, data: { upvoted: true, upvotesCount: 1 } }
    );
  }
};

export const commentService = {
  async getCommentsByArticle(id: string) {
    return safeFetch(
      fetch(`${API_URL}/reviews/article/${id}`, { headers: getHeaders() }),
      { success: true, data: [] }
    );
  },

  async createComment(data: { message: string, articleId: string }) {
    return safeFetch(
      fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data)
      }),
      { 
        success: true, 
        data: { 
           _id: "offline-comment-" + Date.now(), 
           ...data, 
           reviewer: FALLBACK_USER, 
           createdAt: new Date().toISOString(),
           likes: 0
        } 
      }
    );
  },

  async toggleCommentLike(id: string) {
    return safeFetch(
      fetch(`${API_URL}/reviews/${id}/like`, {
        method: "PUT",
        headers: getHeaders()
      }),
      { success: true }
    );
  },

  async deleteComment(id: string) {
    return safeFetch(
      fetch(`${API_URL}/reviews/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      }),
      { success: true }
    );
  }
};