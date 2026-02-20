import { User, Article, Comment, LoginResponse, ApiResponse } from "../types";

// Acesso Seguro a Variáveis de Ambiente
const getEnvVar = (key: string) => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // Ignorar erro
  }
  return undefined;
};

// URL da API
const API_URL = getEnvVar('VITE_API_URL') 
  ? `${getEnvVar('VITE_API_URL')}/api`
  : "https://backend-techchalenge-main.onrender.com/api";

// Headers com Token JWT
const getHeaders = () => {
  const userStr = localStorage.getItem("user");
  const token = userStr ? JSON.parse(userStr).token : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

// Helper para tratar respostas
async function handleResponse<T>(promise: Promise<Response>): Promise<T> {
  const res = await promise;
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.indexOf("application/json") !== -1) {
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.message || `Erro HTTP ${res.status}`);
    }
    return json;
  } else {
    // Tratamento para erros que não são JSON (ex: 404/500 do servidor web)
    const text = await res.text();
    console.error("Resposta API não-JSON:", text.substring(0, 200)); 
    throw new Error(`Erro na API (${res.status}): A resposta não é JSON.`);
  }
}

// --- NOVO: Serviço de IA (Trazido da versão "Depois") ---
export const aiService = {
  async getSuggestions(headline: string, body: string): Promise<ApiResponse<string>> {
    return handleResponse<ApiResponse<string>>(
      fetch(`${API_URL}/ai/suggestions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ headline, body })
      })
    );
  },
  async analyzeDoubts(articleId: string): Promise<ApiResponse<string>> {
    return handleResponse<ApiResponse<string>>(
      fetch(`${API_URL}/ai/analyze-doubts`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ articleId })
      })
    );
  }
};

// --- Serviço de Autenticação e Usuários ---
export const authService = {
  // Nota: Removi o método 'login' inseguro que usava senha fixa "123456"

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

  // Mantido da versão "Antes" (faltava na "Depois")
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return handleResponse<ApiResponse<void>>(
      fetch(`${API_URL}/users/password`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      })
    );
  },

  // Métodos de Admin (Mantidos da versão "Antes")
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

// --- Serviço de Artigos ---
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

  // MELHORIA: Usando a lógica da versão "Depois" (filtro no servidor), 
  // mas mantendo a assinatura correta.
  async getArticlesByAuthor(authorId: string): Promise<ApiResponse<Article[]>> {
    return handleResponse<ApiResponse<Article[]>>(
      fetch(`${API_URL}/articles?writer=${authorId}`, { headers: getHeaders() })
    );
  },

  // Mantida tipagem forte da versão "Antes"
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

  // Mantido da versão "Antes" (faltava na "Depois")
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

// --- Serviço de Comentários ---
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

  // Mantido da versão "Antes" (faltava na "Depois")
  async toggleCommentLike(id: string): Promise<ApiResponse<{ upvotes: number, liked: boolean }>> {
    return handleResponse<ApiResponse<{ upvotes: number, liked: boolean }>>(
      fetch(`${API_URL}/reviews/${id}/like`, {
        method: "PUT",
        headers: getHeaders()
      })
    );
  },

  // Mantido da versão "Antes" (faltava na "Depois")
  async deleteComment(id: string): Promise<ApiResponse<void>> {
    return handleResponse<ApiResponse<void>>(
      fetch(`${API_URL}/reviews/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      })
    );
  }
};

// --- Serviço de Certificados ---
export const certificateService = {
  async markAsCompleted(articleId: string): Promise<ApiResponse<{ certificate: any }>> {
    return handleResponse<ApiResponse<{ certificate: any }>>(
      fetch(`${API_URL}/certificates/${articleId}/complete`, {
        method: "POST",
        headers: getHeaders()
      })
    );
  },

  async checkCompletion(articleId: string): Promise<ApiResponse<{ completed: boolean, certificate?: any }>> {
    return handleResponse<ApiResponse<{ completed: boolean, certificate?: any }>>(
      fetch(`${API_URL}/certificates/${articleId}/check`, {
        headers: getHeaders()
      })
    );
  },

  async getMyCertificates(): Promise<ApiResponse<any[]>> {
    return handleResponse<ApiResponse<any[]>>(
      fetch(`${API_URL}/certificates/user/my-certificates`, {
        headers: getHeaders()
      })
    );
  }
};