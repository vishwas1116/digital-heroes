import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    charityId: "",
    charityContributionPercent: 10,
    plan: "monthly",
  });

  const [charities, setCharities] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isProcessingPayment) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isProcessingPayment, navigate]);

  useEffect(() => {
    // Fetch charities for selection
    api
      .get("/charities")
      .then((res) => {
        const data = res.data.charities || res.data.data || res.data || [];
        setCharities(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Fallback demo charities if API not ready
        setCharities([
          { _id: "demo1", name: "Green Earth Foundation" },
          { _id: "demo2", name: "Kids Education Trust" },
          { _id: "demo3", name: "Cancer Care India" },
          { _id: "demo4", name: "Sports for All" },
        ]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required");
    if (!form.email.trim()) return setError("Email is required");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    if (form.charityContributionPercent < 10) {
      return setError("Minimum charity contribution is 10%");
    }

    setLoading(true);
    setIsProcessingPayment(true);

    try {
      // 1. Create account first
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        charityId: form.charityId || undefined,
        charityContributionPercent: Number(form.charityContributionPercent),
        plan: form.plan,
      });

      // 2. Create Razorpay order
      const { data } = await api.post("/subscriptions/create-order", {
        plan: form.plan,
      });

      // 3. If backend is in demo mode
      if (data.mode === "demo" || data.demoActivate) {
        const ok = window.confirm(
          `Razorpay keys not configured.\n\nActivate ${form.plan} in DEMO mode?`,
        );

        if (!ok) {
          setLoading(false);
          return;
        }

        await api.post("/subscriptions/activate-demo", {
          plan: form.plan,
        });

        setSuccess(true);

        setIsProcessingPayment(false);
        setSuccess(true);

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);

      // 4. Load Razorpay
      const scriptOk = await loadRazorpayScript();

      if (!scriptOk) {
        throw new Error(
          "Could not load Razorpay. Check your internet connection.",
        );
      }

      // 5. Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",

        name: "Digital Heroes",

        description:
          data.planLabel ||
          (form.plan === "yearly"
            ? "Digital Heroes Yearly Plan"
            : "Digital Heroes Monthly Plan"),

        order_id: data.orderId,

        prefill: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
        },

        theme: {
          color: "#1a5c4a",
        },

        handler: async function (response) {
          try {
            // 6. Verify payment on backend
            await api.post("/subscriptions/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: form.plan,
            });

            setSuccess(true);

            setTimeout(() => {
              navigate("/dashboard");
            }, 1200);
          } catch (err) {
            setError(
              err.response?.data?.message || "Payment verification failed",
            );
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function () {
        setIsProcessingPayment(false);
        setError("Payment failed or cancelled. Please try again.");
      });

      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration/payment failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-[#f8f6f1]">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] tracking-tight">
              Create your account
            </h1>
            <p className="mt-3 text-[#5a5a5a]">
              Join the community that turns performance into impact.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            {success ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-14 h-14 text-[#1a5c4a] mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Welcome aboard!</h2>
                <p className="text-[#5a5a5a]">
                  Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] transition pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#1a1a1a]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Choose a Charity
                  </label>
                  <select
                    name="charityId"
                    value={form.charityId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] transition"
                  >
                    <option value="">
                      Select a charity (optional for now)
                    </option>
                    {charities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Charity Contribution:{" "}
                    <span className="text-[#1a5c4a] font-semibold">
                      {form.charityContributionPercent}%
                    </span>
                  </label>
                  <input
                    type="range"
                    name="charityContributionPercent"
                    min="10"
                    max="50"
                    step="5"
                    value={form.charityContributionPercent}
                    onChange={handleChange}
                    className="w-full accent-[#1a5c4a]"
                  />
                  <p className="text-xs text-[#8a8a8a] mt-1">
                    Minimum 10%. You can increase it anytime.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                    Subscription Plan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, plan: "monthly" }))
                      }
                      className={`py-3 rounded-xl border text-sm font-medium transition ${
                        form.plan === "monthly"
                          ? "border-[#1a5c4a] bg-[#1a5c4a]/5 text-[#1a5c4a]"
                          : "border-black/10 text-[#5a5a5a] hover:border-black/20"
                      }`}
                    >
                      Monthly
                      <br />
                      <span className="text-xs opacity-70">₹999/mo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, plan: "yearly" }))}
                      className={`py-3 rounded-xl border text-sm font-medium transition ${
                        form.plan === "yearly"
                          ? "border-[#1a5c4a] bg-[#1a5c4a]/5 text-[#1a5c4a]"
                          : "border-black/10 text-[#5a5a5a] hover:border-black/20"
                      }`}
                    >
                      Yearly
                      <br />
                      <span className="text-xs opacity-70">₹9,999/yr</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3.5 text-base mt-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center mt-8 text-sm text-[#5a5a5a]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#1a5c4a] font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
