import React, { useState } from "react";

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // 👈 important to send cookies (JWT)
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Login successful!");
                console.log("Logged in user:", data);

                // Save user info in localStorage (optional)
                localStorage.setItem("user", JSON.stringify(data));

                // redirect to dashboard or homepage
                // window.location.href = "/dashboard";
            } else {
                setMessage(`❌ ${data.message || "Login failed"}`);
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("❌ Server not reachable");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
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
                    Login
                </button>
            </form>

            {message && <p style={{ marginTop: 16 }}>{message}</p>}
        </div>
    );
}
