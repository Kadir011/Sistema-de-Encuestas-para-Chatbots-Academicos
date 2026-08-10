import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import authService from '../services/authService';
import { validateProfileUpdateForm, validatePasswordChangeForm } from '../utils/validators';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';
import { Bell, Lock, User as UserIcon, Eye, EyeOff, Save } from 'lucide-react';
import { formatRole } from '../utils/formatters';

const Settings = () => {
	const { user, updateProfile } = useAuth();
	const [activeTab, setActiveTab] = useState('general');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');

	// Configuración General (preferencias de notificaciones — solo locales)
	const [generalSettings, setGeneralSettings] = useState({
		emailNotifications: true,
		pushNotifications: true,
		surveyReminders: true,
		marketingEmails: false,
	});

	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
		profileCurrent: false,
	});

	const showMessage = (type, text) => {
		setMessageType(type);
		setMessage(text);
		window.scrollTo({ top: 0, behavior: 'smooth' });
		setTimeout(() => setMessage(''), 4000);
	};

	const handleGeneralChange = (key) => {
		setGeneralSettings(prev => ({ ...prev, [key]: !prev[key] }));
	};

	// ─── Formulario: datos de cuenta (username/email) ──────────────────────
	// Cualquier usuario, sin importar su rol, puede editar su username/email
	// siempre que confirme su contraseña actual.
	const {
		values: profileValues,
		errors: profileErrors,
		touched: profileTouched,
		handleChange: handleProfileChange,
		handleBlur: handleProfileBlur,
		handleSubmit: handleProfileFormSubmit,
		reset: resetProfileForm,
		isSubmitting: profileSubmitting,
	} = useForm(
		{
			username: user?.username || '',
			email: user?.email || '',
			currentPassword: '',
		},
		validateProfileUpdateForm
	);

	const onProfileSubmit = async (formData) => {
		try {
			await updateProfile({
				username: formData.username,
				email: formData.email,
				currentPassword: formData.currentPassword,
			});
			showMessage('success', 'Tus datos se actualizaron correctamente');
			resetProfileForm({
				username: formData.username,
				email: formData.email,
				currentPassword: '',
			});
		} catch (err) {
			showMessage('error', err.message || 'No se pudieron actualizar tus datos');
		}
	};

	// ─── Formulario: cambio de contraseña ───────────────────────────────────
	const {
		values: passwordValues,
		errors: passwordErrors,
		touched: passwordTouched,
		handleChange: handlePasswordFormChange,
		handleBlur: handlePasswordBlur,
		handleSubmit: handlePasswordFormSubmit,
		reset: resetPasswordForm,
		isSubmitting: passwordSubmitting,
	} = useForm(
		{ currentPassword: '', newPassword: '', confirmPassword: '' },
		validatePasswordChangeForm
	);

	const onPasswordSubmit = async (formData) => {
		try {
			await authService.updatePassword({
				currentPassword: formData.currentPassword,
				newPassword: formData.newPassword,
			});
			showMessage('success', 'Contraseña actualizada exitosamente');
			resetPasswordForm();
		} catch (err) {
			showMessage('error', err.message || 'No se pudo actualizar la contraseña');
		}
	};

	return (
		<div>
			<Header
				title="Configuración"
				subtitle="Gestiona tus preferencias y configuración de cuenta"
			/>

			{message && (
				<Alert
					type={messageType}
					message={message}
					onClose={() => setMessage('')}
					className="mb-6"
				/>
			)}

			<div className="bg-white rounded-lg shadow">
				{/* Tabs */}
				<div className="flex border-b">
					<button
						onClick={() => setActiveTab('general')}
						className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
							activeTab === 'general'
								? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
								: 'text-gray-600 hover:text-gray-800'
						}`}
					>
						<Bell className="inline mr-2" size={18} />
						General
					</button>
					<button
						onClick={() => setActiveTab('security')}
						className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
							activeTab === 'security'
								? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
								: 'text-gray-600 hover:text-gray-800'
						}`}
					>
						<Lock className="inline mr-2" size={18} />
						Seguridad
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					{/* Tab: Configuración General */}
					{activeTab === 'general' && (
						<div className="space-y-6 max-w-2xl">
							<div>
								<h3 className="text-lg font-semibold mb-4">Notificaciones</h3>
								<div className="space-y-4">
									<label className="flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={generalSettings.emailNotifications}
											onChange={() => handleGeneralChange('emailNotifications')}
											className="w-4 h-4 text-blue-600 rounded"
										/>
										<span className="ml-3">
											<span className="block font-medium text-gray-900">
												Notificaciones por Email
											</span>
											<span className="block text-sm text-gray-500">
												Recibe notificaciones importantes vía correo electrónico
											</span>
										</span>
									</label>

									<label className="flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={generalSettings.pushNotifications}
											onChange={() => handleGeneralChange('pushNotifications')}
											className="w-4 h-4 text-blue-600 rounded"
										/>
										<span className="ml-3">
											<span className="block font-medium text-gray-900">
												Notificaciones Push
											</span>
											<span className="block text-sm text-gray-500">
												Recibe notificaciones en tiempo real del navegador
											</span>
										</span>
									</label>

									<label className="flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={generalSettings.surveyReminders}
											onChange={() => handleGeneralChange('surveyReminders')}
											className="w-4 h-4 text-blue-600 rounded"
										/>
										<span className="ml-3">
											<span className="block font-medium text-gray-900">
												Recordatorios de Encuestas
											</span>
											<span className="block text-sm text-gray-500">
												Recibe recordatorios para completar encuestas pendientes
											</span>
										</span>
									</label>

									<label className="flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={generalSettings.marketingEmails}
											onChange={() => handleGeneralChange('marketingEmails')}
											className="w-4 h-4 text-blue-600 rounded"
										/>
										<span className="ml-3">
											<span className="block font-medium text-gray-900">
												Emails de Marketing
											</span>
											<span className="block text-sm text-gray-500">
												Recibe información sobre nuevas funcionalidades y ofertas
											</span>
										</span>
									</label>
								</div>
								<p className="mt-3 text-xs text-gray-400">
									Estas preferencias se guardan solo en este navegador.
								</p>
							</div>

							<div className="border-t pt-6">
								<h3 className="text-lg font-semibold mb-1">Información de Cuenta</h3>
								<p className="text-sm text-gray-500 mb-4">
									Puedes editar tu usuario y correo. Por seguridad, necesitas confirmar
									tu contraseña actual para guardar los cambios — sin importar tu rol
									({formatRole(user?.role)}).
								</p>

								<form
									onSubmit={handleProfileFormSubmit(onProfileSubmit)}
									className="bg-gray-50 p-4 rounded-lg space-y-4"
								>
									<Input
										label="Nombre de usuario"
										name="username"
										type="text"
										value={profileValues.username}
										onChange={handleProfileChange}
										onBlur={handleProfileBlur}
										error={profileErrors.username}
										touched={profileTouched.username}
										icon={<UserIcon size={18} className="text-gray-400" />}
										required
									/>

									<Input
										label="Email"
										name="email"
										type="email"
										value={profileValues.email}
										onChange={handleProfileChange}
										onBlur={handleProfileBlur}
										error={profileErrors.email}
										touched={profileTouched.email}
										icon={<Lock size={18} className="text-gray-400" />}
										required
									/>

									<div className="relative">
										<Input
											label="Contraseña Actual (para confirmar los cambios)"
											type={showPasswords.profileCurrent ? 'text' : 'password'}
											name="currentPassword"
											value={profileValues.currentPassword}
											onChange={handleProfileChange}
											onBlur={handleProfileBlur}
											error={profileErrors.currentPassword}
											touched={profileTouched.currentPassword}
											placeholder="Ingresa tu contraseña actual"
											icon={<Lock size={18} className="text-gray-400" />}
											required
										/>
										<button
											type="button"
											onClick={() =>
												setShowPasswords(prev => ({
													...prev,
													profileCurrent: !prev.profileCurrent
												}))
											}
											className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
										>
											{showPasswords.profileCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</div>

									<div className="flex justify-end pt-2">
										<Button type="submit" loading={profileSubmitting}>
											<Save className="inline mr-2" size={18} />
											Guardar Cambios
										</Button>
									</div>
								</form>

								<div className="mt-3 text-sm text-gray-500">
									Rol: <span className="font-medium text-gray-700 capitalize">{formatRole(user?.role)}</span>
									{' '}(solo un administrador puede cambiar tu rol)
								</div>
							</div>
						</div>
					)}

					{/* Tab: Seguridad */}
					{activeTab === 'security' && (
						<div className="max-w-2xl">
							<div>
								<h3 className="text-lg font-semibold mb-6">Cambiar Contraseña</h3>
								<form onSubmit={handlePasswordFormSubmit(onPasswordSubmit)} className="space-y-4">
									<div className="relative">
										<Input
											label="Contraseña Actual"
											type={showPasswords.current ? 'text' : 'password'}
											name="currentPassword"
											value={passwordValues.currentPassword}
											onChange={handlePasswordFormChange}
											onBlur={handlePasswordBlur}
											error={passwordErrors.currentPassword}
											touched={passwordTouched.currentPassword}
											placeholder="Ingresa tu contraseña actual"
										/>
										<button
											type="button"
											onClick={() =>
												setShowPasswords(prev => ({
													...prev,
													current: !prev.current
												}))
											}
											className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
										>
											{showPasswords.current ? (
												<EyeOff size={18} />
											) : (
												<Eye size={18} />
											)}
										</button>
									</div>

									<div className="relative">
										<Input
											label="Nueva Contraseña"
											type={showPasswords.new ? 'text' : 'password'}
											name="newPassword"
											value={passwordValues.newPassword}
											onChange={handlePasswordFormChange}
											onBlur={handlePasswordBlur}
											error={passwordErrors.newPassword}
											touched={passwordTouched.newPassword}
											placeholder="Ingresa tu nueva contraseña"
											className="mb-1"
										/>
										<button
											type="button"
											onClick={() =>
												setShowPasswords(prev => ({
													...prev,
													new: !prev.new
												}))
											}
											className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
										>
											{showPasswords.new ? (
												<EyeOff size={18} />
											) : (
												<Eye size={18} />
											)}
										</button>
										<PasswordStrengthMeter password={passwordValues.newPassword} />
									</div>

									<div className="relative">
										<Input
											label="Confirmar Nueva Contraseña"
											type={showPasswords.confirm ? 'text' : 'password'}
											name="confirmPassword"
											value={passwordValues.confirmPassword}
											onChange={handlePasswordFormChange}
											onBlur={handlePasswordBlur}
											error={passwordErrors.confirmPassword}
											touched={passwordTouched.confirmPassword}
											placeholder="Confirma tu nueva contraseña"
										/>
										<button
											type="button"
											onClick={() =>
												setShowPasswords(prev => ({
													...prev,
													confirm: !prev.confirm
												}))
											}
											className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
										>
											{showPasswords.confirm ? (
												<EyeOff size={18} />
											) : (
												<Eye size={18} />
											)}
										</button>
									</div>

									<div className="flex justify-end pt-4">
										<Button type="submit" loading={passwordSubmitting}>
											<Save className="inline mr-2" size={18} />
											Cambiar Contraseña
										</Button>
									</div>
								</form>
							</div>

							<div className="mt-8 pt-8 border-t">
								<h3 className="text-lg font-semibold mb-4">Sesiones Activas</h3>
								<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
									<p className="text-sm text-blue-800">
										Actualmente tienes una sesión activa. Tu sesión permanecerá activa hasta que cierres sesión o tu token expire.
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Settings;
