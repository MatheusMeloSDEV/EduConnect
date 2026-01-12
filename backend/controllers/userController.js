const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { fullName, email, password, role, institution, age, guardianName, group, subjects } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email já está em uso" });
        }

        // Create user (password will be hashed by pre-save hook in model)
        const newUser = new User({
            fullName, email, password, role, institution, age,
            avatar: `https://ui-avatars.com/api/?name=${fullName.replace(' ', '+')}&background=random`
        });

        if (role === 'aluno') {
            newUser.guardianName = guardianName;
            newUser.group = group;
        } else if (role === 'professor') {
            newUser.subjects = subjects || [];
        }

        await newUser.save();

        const publicUser = newUser.toPublicJSON ? newUser.toPublicJSON() : newUser.toObject();
        // Simple mock token generation (Use JWT in production)
        const token = `mock-token-${newUser._id}-${Date.now()}`;

        res.status(201).json({ success: true, message: "Usuário registrado", data: { user: publicUser, token } });
    } catch (error) {
        // Handle Mongoose validation errors nicely
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Select password explicitly if 'select: false' is set in model, though our updated model might have it true or require +password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: "Credenciais inválidas" });
        }

        // Use the model's comparison method
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

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ success: false, message: "Usuário não encontrado" });
        res.json({ success: true, data: user.toPublicJSON ? user.toPublicJSON() : user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId).select('+password');
        
        if (!user) return res.status(404).json({ success: false });
        
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Senha atual incorreta" });
        }
        
        // Setting the password triggers the pre-save hook to hash it
        user.password = newPassword;
        await user.save();
        
        res.json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};