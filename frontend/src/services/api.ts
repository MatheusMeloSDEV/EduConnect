
import { User, Article, Comment, LoginResponse, ApiResponse } from "../types";

// Acesso Seguro a Variáveis de Ambiente
const getEnvVar = (key: string) => {
  try {
    // Verificar ambiente Vite/ESM
    // Converter import.meta para any para evitar erro TS: Property 'env' does not exist on type 'ImportMeta'
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // Ignorar erro
  }
  return undefined;
};

// Usar a URL do backend hospedado por padrão
// Se VITE_API_URL for fornecida no .env, usar essa (ex: para overrides de dev local)
const API_URL = getEnvVar('VITE_API_URL') 
  ? `${getEnvVar('VITE_API_URL')}/api`
  : "https://backend-techchalenge-main.onrender.com/api";

// Auxiliar para obter headers com token JWT
const getHeaders = () => {
  const userStr = localStorage.getItem("user");
  const token = userStr ? JSON.parse(userStr).token : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

// Função auxiliar para tratar respostas da API e erros HTTP
async function handleResponse<T>(promise: Promise<Response>): Promise<T> {
  const res = await promise;
  
  // Verificar se a resposta é JSON
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.message || `Erro HTTP ${res.status}`);
    }
    return json;
  } else {
    // Se não for JSON, provavelmente é uma página de erro HTML (404/500 do proxy ou servidor)
    const text = await res.text();
    console.error("Resposta API não-JSON:", text.substring(0, 200)); // Logar primeiros 200 chars
    throw new Error(`Erro na API (${res.status}): A resposta não é JSON. Verifique a conexão com ${API_URL}`);
  }
}

// Serviço responsável pelas chamadas relacionadas à autenticação e usuários
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

  // Métodos de Admin
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

// Serviço responsável pelas chamadas relacionadas aos artigos
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
    // Buscar todos os artigos (com um limite maior) e filtrar no cliente, pois
    // o endpoint do backend para filtragem por autor pode não estar exposto diretamente.
    const res = await fetch(`${API_URL}/articles?limit=100`, { headers: getHeaders() });
    
    // Verificação manual aqui porque processamos os dados antes de retornar
    const contentType = res.headers.get("content-type");
    if (!contentType || contentType.indexOf("application/json") === -1) {
        throw new Error("Erro API: Resposta não é JSON.");
    }

    const json = await res.json();
    
    if (!res.ok) {
       throw new Error(json.message || `Erro HTTP ${res.status}`);
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

// Serviço responsável pelas chamadas relacionadas aos comentários
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
