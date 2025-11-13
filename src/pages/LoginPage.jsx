import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ShaderBackground from "../components/ShaderBackground";

function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      setError("Lütfen tüm alanları doldurun");
      setIsLoading(false);
      return;
    }

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (
      !registerData.username ||
      !registerData.email ||
      !registerData.password
    ) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      setIsLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setIsLoading(false);
      return;
    }

    const result = await register(registerData);

    if (result.success) {
      // Admin onayı sistemi - kullanıcıyı login sayfasına yönlendir
      setShowRegister(false);
      setError("");
      // Başarı mesajını göster
      alert(
        result.message || "Kayıt başarılı! Hesabınız admin onayı bekliyor.",
      );
      // Form verilerini temizle
      setRegisterData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
      });
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterInputChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  // Arkaplan pattern (geçici olarak kaldırıldı; derleme stabilitesini doğrulamak için)

  // Form render yardımcıları
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Giriş Yap</h2>
        <p className="text-gray-400 mt-2">Hesabına giriş yaparak devam et</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Kullanıcı Adı
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Kullanıcı adınızı girin"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Şifre
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Şifrenizi girin"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowRegister(true)}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          Hesabın yok mu? Kayıt ol
        </button>
      </div>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Kayıt Ol</h2>
        <p className="text-gray-400 mt-2">Yeni hesap oluştur</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Ad
          </label>
          <input
            type="text"
            name="firstName"
            value={registerData.firstName}
            onChange={handleRegisterInputChange}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Adınız"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Soyad
          </label>
          <input
            type="text"
            name="lastName"
            value={registerData.lastName}
            onChange={handleRegisterInputChange}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Soyadınız"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Kullanıcı Adı *
        </label>
        <input
          type="text"
          name="username"
          value={registerData.username}
          onChange={handleRegisterInputChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Kullanıcı adınız"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={registerData.email}
          onChange={handleRegisterInputChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Email adresiniz"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Şifre *
        </label>
        <input
          type="password"
          name="password"
          value={registerData.password}
          onChange={handleRegisterInputChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Şifreniz (min. 6 karakter)"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Şifre Tekrar *
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={registerData.confirmPassword}
          onChange={handleRegisterInputChange}
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Şifrenizi tekrar girin"
          disabled={isLoading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowRegister(false)}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          Zaten hesabın var mı? Giriş yap
        </button>
      </div>
    </form>
  );

  return (
    <div
      id="login-page"
      data-registry="7.0"
      className="relative min-h-screen overflow-hidden"
    >
      <ShaderBackground />
      {/* Eski gradient/dalga arka plan kaldırıldı; ShaderBackground aktif */}

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            {showRegister ? renderRegisterForm() : renderLoginForm()}
          </div>
        </div>
      </div>
      {/* Outer wrapper close */}
    </div>
  );
}

export default LoginPage;
