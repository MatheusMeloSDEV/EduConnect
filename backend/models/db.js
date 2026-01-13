
// --- BANCO DE DADOS EM MEMÓRIA (Legado/Referência) ---
// Isto atua como um "MongoDB" simulado. 
// Em uma aplicação real, estes seriam Schemas do Mongoose conectando a um DB real.

const USERS = [
  {
    _id: "user-1",
    fullName: "Estudante Demo",
    email: "aluno@fiap.com.br",
    password: "123", // Corresponde ao Login.tsx
    role: "aluno",
    institution: "Escola FIAP",
    age: 20,
    guardianName: "Pais",
    group: "3A",
    avatar: "https://ui-avatars.com/api/?name=Estudante+Demo&background=random&color=fff&background=7c3aed",
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "writer-1",
    fullName: "Prof. Ana",
    email: "ana@fiap.com.br",
    password: "123",
    role: "professor",
    institution: "Escola FIAP",
    age: 35,
    subjects: ["Matemática", "Física"],
    avatar: "https://ui-avatars.com/api/?name=Prof+Ana&background=random",
    active: true,
    createdAt: new Date().toISOString()
  }
];

const ARTICLES = [
  {
    _id: "1",
    headline: "Dicas de Estudo para o Enem",
    summary: "Confira as melhores estratégias para se preparar para a prova mais importante do ano.",
    body: "O Exame Nacional do Ensino Médio (Enem) exige preparação consistente. Neste artigo, exploramos técnicas como Pomodoro, mapas mentais e resolução de provas antigas para maximizar seu desempenho. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
    upvotes: 120,
    reviews: 1,
    tags: ["Dicas", "Enem"],
    writer: "writer-1",
    createdAt: new Date(Date.now() - 10000000).toISOString(),
    isReleased: true
  },
  {
    _id: "2",
    headline: "A Revolução da IA na Educação",
    summary: "Como a inteligência artificial está mudando a sala de aula e personalizando o aprendizado.",
    body: "A tecnologia avança a passos largos. Ferramentas de IA generativa estão permitindo que professores criem materiais personalizados e alunos tirem dúvidas em tempo real.",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    upvotes: 85,
    reviews: 0,
    tags: ["Tecnologia"],
    writer: "writer-1",
    createdAt: new Date().toISOString(),
    isReleased: true
  }
];

const REVIEWS = [
  {
    _id: "c1",
    message: "Ótimo artigo! Ajudou muito nos meus estudos.",
    reviewer: "user-1",
    article: "1",
    parentReview: null,
    upvotes: 5,
    createdAt: new Date().toISOString()
  }
];

const UPVOTES = [
  { user: "user-1", article: "1" }
];

const REVIEW_LIKES = [];

module.exports = {
    USERS,
    ARTICLES,
    REVIEWS,
    UPVOTES,
    REVIEW_LIKES
};
