import { User, Article, Comment, LoginResponse, ApiResponse } from "../types";

// Safe Environment Variable Access
const getEnvVar = (key: string) => {
  try {
    // Check for Vite/ESM environment
    // Cast import.meta to any to avoid TS error: Property 'env' does not exist on type 'ImportMeta'
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // Ignore error
  }
  return undefined;
};

// Use the hosted backend URL by default
// If VITE_API_URL is provided in .env, use that instead (e.g. for local dev overrides)
const API_URL = getEnvVar('VITE_API_URL') 
  ? `${getEnvVar('VITE_API_URL')}/api`
  : "https://backend-techchalenge-main.onrender.com/api";

// Helper to get headers with JWT token
const getHeaders = () => {
  const userStr = localStorage.getItem("user");
  const token = userStr ? JSON.parse(userStr).token : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

// Helper to handle API responses standardly with better error checking
async function handleResponse<T>(promise: Promise<Response>): Promise<T> {
  const res = await promise;
  
  // Check if response is JSON
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.message || `HTTP Error ${res.status}`);
    }
    return json;
  } else {
    // If not JSON, it's likely an HTML error page (404/500 from proxy or server)
    const text = await res.text();
    console.error("Non-JSON API Response:", text.substring(0, 200)); // Log first 200 chars
    throw new Error(`Erro na API (${res.status}): A resposta não é JSON. Verifique a conexão com ${API_URL}`);
  }
}

export const authService = {
  async login(email: string): Promise<LoginResponse> {
    return this.loginWithPassword(email, "123456");
  },
  
  async loginWithPassword(email: string, password: string): Promise<LoginResponse> {
    return handleResponse<LoginResponse>(
      fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
    );
  },

  async register(userData: any): Promise<LoginResponse> {
    return handleResponse<LoginResponse>(
      fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      })
    );
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return handleResponse<ApiResponse<User>>(
      fetch(`${API_URL}/users/${id}`, { headers: getHeaders() })
    );
  },

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return handleResponse<ApiResponse<User>>(
      fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updates)
      })
    );
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return handleResponse<ApiResponse<void>>(
      fetch(`${API_URL}/users/password`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      })
    );
  },

  // Admin Methods
  async getAllUsers(role?: string): Promise<ApiResponse<User[]>> {
    const url = role ? `${API_URL}/users?role=${role}` : `${API_URL}/users`;
    return handleResponse<ApiResponse<User[]>>(
      fetch(url, { headers: getHeaders() })
    );
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return handleResponse<ApiResponse<void>>(
      fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      })
    );
  },

  async createUserByAdmin(userData: any): Promise<ApiResponse<User>> {
    return handleResponse<ApiResponse<User>>(
      fetch(`${API_URL}/users`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(userData)
      })
    );
  },

  async updateUserByAdmin(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return handleResponse<ApiResponse<User>>(
      fetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updates)
      })
    );
  }
};

export const articleService = {
  async getArticles(search?: string): Promise<ApiResponse<Article[]>> {
    const url = search 
      ? `${API_URL}/articles?search=${encodeURIComponent(search)}` 
      : `${API_URL}/articles`;
      
    return handleResponse<ApiResponse<Article[]>>(
      fetch(url, { headers: getHeaders() })
    );
  },
  
  async getPopularArticles(): Promise<ApiResponse<Article[]>> {
    return handleResponse<ApiResponse<Article[]>>(
      fetch(`${API_URL}/articles/popular`, { headers: getHeaders() })
    );
  },

  async getArticleById(id: string): Promise<ApiResponse<Article>> {
    return handleResponse<ApiResponse<Article>>(
      fetch(`${API_URL}/articles/${id}`, { headers: getHeaders() })
    );
  },

  async getArticlesByAuthor(userId: string): Promise<ApiResponse<Article[]>> {
    // Fetch all articles (with a higher limit) and filter client-side since 
    // the backend endpoint for author filtering might not be exposed directly.
    const res = await fetch(`${API_URL}/articles?limit=100`, { headers: getHeaders() });
    
    // Manual check here because we process data before returning
    const contentType = res.headers.get("content-type");
    if (!contentType || contentType.indexOf("application/json") === -1) {
        throw new Error("Erro API: Resposta não é JSON.");
    }

    const json = await res.json();
    
    if (!res.ok) {
       throw new Error(json.message || `HTTP Error ${res.status}`);
    }

    if (json.success && Array.isArray(json.data)) {
      const filtered = json.data.filter((a: Article) => 
        (typeof a.writer === 'string' ? a.writer === userId : a.writer._id === userId)
      );
      return { success: true, data: filtered };
    }
    return json as ApiResponse<Article[]>;
  },

  async createArticle(articleData: Pick<Article, 'headline' | 'summary' | 'body' | 'tags' | 'imageUrl'>, user: User): Promise<ApiResponse<Article>> {
    return handleResponse<ApiResponse<Article>>(
      fetch(`${API_URL}/articles`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(articleData)
      })
    );
  },

  async updateArticle(id: string, updates: Partial<Article>): Promise<ApiResponse<Article>> {
    return handleResponse<ApiResponse<Article>>(
      fetch(`${API_URL}/articles/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updates)
      })
    );
  },

  async deleteArticle(id: string): Promise<ApiResponse<void>> {
    return handleResponse<ApiResponse<void>>(
      fetch(`${API_URL}/articles/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      })
    );
  },

  async toggleUpvote(id: string): Promise<ApiResponse<{ upvotes: number, upvoted: boolean }>> {
    return handleResponse<ApiResponse<{ upvotes: number, upvoted: boolean }>>(
      fetch(`${API_URL}/articles/${id}/upvote`, {
        method: "PUT",
        headers: getHeaders()
      })
    );
  }
};

export const commentService = {
  async getCommentsByArticle(id: string): Promise<ApiResponse<Comment[]>> {
    return handleResponse<ApiResponse<Comment[]>>(
      fetch(`${API_URL}/reviews/article/${id}`, { headers: getHeaders() })
    );
  },

  async createComment(data: { message: string, articleId: string }): Promise<ApiResponse<Comment>> {
    return handleResponse<ApiResponse<Comment>>(
      fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data)
      })
    );
  },

  async toggleCommentLike(id: string): Promise<ApiResponse<{ upvotes: number, liked: boolean }>> {
    return handleResponse<ApiResponse<{ upvotes: number, liked: boolean }>>(
      fetch(`${API_URL}/reviews/${id}/like`, {
        method: "PUT",
        headers: getHeaders()
      })
    );
  },

  async deleteComment(id: string): Promise<ApiResponse<void>> {
    return handleResponse<ApiResponse<void>>(
      fetch(`${API_URL}/reviews/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      })
    );
  }
};