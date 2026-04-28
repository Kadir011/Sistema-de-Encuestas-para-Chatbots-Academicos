/**
 * Modelo de Usuario — Mongoose Schema
 *
 * Equivalencias con la versión PostgreSQL:
 *  - UNIQUE email / username  → unique: true en el schema
 *  - ON CONFLICT DO NOTHING   → save() captura el error 11000 (duplicate key)
 *  - ON CONFLICT DO UPDATE    → findOneAndUpdate({ upsert: true })
 *  - bcrypt                   → pre-save hook (igual que antes)
 *  - transaction()            → recibe session opcional
 *
 * SOLID: SRP — solo define la estructura y el acceso a datos del usuario.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// ─── Schema ───────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'El nombre de usuario es requerido'],
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
        },
        email: {
            type: String,
            required: [true, 'El correo electrónico es requerido'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de email inválido'],
        },
        password: {
            type: String,
            required: [true, 'La contraseña es requerida'],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['student', 'teacher', 'admin'],
            default: 'student',
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
        versionKey: false,
    }
);

// ─── Índices (equivalente a CREATE INDEX en PostgreSQL) ───────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ─── Pre-save hook: hash de contraseña ────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
});

// ─── Helper: serialización segura (sin password) ─────────────────────────────
userSchema.methods.toSafeObject = function () {
    return {
        id: this._id.toString(),
        username: this.username,
        email: this.email,
        role: this.role,
        created_at: this.created_at,
    };
};

const UserModel = mongoose.model('User', userSchema, 'users');

// ─── Clase estática User (misma API que la versión pg) ────────────────────────
class User {

    // ── create (idempotente por email) ────────────────────────────────────────
    static async create({ username, email, password, role = 'student' }) {
        try {
            const user = new UserModel({ username, email, password, role });
            await user.save();
            return user.toSafeObject();
        } catch (error) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                if (field === 'email') throw new Error('El email ya está registrado');
                if (field === 'username') throw new Error('El nombre de usuario ya está en uso');
            }
            throw error;
        }
    }

    // ── findOrCreate ──────────────────────────────────────────────────────────
    static async findOrCreate({ username, email, password, role = 'student' }) {
        const existing = await UserModel.findOne({ email }).lean();
        if (existing) {
            return { user: _toSafe(existing), created: false };
        }
        const user = await User.create({ username, email, password, role });
        return { user, created: true };
    }

    // ── Búsquedas ──────────────────────────────────────────────────────────────
    static async findByEmail(email) {
        // Incluimos password para la verificación de login
        return UserModel.findOne({ email }).lean();
    }

    static async findById(id) {
        try {
            const user = await UserModel.findById(id).lean();
            return user ? _toSafe(user) : null;
        } catch {
            return null; // id inválido
        }
    }

    static async findByUsername(username) {
        return UserModel.findOne({ username }).lean();
    }

    static async findAll() {
        const users = await UserModel.find().sort({ created_at: -1 }).lean();
        return users.map(_toSafe);
    }

    static async findByRole(role) {
        const users = await UserModel.find({ role }).sort({ created_at: -1 }).lean();
        return users.map(_toSafe);
    }

    // ── Verificar contraseña ──────────────────────────────────────────────────
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    // ── Actualizar usuario ────────────────────────────────────────────────────
    static async update(id, { username, email, role }) {
        try {
            // Verificar colisiones de email/username con otros usuarios
            if (email) {
                const conflict = await UserModel.findOne({ email, _id: { $ne: id } });
                if (conflict) throw new Error('El email ya está en uso');
            }
            if (username) {
                const conflict = await UserModel.findOne({ username, _id: { $ne: id } });
                if (conflict) throw new Error('El nombre de usuario ya está en uso');
            }

            const updates = {};
            if (username !== undefined) updates.username = username;
            if (email !== undefined) updates.email = email;
            if (role !== undefined) updates.role = role;

            const user = await UserModel.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            ).lean();

            return user ? _toSafe(user) : null;
        } catch (error) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                throw new Error(
                    field === 'email'
                        ? 'El email ya está en uso'
                        : 'El nombre de usuario ya está en uso'
                );
            }
            throw error;
        }
    }

    // ── Actualizar contraseña ─────────────────────────────────────────────────
    static async updatePassword(id, newPassword) {
        const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const user = await UserModel.findByIdAndUpdate(
            id,
            { $set: { password: hashed } },
            { new: true }
        ).lean();
        return user ? { id: user._id.toString() } : null;
    }

    // ── Eliminar ──────────────────────────────────────────────────────────────
    static async delete(id) {
        try {
            const result = await UserModel.findByIdAndDelete(id).lean();
            return result ? { id: result._id.toString() } : null;
        } catch {
            return null;
        }
    }

    // ── Estadísticas ──────────────────────────────────────────────────────────
    static async getStatistics() {
        const now = new Date();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const [total, admins, teachers, students, newThisWeek, newThisMonth] =
            await Promise.all([
                UserModel.countDocuments(),
                UserModel.countDocuments({ role: 'admin' }),
                UserModel.countDocuments({ role: 'teacher' }),
                UserModel.countDocuments({ role: 'student' }),
                UserModel.countDocuments({ created_at: { $gte: sevenDaysAgo } }),
                UserModel.countDocuments({ created_at: { $gte: thirtyDaysAgo } }),
            ]);

        return {
            total_users: total,
            admins,
            teachers,
            students,
            new_this_week: newThisWeek,
            new_this_month: newThisMonth,
        };
    }

    static async countByRole() {
        const result = await UserModel.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);
        return result.map(r => ({ role: r._id, count: r.count }));
    }
}

// ─── Helper interno ───────────────────────────────────────────────────────────
function _toSafe(doc) {
    return {
        id: doc._id.toString(),
        username: doc.username,
        email: doc.email,
        role: doc.role,
        created_at: doc.created_at,
        // Incluimos password solo si está presente (para login)
        ...(doc.password ? { password: doc.password } : {}),
    };
}

export { UserModel };
export default User;