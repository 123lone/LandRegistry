import React, { useState } from "react";

const roles = [
    { value: "Seller", label: "Seller" },
    { value: "Buyer", label: "Buyer" },
];

export default function SignUpPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        password: "",
    });

    const [message, setMessage] = useState(""); // feedback from backend

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Registration successful!");
                console.log("Registered user:", data);
            } else {
                setMessage(`❌ Error: ${data.message || "Something went wrong"}`);
            }
        } catch (error) {
            console.error("Request failed:", error);
            setMessage("❌ Server not reachable");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>Role</label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                    >
                        <option value="">Select role</option>
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: 8, marginTop: 4 }}
                    />
                </div>
                <button type="submit" style={{ width: "100%", padding: 10 }}>
                    Sign Up
                </button>
            </form>

            {message && <p style={{ marginTop: 16 }}>{message}</p>}
        </div>
    );
}
