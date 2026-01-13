
const User = require('../models/User');

// Registra um novo usuário no sistema (Aluno ou Professor)
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, role, institution, age, guardianName, group, subjects, avatar } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email já está em uso" });
        }

        // Criar usuário (senha será criptografada pelo hook pre-save no modelo)
        const newUser = new User({
            fullName, email, password, role, institution, age,
            avatar: avatar || `https://ui-avatars.com/api/?name=${fullName.replace(' ', '+')}&background=random`
        });

        if (role === 'aluno') {
            newUser.guardianName = guardianName;
            newUser.group = group;
        } else if (role === 'professor') {
            newUser.subjects = subjects || [];
        }

        await newUser.save();

        const publicUser = newUser.toPublicJSON ? newUser.toPublicJSON() : newUser.toObject();
        // Geração simples de token simulado (Use JWT em produção)
        const token = `mock-token-${newUser._id}-${Date.now()}`;

        res.status(201).json({ success: true, message: "Usuário registrado", data: { user: publicUser, token } });
    } catch (error) {
        // Tratar erros de validação do Mongoose de forma amigável
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Realiza o login do usuário verificando email e senha
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Selecionar senha explicitamente se 'select: false' estiver definido no modelo
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: "Credenciais inválidas" });
        }

        // Usar o método de comparação do modelo
        const isMatch = await user.comparePassword(password);

        if (isMatch) {
            const publicUser = user.toPublicJSON ? user.toPublicJSON() : user.toObject();
            const token = `mock-token-${user._id}-${Date.now()}`;
            res.json({ success: true, message: "Login realizado", data: { user: publicUser, token } });
        } else {
            res.status(401).json({ success: false, message: "Credenciais inválidas" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Obtém os dados do perfil do usuário autenticado
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ success: false, message: "Usuário não encontrado" });
        res.json({ success: true, data: user.toPublicJSON ? user.toPublicJSON() : user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Atualiza os dados do perfil do usuário autenticado
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, institution, age, guardianName, group, subjects, avatar } = req.body;
        
        const updates = {};
        if (fullName) updates.fullName = fullName;
        if (institution) updates.institution = institution;
        if (age) updates.age = age;
        if (avatar) updates.avatar = avatar;
        
        if (guardianName) updates.guardianName = guardianName;
        if (group) updates.group = group;
        if (subjects) updates.subjects = subjects;

        const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });
        
        res.json({ success: true, message: "Perfil atualizado", data: updatedUser.toPublicJSON ? updatedUser.toPublicJSON() : updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Altera a senha do usuário autenticado
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId).select('+password');
        
        if (!user) return res.status(404).json({ success: false });
        
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Senha atual incorreta" });
        }
        
        // Definir a senha aciona o hook pre-save para criptografá-la
        user.password = newPassword;
        await user.save();
        
        res.json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Métodos de Admin ---

// (Admin) Lista todos os usuários cadastrados, com filtro opcional por função
exports.getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const query = {};
        if (role) query.role = role;
        
        const users = await User.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// (Admin) Busca um usuário específico pelo ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({success: false, message: "Usuário não encontrado"});
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// (Admin) Cria um novo usuário através do painel administrativo
exports.createUserByAdmin = async (req, res) => {
    // Reutilizando lógica de registro mas autenticado
    return exports.register(req, res);
};

// (Admin) Atualiza os dados de um usuário específico
exports.updateUserByAdmin = async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        
        // A senha será criptografada se fornecida (manipulado pelo hook pre-findOneAndUpdate no modelo User)
        // Não removemos updates.password aqui.

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
        if(!updatedUser) return res.status(404).json({success: false, message: "Usuário não encontrado"});

        // Higienizar o objeto de usuário retornado (remover hash da senha)
        const publicUser = updatedUser.toPublicJSON ? updatedUser.toPublicJSON() : updatedUser;

        res.json({ success: true, message: "Usuário atualizado", data: publicUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// (Admin) Remove um usuário do sistema
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Em um app real, deletar também seus artigos/comentários/likes
        res.json({ success: true, message: "Usuário removido" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
