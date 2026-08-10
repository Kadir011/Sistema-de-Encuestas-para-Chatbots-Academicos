import { Check, X } from 'lucide-react';
import { getPasswordStrength } from '../../utils/validators';

/**
 * Barra de fuerza de contraseña + checklist en vivo.
 * No se muestra nada hasta que el usuario empieza a escribir.
 */
const PasswordStrengthMeter = ({ password = '' }) => {
    if (!password) return null;

    const { score, label, color, checks } = getPasswordStrength(password);
    const bars = [0, 1, 2, 3];

    const requirements = [
        { key: 'length', label: 'Al menos 8 caracteres' },
        { key: 'upper', label: 'Una letra mayúscula' },
        { key: 'lower', label: 'Una letra minúscula' },
        { key: 'number', label: 'Un número' },
        { key: 'special', label: 'Un carácter especial (!@#$...)' },
    ];

    return (
        <div className="mt-2 mb-3 -mt-2">
            <div className="flex gap-1.5" aria-hidden="true">
                {bars.map((i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            i < score ? color : 'bg-gray-200'
                        }`}
                    />
                ))}
            </div>
            <p className={`mt-1 text-xs font-medium ${
                score <= 1 ? 'text-red-600' : score === 2 ? 'text-yellow-600' : score === 3 ? 'text-blue-600' : 'text-green-600'
            }`}>
                Fuerza: {label}
            </p>

            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                {requirements.map((req) => {
                    const passed = checks[req.key];
                    return (
                        <li
                            key={req.key}
                            className={`flex items-center text-xs ${passed ? 'text-green-600' : 'text-gray-400'}`}
                        >
                            {passed ? (
                                <Check size={13} className="mr-1 flex-shrink-0" />
                            ) : (
                                <X size={13} className="mr-1 flex-shrink-0" />
                            )}
                            {req.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PasswordStrengthMeter;
