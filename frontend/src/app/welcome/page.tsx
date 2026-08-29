"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ChevronRight,
  User,
  Phone,
  Home,
  X
} from "lucide-react";
import { getApiUrl } from "@/data/api";

export default function WelcomePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<"owner" | "user" | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("hi");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  const translations = {
    en: {
      selectRole: "Choose Your Account Type",
      subtitle: "Select how you would like to access RoomsWallah",
      ownerTitle: "Are you Owner?",
      ownerDesc: "List rooms/PGs & manage bookings",
      tenantTitle: "Are you Tenant / Student?",
      tenantDesc: "Find verified rentals & save listings",
      tenantLogin: "Tenant Login",
      tenantSignup: "Tenant Sign Up",
      ownerLoginTab: "Owner Login",
      ownerSignupTab: "Owner Sign Up",
      fullName: "Full name",
      email: "Email address",
      phone: "Phone number",
      password: "Password",
      btnTenantLogin: "Login as Tenant",
      btnTenantSignup: "Register & Login",
      btnOwnerLogin: "Login as Owner",
      btnOwnerSignup: "Sign Up",
      rememberMe: "Remember Me",
      forgotPass: "Forgot Password?",
      continuePhone: "Continue with phone",
      continueGoogle: "Continue with Google",
      or: "or",
      loginPhonePass: "Login with Phone / Password",
      backOptions: "← Back to options",
      footerSafe: "All your personal details are safe with us.",
      footerAccept: "If you continue, you are accepting RoomsWallah Terms & Conditions and Privacy Policy"
    },
    hi: {
      selectRole: "खाता प्रकार चुनें",
      subtitle: "चुनें कि आप RoomsWallah का उपयोग कैसे करना चाहते हैं",
      ownerTitle: "क्या आप मकान मालिक हैं?",
      ownerDesc: "कमरे/पीजी लिस्ट करें और बुकिंग मैनेज करें",
      tenantTitle: "क्या आप किराएदार / छात्र हैं?",
      tenantDesc: "सत्यापित कमरे खोजें और पसंदीदा में सहेजें",
      tenantLogin: "किराएदार लॉगिन",
      tenantSignup: "किराएदार पंजीकरण",
      ownerLoginTab: "मालिक लॉगिन",
      ownerSignupTab: "मालिक पंजीकरण",
      fullName: "पूरा नाम",
      email: "ईमेल पता",
      phone: "फ़ोन नंबर",
      password: "पासवर्ड",
      btnTenantLogin: "किराएदार के रूप में लॉगिन करें",
      btnTenantSignup: "पंजीकरण और लॉगिन",
      btnOwnerLogin: "मालिक के रूप में लॉगिन करें",
      btnOwnerSignup: "पंजीकरण करें",
      rememberMe: "मुझे याद रखें",
      forgotPass: "पासवर्ड भूल गए?",
      continuePhone: "फ़ोन के साथ आगे बढ़ें",
      continueGoogle: "गूगल के साथ आगे बढ़ें",
      or: "या",
      loginPhonePass: "फ़ोन / पासवर्ड से लॉगिन करें",
      backOptions: "← विकल्पों पर वापस जाएं",
      footerSafe: "आपके सभी व्यक्तिगत विवरण हमारे पास सुरक्षित हैं।",
      footerAccept: "यदि आप जारी रखते हैं, तो आप RoomsWallah के नियम और शर्तें तथा गोपनीयता नीति स्वीकार कर रहे हैं"
    }
  };

  const t = translations[lang];

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear legacy dummy mock keys permanently from browser local storage
      localStorage.removeItem("roomswallah_properties");
      localStorage.removeItem("roomswallah_reports");
      localStorage.removeItem("roomswallah_messages");
      localStorage.removeItem("roomswallah_owners");
      localStorage.removeItem("roomswallah_advertisements");

      // Capture Google login redirect queries
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("token");
      if (urlToken) {
        localStorage.setItem("owner_token", urlToken);
        localStorage.setItem("owner_logged_in", "true");
        
        const urlName = urlParams.get("owner_name");
        if (urlName) localStorage.setItem("owner_name", decodeURIComponent(urlName));
        
        const urlEmail = urlParams.get("owner_email");
        if (urlEmail) localStorage.setItem("owner_email", decodeURIComponent(urlEmail));
        
        const urlPhone = urlParams.get("owner_phone");
        if (urlPhone) {
          localStorage.setItem("owner_phone", decodeURIComponent(urlPhone));
          localStorage.setItem("owner_whatsapp", decodeURIComponent(urlPhone));
        }

        // Clean query parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        router.push("/welcome/dashboard");
        return;
      }

      if (localStorage.getItem("owner_logged_in") === "true") {
        router.push("/welcome/dashboard");
        return;
      }
      if (localStorage.getItem("user_logged_in") === "true") {
        router.push("/welcome/user-dashboard");
        return;
      }
      const savedPhone = localStorage.getItem("roomswallah_remembered_phone") || "";
      const savedPassword = localStorage.getItem("roomswallah_remembered_password") || "";
      if (savedPhone && savedPassword) {
        setPhone(savedPhone);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, [router]);

  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userRole === "user") {
      try {
        if (activeTab === "login") {
          // tenant login
          const users = JSON.parse(localStorage.getItem("roomswallah_users") || "[]");
          const found = users.find((u: any) => u.phone === phone);
          if (found && found.password === password) {
            localStorage.setItem("user_logged_in", "true");
            localStorage.setItem("user_name", found.name);
            localStorage.setItem("user_phone", found.phone);
            localStorage.setItem("user_email", found.email || "");
            localStorage.setItem("user_avatar", found.avatar || "🦊");
            
            alert(`Welcome back, ${found.name}! Login Successful!`);
            router.push("/welcome/user-dashboard");
          } else {
            alert("Login Failed: Invalid phone number or password.");
          }
        } else {
          // tenant signup
          if (!name || !phone || !email || !password) {
            alert("Please fill in all details.");
            return;
          }
          const users = JSON.parse(localStorage.getItem("roomswallah_users") || "[]");
          const exists = users.some((u: any) => u.phone === phone);
          if (exists) {
            alert("A user with this phone number already exists.");
            return;
          }

          const cuteAvatars = ["🦁", "🐼", "🦊", "🐨", "🐱", "🐻", "🐯", "🐶", "🐰"];
          const userAvatar = cuteAvatars[Math.floor(Math.random() * cuteAvatars.length)];

          const newUser = {
            name,
            phone,
            email,
            password,
            avatar: userAvatar
          };
          users.push(newUser);
          localStorage.setItem("roomswallah_users", JSON.stringify(users));

          // Log in automatically
          localStorage.setItem("user_logged_in", "true");
          localStorage.setItem("user_name", name);
          localStorage.setItem("user_phone", phone);
          localStorage.setItem("user_email", email);
          localStorage.setItem("user_avatar", userAvatar);

          alert("Sign Up Successful! Redirecting to dashboard...");
          router.push("/welcome/user-dashboard");
        }
      } catch (err) {
        console.error("User auth failed:", err);
      }
      return;
    }

    try {
      if (activeTab === "login") {
        const res = await fetch(getApiUrl("/api/auth/login"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ mobile: phone, password })
        });
        
        const data = await res.json();
        if (res.ok) {
          if (typeof window !== "undefined") {
            localStorage.setItem("owner_logged_in", "true");
            if (data.token) {
              localStorage.setItem("owner_token", data.token);
            }
            localStorage.setItem("owner_name", data.owner.fullName);
            localStorage.setItem("owner_email", data.owner.email || "");
            if (data.owner.mobile) {
              localStorage.setItem("owner_phone", data.owner.mobile);
              localStorage.setItem("owner_whatsapp", data.owner.mobile);
            }

            // Remember Me persistence
            if (rememberMe) {
              localStorage.setItem("roomswallah_remembered_phone", phone);
              localStorage.setItem("roomswallah_remembered_password", password);
            } else {
              localStorage.removeItem("roomswallah_remembered_phone");
              localStorage.removeItem("roomswallah_remembered_password");
            }
          }
          alert("Login Successful! Redirecting to dashboard...");
          router.push("/welcome/dashboard");
        } else {
          alert(`Login Failed: ${data.message || "Invalid credentials"}`);
        }
      } else {
        // Signup
        const res = await fetch(getApiUrl("/api/auth/register"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fullName: name,
            mobile: phone,
            password,
            confirmPassword: password
          })
        });
        
        const data = await res.json();
        if (res.ok) {
          if (typeof window !== "undefined") {
            localStorage.setItem("owner_logged_in", "true");
            if (data.token) {
              localStorage.setItem("owner_token", data.token);
            }
            localStorage.setItem("owner_name", data.owner.fullName);
            localStorage.setItem("owner_email", data.owner.email || "");
            if (data.owner.mobile) {
              localStorage.setItem("owner_phone", data.owner.mobile);
              localStorage.setItem("owner_whatsapp", data.owner.mobile);
            }
          }
          alert("Sign Up Successful! Redirecting to dashboard...");
          router.push("/welcome/dashboard");
        } else {
          let errMsg = data.message || "Registration failed";
          if (data.errors) {
            const errKeys = Object.keys(data.errors).filter(k => k !== "_errors");
            if (errKeys.length > 0) {
              const key = errKeys[0];
              if (data.errors[key]?._errors) {
                errMsg = `${key}: ${data.errors[key]._errors[0]}`;
              }
            }
          }
          alert(`Sign Up Failed: ${errMsg}`);
        }
      }
    } catch (err) {
      console.error("Form submission failed:", err);
      alert("Network error. Please make sure the backend server is running.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
      
      {/* OLX Styled Login Modal Container Card */}
      <div className="max-w-[430px] w-full bg-white rounded-[16px] border border-slate-200/80 shadow-xl p-6 relative flex flex-col justify-between min-h-[580px] transition-all">
        
        {/* Back Arrow Button (Top Left) */}
        {userRole !== null && (
          <button 
            onClick={() => {
              setUserRole(null);
              setShowPhoneForm(false);
            }}
            className="absolute top-4 left-4 w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer z-20 animate-fade-in"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[1.8]" />
          </button>
        )}

        {/* Small Language Selector switch */}
        <div className={`absolute top-4 flex items-center space-x-1 bg-[#F8FAFC] border border-[#ECECEC] rounded-full p-0.5 z-20 transition-all duration-300 ${
          userRole !== null ? "left-14" : "left-4"
        }`}>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full transition-all cursor-pointer select-none ${
              lang === "en" ? "bg-[#6C4CF1] text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang("hi")}
            className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full transition-all cursor-pointer select-none ${
              lang === "hi" ? "bg-[#6C4CF1] text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* Absolute Close X Button (Top Right) */}
        <button 
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer z-20"
        >
          <X className="w-5.5 h-5.5 stroke-[1.8]" />
        </button>

        {/* Top & Form Segment wrapper */}
        <div>
          {/* Logo container (Purple circular home icon) */}
          <div className="w-full flex justify-center py-6 select-none mt-2">
            <div className="w-16 h-16 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-[#8B5CF6]/20">
              <Home className="w-8 h-8 text-white stroke-[2.2]" />
            </div>
          </div>

          {userRole === null ? (
            /* Role Selection Mode */
            <div className="space-y-6 mt-6 font-poppins text-center animate-fade-in">
              <div>
                <h2 className="font-extrabold text-lg text-[#1E2235] tracking-tight">
                  {t.selectRole}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                  {t.subtitle}
                </p>
              </div>

              <div className="space-y-4">
                {/* Option 1: Owner */}
                <button
                  onClick={() => setUserRole("owner")}
                  className="w-full bg-white hover:bg-violet-50/40 border border-[#ECECEC] hover:border-violet-500/50 p-5 rounded-[24px] flex items-center text-left transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center text-violet-600 mr-4 shrink-0 transition-colors">
                    <Home className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h4 className="text-sm font-bold text-[#1E2235] tracking-tight">
                      {t.ownerTitle}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {t.ownerDesc}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-600 ml-2 shrink-0 transition-colors" />
                </button>

                {/* Option 2: User (Tenant) */}
                <button
                  onClick={() => setUserRole("user")}
                  className="w-full bg-white hover:bg-rose-50/40 border border-[#ECECEC] hover:border-rose-500/50 p-5 rounded-[24px] flex items-center text-left transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center text-rose-500 mr-4 shrink-0 transition-colors">
                    <User className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h4 className="text-sm font-bold text-[#1E2235] tracking-tight">
                      {t.tenantTitle}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {t.tenantDesc}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-rose-500 ml-2 shrink-0 transition-colors" />
                </button>
              </div>
            </div>
          ) : userRole === "user" ? (
            /* User (Tenant) Direct Form Mode */
            <div className="mt-5 transition-all duration-200">
              
              {/* Form Tab selectors */}
              <div className="flex border-b border-[#F0F2F5] pb-0.5 font-poppins">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 text-center font-extrabold text-[13.5px] pb-2 transition-colors cursor-pointer ${
                    activeTab === "login" 
                      ? "text-[#6C4CF1] border-b-2 border-[#6C4CF1]" 
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {t.tenantLogin}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className={`flex-1 text-center font-extrabold text-[13.5px] pb-2 transition-colors cursor-pointer ${
                    activeTab === "signup" 
                      ? "text-[#6C4CF1] border-b-2 border-[#6C4CF1]" 
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {t.tenantSignup}
                </button>
              </div>

              {/* Inputs Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-left mt-4 font-poppins">
                {activeTab === "signup" && (
                  <>
                    {/* Full Name */}
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <input
                        type="text"
                        required
                        placeholder={t.fullName}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#ECECEC] text-[#1E2235] pl-10 pr-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#6C4CF1] focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <input
                        type="email"
                        required
                        placeholder={t.email}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#ECECEC] text-[#1E2235] pl-10 pr-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#6C4CF1] focus:bg-white transition-colors"
                      />
                    </div>
                  </>
                )}

                {/* Phone Number */}
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="tel"
                    required
                    placeholder={t.phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#ECECEC] text-[#1E2235] pl-10 pr-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#6C4CF1] focus:bg-white transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={t.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#ECECEC] text-[#1E2235] pl-10 pr-10 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#6C4CF1] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#6C4CF1] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Remember Me and Forgot Password row (Login only) */}
                {activeTab === "login" && (
                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#ECECEC] text-[#6C4CF1] focus:ring-[#6C4CF1]/20 cursor-pointer"
                      />
                      <span>{t.rememberMe}</span>
                    </label>
                    
                    <Link href="#" className="text-[11px] font-black text-[#6C4CF1] hover:underline">
                      {t.forgotPass}
                    </Link>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-[#6C4CF1] hover:bg-[#5B3FE6] text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md shadow-[#6C4CF1]/10 cursor-pointer text-center mt-3"
                >
                  {activeTab === "login" ? t.btnTenantLogin : t.btnTenantSignup}
                </button>
              </form>
            </div>
          ) : !showPhoneForm ? (
            /* Option A: Initial Social/Option buttons view (Owner Mode) */
            <div className="mt-8 transition-all duration-200">
              {/* Continue with Phone button */}
              <button 
                onClick={() => setShowPhoneForm(true)}
                className="w-full bg-white hover:bg-slate-50 border-2 border-[#002f34] text-[#002f34] font-black h-12 rounded-lg flex items-center justify-start px-4.5 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <Phone className="w-5 h-5 mr-3 shrink-0 text-[#002f34] stroke-[2]" />
                <span className="flex-grow text-center pr-8 text-[14.5px] font-black">{t.continuePhone}</span>
              </button>

              {/* Google Button */}
              <button 
                onClick={() => {
                  window.location.href = getApiUrl("/api/auth/google/redirect");
                }}
                className="w-full bg-white border border-[#ECECEC] hover:bg-slate-50/50 text-slate-700 font-bold h-12 rounded-lg flex items-center justify-start px-4 transition-all duration-200 cursor-pointer active:scale-[0.99] mt-3"
              >
                <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 14.97 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.86 3C6.01 7.75 8.78 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.45 12.3c0-.82-.07-1.6-.21-2.3H12v4.35h6.43c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.7-4.92 3.7-8.5z" />
                  <path fill="#FBBC05" d="M5.1 10.72c-.24-.72-.38-1.48-.38-2.28s.14-1.56.38-2.28L1.24 3.16C.45 4.74 0 6.51 0 8.44s.45 3.7 1.24 5.28l3.86-3z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.93 1.1-3.22 0-5.99-2.71-6.9-5.68l-3.86 3C3.2 20.27 7.24 23 12 23z" />
                </svg>
                <span className="flex-grow text-center pr-8 text-[14.5px]">{t.continueGoogle}</span>
              </button>

              {/* OR separator */}
              <div className="text-center font-black text-slate-800 text-[11px] uppercase mt-5.5 tracking-wider select-none">
                {t.or}
              </div>

              {/* Login with Email alternative */}
              <button 
                onClick={() => setShowPhoneForm(true)}
                className="w-full text-center font-black text-[#002f34] text-[14.5px] hover:underline underline-offset-4 mt-5.5 cursor-pointer"
              >
                {t.loginPhonePass}
              </button>
            </div>
          ) : (
            /* Option B: Active Phone Login / Sign Up Form View (Owner Mode) */
            <div className="mt-5 transition-all duration-200">
              
              {/* Form Tab selectors */}
              <div className="flex border-b border-[#F0F2F5] pb-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 text-center font-extrabold text-[13.5px] pb-2 transition-colors cursor-pointer ${
                    activeTab === "login" 
                      ? "text-[#002f34] border-b-2 border-[#002f34]" 
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {t.ownerLoginTab}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className={`flex-1 text-center font-extrabold text-[13.5px] pb-2 transition-colors cursor-pointer ${
                    activeTab === "signup" 
                      ? "text-[#002f34] border-b-2 border-[#002f34]" 
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {t.ownerSignupTab}
                </button>
              </div>

              {/* Inputs Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-left mt-4">
                {activeTab === "signup" && (
                  /* Full Name (Sign Up only) */
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      required
                      placeholder={t.fullName}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#ECECEC] text-[#1E2235] pl-10 pr-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#002f34] focus:bg-white transition-colors"
                    />
                  </div>
                )}

                {/* Phone Number (Both login & signup) */}
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="tel"
                    required
                    placeholder={t.phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#ECECEC] text-[#1E2235] pl-10 pr-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#002f34] focus:bg-white transition-colors"
                  />
                </div>

                {/* Password (Both login & signup) */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={t.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#ECECEC] text-[#1E2235] pl-10 pr-10 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-[#002f34] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#002f34] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Remember Me and Forgot Password row (Login only) */}
                {activeTab === "login" && (
                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#ECECEC] text-[#002f34] focus:ring-[#002f34]/20 cursor-pointer"
                      />
                      <span>{t.rememberMe}</span>
                    </label>
                    
                    <Link href="#" className="text-[11px] font-black text-[#002f34] hover:underline">
                      {t.forgotPass}
                    </Link>
                  </div>
                )}

                {/* Submit button (Styled with OLX Signature color) */}
                <button
                  type="submit"
                  className="w-full bg-[#002f34] hover:bg-[#001D20] text-white font-extrabold py-3.5 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md cursor-pointer text-center"
                >
                  {activeTab === "login" ? t.btnOwnerLogin : t.btnOwnerSignup}
                </button>

                {/* Back Link Option */}
                <button 
                  type="button"
                  onClick={() => setShowPhoneForm(false)}
                  className="w-full text-center font-bold text-slate-500 text-[11px] hover:underline mt-4.5 cursor-pointer block"
                >
                  {t.backOptions}
                </button>
              </form>

            </div>
          )}
        </div>

        {/* Bottom Footer block */}
        <div className="mt-8 text-center space-y-4.5 select-none font-poppins">
          <span className="text-[11px] text-slate-400 font-bold block">
            {t.footerSafe}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block leading-normal px-4">
            {lang === "en" ? (
              <>
                If you continue, you are accepting RoomsWallah{" "}
                <Link href="/terms" className="text-blue-500 hover:underline">Terms and Conditions</Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>
              </>
            ) : (
              <>
                यदि आप जारी रखते हैं, तो आप RoomsWallah के{" "}
                <Link href="/terms" className="text-blue-500 hover:underline">नियम और शर्तें</Link>{" "}
                तथा{" "}
                <Link href="/privacy-policy" className="text-blue-500 hover:underline">गोपनीयता नीति</Link>{" "}
                स्वीकार कर रहे हैं
              </>
            )}
          </span>
        </div>

      </div>
    </div>
  );
}
