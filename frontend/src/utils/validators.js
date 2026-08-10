// Validar email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validar username
export const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    return usernameRegex.test(username);
};

// Validar contraseña (regla mínima que además exige el backend)
export const isValidPassword = (password) => {
    return !!password && password.length >= 8
        && /[a-z]/.test(password)
        && /[A-Z]/.test(password)
        && /\d/.test(password)
        && /[^A-Za-z0-9]/.test(password);
};

// Validar contraseña fuerte (alias, misma regla que isValidPassword)
export const isStrongPassword = (password) => isValidPassword(password);

// Calcula la fuerza de una contraseña para la barra visual de registro.
// Devuelve { score: 0-4, label, color, checks: { length, lower, upper, number, special } }
export const getPasswordStrength = (password = '') => {
    const checks = {
        length: password.length >= 8,
        lower: /[a-z]/.test(password),
        upper: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    const passedCount = Object.values(checks).filter(Boolean).length;
    // score 0-4 para pintar hasta 4 barras (5 checks, "length" se combina visualmente)
    const score = password.length === 0 ? 0 : Math.max(1, passedCount - 1);

    const levels = [
        { label: 'Muy débil', color: 'bg-red-500' },
        { label: 'Débil', color: 'bg-orange-500' },
        { label: 'Regular', color: 'bg-yellow-500' },
        { label: 'Buena', color: 'bg-blue-500' },
        { label: 'Fuerte', color: 'bg-green-500' },
    ];

    return { score, checks, ...levels[score] };
};

// Validar rating (1-5)
export const isValidRating = (rating) => {
    const num = parseInt(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
};

// Validar array no vacío
export const isNonEmptyArray = (arr) => {
    return Array.isArray(arr) && arr.length > 0;
};

// Validar formulario de registro
export const validateRegisterForm = (formData) => {
    const errors = {};

    if (!formData.username) {
        errors.username = 'El nombre de usuario es requerido';
    } else if (!isValidUsername(formData.username)) {
        errors.username = 'Username inválido (3-50 caracteres, solo letras, números y _)';
    }

    if (!formData.email) {
        errors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Email inválido';
    }

    if (!formData.password) {
        errors.password = 'La contraseña es requerida';
    } else if (!isValidPassword(formData.password)) {
        errors.password = 'Debe tener 8+ caracteres, mayúscula, minúscula, número y carácter especial';
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return errors;
};

// Validar formulario de cambio de contraseña (Perfil / Configuración)
export const validatePasswordChangeForm = (formData) => {
    const errors = {};

    if (!formData.currentPassword) {
        errors.currentPassword = 'Ingresa tu contraseña actual';
    }

    if (!formData.newPassword) {
        errors.newPassword = 'La nueva contraseña es requerida';
    } else if (!isValidPassword(formData.newPassword)) {
        errors.newPassword = 'Debe tener 8+ caracteres, mayúscula, minúscula, número y carácter especial';
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
        errors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    return errors;
};

// Validar formulario de actualización de datos de cuenta (username/email)
export const validateProfileUpdateForm = (formData) => {
    const errors = {};

    if (!formData.username) {
        errors.username = 'El nombre de usuario es requerido';
    } else if (!isValidUsername(formData.username)) {
        errors.username = 'Username inválido (3-50 caracteres, solo letras, números y _)';
    }

    if (!formData.email) {
        errors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Email inválido';
    }

    if (!formData.currentPassword) {
        errors.currentPassword = 'Ingresa tu contraseña actual para confirmar los cambios';
    }

    return errors;
};

// Validar formulario de login
export const validateLoginForm = (formData) => {
    const errors = {};

    if (!formData.email) {
        errors.email = 'El email es requerido';
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Email inválido';
    }

    if (!formData.password) {
        errors.password = 'La contraseña es requerida';
    }

    if (!formData.role) {
        errors.role = 'Debes seleccionar un tipo de acceso';
    }

    return errors;
};

// Validar encuesta de estudiante
export const validateStudentSurvey = (formData) => {
    const errors = {};

    if (formData.has_used_chatbot === undefined) {
        errors.has_used_chatbot = 'Debes indicar si has usado chatbots';
    }

    if (formData.has_used_chatbot) {
        if (!isNonEmptyArray(formData.chatbots_used)) {
            errors.chatbots_used = 'Selecciona al menos un chatbot';
        }

        if (!isNonEmptyArray(formData.tasks_used_for)) {
            errors.tasks_used_for = 'Selecciona al menos una tarea';
        }

        if (!formData.preferred_chatbot) {
            errors.preferred_chatbot = 'Selecciona tu chatbot preferido';
        }

        if (formData.usefulness_rating && !isValidRating(formData.usefulness_rating)) {
            errors.usefulness_rating = 'Rating inválido (1-5)';
        }

        if (formData.overall_experience && !isValidRating(formData.overall_experience)) {
            errors.overall_experience = 'Rating inválido (1-5)';
        }
    }

    return errors;
};

// Validar encuesta de profesor
export const validateTeacherSurvey = (formData) => {
    const errors = {};

    if (formData.has_used_chatbot === undefined) {
        errors.has_used_chatbot = 'Debes indicar si has usado chatbots';
    }

    if (formData.has_used_chatbot) {
        if (!isNonEmptyArray(formData.chatbots_used)) {
            errors.chatbots_used = 'Selecciona al menos un chatbot';
        }

        if (!isNonEmptyArray(formData.courses_used)) {
            errors.courses_used = 'Selecciona al menos un curso';
        }

        if (!isNonEmptyArray(formData.purposes)) {
            errors.purposes = 'Selecciona al menos un propósito';
        }
    }

    if (!isNonEmptyArray(formData.countries)) {
        errors.countries = 'Debes seleccionar al menos un país';
    }

    return errors;
};