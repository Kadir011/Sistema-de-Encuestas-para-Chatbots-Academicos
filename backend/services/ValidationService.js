/**
 * Servicio de validaciones
 *
 * SOLID aplicado:
 * ─ SRP: responsabilidad única → solo valida, no controla ni accede a datos.
 * ─ OCP: abierto a extensión (nuevas reglas) sin modificar las existentes.
 * ─ LSP: todas las estrategias implementan la misma interfaz { validate(data) }.
 * ─ DIP: los controladores dependen de esta abstracción, no de lógica inline.
 *
 * PATRÓN: Strategy — cada regla es una estrategia de validación intercambiable.
 */

// Interfaz base (contrato) 
class ValidationRule {
    /**
     * @param {Object} data   - Datos a validar
     * @returns {string|null} - Mensaje de error o null si es válido
     */
    validate(data) {
        throw new Error('validate() debe ser implementado por la subclase');
    }
}

// Reglas concretas (Strategy) 

class RequiredFieldRule extends ValidationRule {
    constructor(field, label) {
        super();
        this.field = field;
        this.label = label;
    }
    validate(data) {
        const value = data[this.field];
        if (value === undefined || value === null || value === '') {
            const feminine = /^la\b/i.test(this.label.trim());
            return `${this.label} es ${feminine ? 'requerida' : 'requerido'}`;
        }
        return null;
    }
}

class MinLengthRule extends ValidationRule {
    constructor(field, label, min) {
        super();
        this.field = field;
        this.label = label;
        this.min = min;
    }
    validate(data) {
        const value = data[this.field];
        if (value && String(value).length < this.min) {
            return `${this.label} debe tener al menos ${this.min} caracteres`;
        }
        return null;
    }
}

class MaxLengthRule extends ValidationRule {
    constructor(field, label, max) {
        super();
        this.field = field;
        this.label = label;
        this.max = max;
    }
    validate(data) {
        const value = data[this.field];
        if (value && String(value).length > this.max) {
            return `${this.label} no puede exceder ${this.max} caracteres`;
        }
        return null;
    }
}

class EmailFormatRule extends ValidationRule {
    constructor(field = 'email') {
        super();
        this.field = field;
        this.regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    }
    validate(data) {
        const value = data[this.field];
        if (value && !this.regex.test(value)) {
            return 'El correo electrónico no tiene un formato válido';
        }
        return null;
    }
}

class UsernameFormatRule extends ValidationRule {
    constructor(field = 'username') {
        super();
        this.field = field;
        this.regex = /^[a-zA-Z0-9_]+$/;
    }
    validate(data) {
        const value = data[this.field];
        if (value && !this.regex.test(value)) {
            return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
        }
        return null;
    }
}

// Exige mínimo 8 caracteres con mayúscula, minúscula, número y carácter especial.
// El mismo criterio se muestra en vivo en el frontend (barra de fuerza de contraseña).
class StrongPasswordRule extends ValidationRule {
    constructor(field = 'password') {
        super();
        this.field = field;
        this.regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    }
    validate(data) {
        const value = data[this.field];
        if (value && !this.regex.test(value)) {
            return 'La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula, número y carácter especial';
        }
        return null;
    }
}

class RangeRule extends ValidationRule {
    constructor(field, label, min, max) {
        super();
        this.field = field;
        this.label = label;
        this.min = min;
        this.max = max;
    }
    validate(data) {
        const value = data[this.field];
        if (value !== undefined && value !== null) {
            const num = parseInt(value);
            if (isNaN(num) || num < this.min || num > this.max) {
                return `${this.label} debe estar entre ${this.min} y ${this.max}`;
            }
        }
        return null;
    }
}

class EnumRule extends ValidationRule {
    constructor(field, label, allowedValues) {
        super();
        this.field = field;
        this.label = label;
        this.allowedValues = allowedValues;
    }
    validate(data) {
        const value = data[this.field];
        if (value && !this.allowedValues.includes(value)) {
            return `${this.label} debe ser uno de: ${this.allowedValues.join(', ')}`;
        }
        return null;
    }
}

class NonEmptyArrayRule extends ValidationRule {
    constructor(field, label) {
        super();
        this.field = field;
        this.label = label;
    }
    validate(data) {
        const value = data[this.field];
        if (!value || !Array.isArray(value) || value.length === 0) {
            return `${this.label}: debe seleccionar al menos una opción`;
        }
        return null;
    }
}

class ConditionalRule extends ValidationRule {
    /**
     * Aplica una regla solo si la condición sobre data es verdadera.
     * @param {Function} condition - (data) => boolean
     * @param {ValidationRule} rule
     */
    constructor(condition, rule) {
        super();
        this.condition = condition;
        this.rule = rule;
    }
    validate(data) {
        if (this.condition(data)) {
            return this.rule.validate(data);
        }
        return null;
    }
}

// Motor de validación (Context en Strategy) 
class Validator {
    constructor(rules = []) {
        this.rules = rules;
    }

    /**
     * Ejecuta todas las reglas y retorna el array de errores.
     * @param {Object} data
     * @returns {string[]}
     */
    validate(data) {
        const errors = [];
        for (const rule of this.rules) {
            const error = rule.validate(data);
            if (error) errors.push(error);
        }
        return errors;
    }

    /**
     * @returns {boolean}
     */
    isValid(data) {
        return this.validate(data).length === 0;
    }
}

// Fábrica de validadores (Factory + OCP) 
/**
 * ValidatorFactory
 * OCP: para añadir un nuevo tipo de validación, se agrega un método aquí
 *      sin modificar los validadores existentes ni los controladores.
 */
class ValidatorFactory {
    static createRegisterValidator() {
        return new Validator([
            new RequiredFieldRule('username', 'El nombre de usuario'),
            new MinLengthRule('username', 'El nombre de usuario', 3),
            new MaxLengthRule('username', 'El nombre de usuario', 50),
            new UsernameFormatRule('username'),
            new RequiredFieldRule('email', 'El correo electrónico'),
            new EmailFormatRule('email'),
            new RequiredFieldRule('password', 'La contraseña'),
            new MinLengthRule('password', 'La contraseña', 8),
            new StrongPasswordRule('password'),
            new EnumRule('role', 'El rol', ['student', 'teacher', 'admin']),
        ]);
    }

    static createLoginValidator() {
        return new Validator([
            new RequiredFieldRule('email', 'El correo electrónico'),
            new EmailFormatRule('email'),
            new RequiredFieldRule('password', 'La contraseña'),
            new RequiredFieldRule('role', 'El rol'),
        ]);
    }

    static createUserUpdateValidator() {
        return new Validator([
            // Al menos uno de los tres campos debe estar presente
            {
                validate(data) {
                    if (!data.username && !data.email && !data.role) {
                        return 'Debe proporcionar al menos un campo para actualizar';
                    }
                    return null;
                }
            },
            new MinLengthRule('username', 'El nombre de usuario', 3),
            new MaxLengthRule('username', 'El nombre de usuario', 50),
            new UsernameFormatRule('username'),
            new EmailFormatRule('email'),
            new EnumRule('role', 'El rol', ['student', 'teacher', 'admin']),
        ]);
    }

    // Autoservicio: el propio usuario edita su username/email desde
    // Configuración. Exige la contraseña actual como confirmación de
    // identidad, sin importar su rol (student, teacher o admin).
    static createProfileUpdateValidator() {
        return new Validator([
            new RequiredFieldRule('currentPassword', 'La contraseña actual'),
            {
                validate(data) {
                    if (!data.username && !data.email) {
                        return 'Debe proporcionar al menos un campo para actualizar (usuario o email)';
                    }
                    return null;
                }
            },
            new MinLengthRule('username', 'El nombre de usuario', 3),
            new MaxLengthRule('username', 'El nombre de usuario', 50),
            new UsernameFormatRule('username'),
            new EmailFormatRule('email'),
        ]);
    }

    // Autoservicio: cambio de contraseña propio (requiere la actual + la
    // nueva ya validada con la misma regla de fuerza que el registro).
    static createPasswordChangeValidator() {
        return new Validator([
            new RequiredFieldRule('currentPassword', 'La contraseña actual'),
            new RequiredFieldRule('newPassword', 'La nueva contraseña'),
            new MinLengthRule('newPassword', 'La nueva contraseña', 8),
            new StrongPasswordRule('newPassword'),
        ]);
    }

    static createStudentSurveyValidator() {
        return new Validator([
            new RequiredFieldRule('has_used_chatbot', '¿Ha usado chatbots?'),
            // Campos requeridos solo si ha usado chatbots
            new ConditionalRule(
                d => d.has_used_chatbot === true,
                new NonEmptyArrayRule('chatbots_used', 'Chatbots usados')
            ),
            new ConditionalRule(
                d => d.has_used_chatbot === true,
                new NonEmptyArrayRule('tasks_used_for', 'Tareas utilizadas')
            ),
            new ConditionalRule(
                d => d.has_used_chatbot === true,
                new RequiredFieldRule('preferred_chatbot', 'Chatbot preferido')
            ),
            new RangeRule('usefulness_rating', 'Calificación de utilidad', 1, 5),
            new RangeRule('overall_experience', 'Experiencia general', 1, 5),
        ]);
    }

    static createTeacherSurveyValidator() {
        return new Validator([
            new RequiredFieldRule('has_used_chatbot', '¿Ha usado chatbots?'),
            new ConditionalRule(
                d => d.has_used_chatbot === true,
                new NonEmptyArrayRule('chatbots_used', 'Chatbots usados')
            ),
            new ConditionalRule(
                d => d.has_used_chatbot === true,
                new NonEmptyArrayRule('courses_used', 'Cursos utilizados')
            ),
            new ConditionalRule(
                d => d.has_used_chatbot === true,
                new NonEmptyArrayRule('purposes', 'Propósitos de uso')
            ),
            new NonEmptyArrayRule('countries', 'País/es de ejercicio docente'),
        ]);
    }
}

export {
    ValidationRule,
    RequiredFieldRule,
    MinLengthRule,
    MaxLengthRule,
    EmailFormatRule,
    UsernameFormatRule,
    RangeRule,
    EnumRule,
    NonEmptyArrayRule,
    ConditionalRule,
    Validator,
    ValidatorFactory,
};