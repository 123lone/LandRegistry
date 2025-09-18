import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from 'lucide-react';

const roles = [
    { value: "Owner", label: "Land Owner" },
    { value: "Buyer", label: "Buyer" },
    { value: "Verifier", label: "Land Inspector / Verifier"}
];

export default function SignUpPage() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", password: "" });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // This function is now corrected
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("✅ Registration successful! Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000); // Wait 2 seconds
            } else {
                setMessage(`❌ ${data.message || "Registration failed"}`);
            }
        } catch (error) {
            setMessage("❌ Server not reachable");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Create a new account
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                         <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">I am a</label>
                        <select id="role" name="role" required value={form.role} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select a role</option>
                            {roles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
                        </select>
                    </div>
                    <div>
                         <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" name="password" type="password" autoComplete="new-password" required value={form.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || message.startsWith('✅')}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                {message && (
                    <p className={`mt-4 text-center text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                        {message.replace(/^[✅❌]\s*/, '')}
                    </p>
                )}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}