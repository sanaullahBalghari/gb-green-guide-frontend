import { Eye, EyeOff, Lock, Mail, Mountain, Phone, User } from "lucide-react";
import { useState } from "react";
import apiServer from "../../utils/apiServer.js";
import API_ROUTES from "../../apiRoutes.js";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ClipLoader from "react-spinners/ClipLoader";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
const Signup = () => {
    const navigate = useNavigate();
      const {setUser} = useAuth(); 
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        userType: 'tourist',
        agreeTerms: false,
        shopName: '',
        address: ''
    });

const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    toast.error("Password is not match");
    return;
  }
  setLoading(true);

  const payload = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    username: formData.username,
    email: formData.email,
    phone: formData.phone,
    password: formData.password,
    confirm_password: formData.confirmPassword,
    role: formData.userType === "business" ? "business_owner" : "tourist",
  };

  if (formData.userType === "business") {
    payload.shop_name = formData.shopName;
    payload.address = formData.address;
  }

  try {
    // ✅ correct apiServer usage: (method, api, payload)
    const res = await apiServer("post", API_ROUTES.REGISTER, payload, {
      tokenRequired: false,
      showNotification: true,
    });

    // ✅ response se user & token extract karo (backend jis format me bhej raha)
    const { user, access } = res;

    // ✅ localStorage save
    localStorage.setItem(
      "userData",
      JSON.stringify({ user, token: access })
    );

    // ✅ context update
    setUser(user);

    // ✅ console print
    console.log("User saved after register =>", user);

    toast.success("Registration successful!");
    navigate("/login");
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    toast.error("Something went wrong during registration");
  }
  setLoading(false);
};


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (formData.password !== formData.confirmPassword) {
//             toast.error( "Password is not match");
//             return;
//         }
//         setLoading(true);

//         const payload = {
//             first_name: formData.firstName,
//             last_name: formData.lastName,
//             username: formData.username,
//             email: formData.email,
//             phone: formData.phone,
//             password: formData.password,
//             confirm_password: formData.confirmPassword,
//             role: formData.userType === "business" ? "business_owner" : "tourist",
//         };

//         if (formData.userType === "business") {
//             payload.shop_name = formData.shopName;
//             payload.address = formData.address;
//         }

//         try {
//             const res = await apiServer(API_ROUTES.REGISTER, "POST", payload);
           
//            // 👇 yahan login jaisa save karo
//    localStorage.setItem("user", JSON.stringify(res.data.data));
// setUser(res.data.data);

//  console.log("User saved after register =>", res.data.user);
//              toast.success("Registration successful!");
//             navigate('/login');
//         } catch (error) {
//             console.error("Registration error:", error.response?.data || error.message);
//           toast.success("Something went wrong during registration");
//         }
//            setLoading(false);
//     };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -translate-y-16 -translate-x-16 opacity-50"></div>

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-xl w-fit mx-auto mb-4">
                            <Mountain className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Join GB Green Guide</h2>
                        <p className="text-gray-600">Start your journey in Gilgit-Baltistan</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="First name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="Last name"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                placeholder="Your username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="+92 300 1234567"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                            <select
                                value={formData.userType}
                                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            >
                                <option value="tourist">Tourist</option>
                                <option value="business">Business Owner</option>
                            </select>
                        </div>

                        {formData.userType === "business" && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                                    <input
                                        type="text"
                                        value={formData.shopName}
                                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="Your shop name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="Business location"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="Create password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                    

                          <button
    type="submit"
    disabled={loading}
    className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
      loading
        ? "opacity-70 cursor-not-allowed"
        : "hover:shadow-lg transform hover:scale-[1.02]"
    }`}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <ClipLoader size={20} color="#fff" />
        
      </span>
    ) : (
      "Sign up"
    )}
  </button>
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        Already have an account?{' '}
<Link 
  to="/login" 
  className="text-emerald-600 hover:text-emerald-700 font-semibold"
>
  Login
</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
