import { useEffect, useState } from "react";
import { api } from '../../api';
import toast from "react-hot-toast";

export default function KnowledgeTab() {
//   const [data, setData] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [approved, setApproved] = useState<any[]>([]);

//   const fetchData = async () => {
//     const res = await api.adminGetKnowledge();
//     setData(res.data);
//   };
    const fetchData = async () => {
    const p = await api.adminGetKnowledge();
    const a = await api.adminGetApprovedKnowledge();

    setPending(p.data);
    setApproved(a.data);
    };

 const approve = async (id: number) => {
  try {
    await api.adminApproveKnowledge(id);
    toast.success("Đã duyệt");
    fetchData();
  } catch (err: any) {
    toast.error(err.message); // 🔥 HIỂN THỊ LỖI BACKEND
  }
};

  const remove = async (id: number) => {
    await api.adminDeleteKnowledge(id);
    toast.success("Đã xoá");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
  <div>
    <h2 style={{ fontSize: 22, marginBottom: 20 }}>🧠 Tri thức AI</h2>

    {/* ===== CHỜ DUYỆT ===== */}
    <h3 style={{ marginBottom: 10 }}>⏳ Chờ duyệt</h3>
    {pending.map((item) => (
      <div
        key={item.id}
        style={{
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderLeft: "6px solid orange"
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          ❓ {item.question}
        </div>

        <div style={{ marginBottom: 10 }}>
          💬 {item.answer}
        </div>

        <span style={{
          background: "#fff7e6",
          color: "orange",
          padding: "4px 10px",
          borderRadius: 999
        }}>
          ⏳ CHỜ DUYỆT
        </span>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={() => approve(item.id)}>✅ Duyệt</button>
          <button onClick={() => remove(item.id)}>❌ Xoá</button>
        </div>
      </div>
    ))}

    {/* ===== ĐÃ DUYỆT ===== */}
    <h3 style={{ marginBottom: 10 }}>✅ Đã duyệt</h3>
    {approved.map((item) => (
      <div
        key={item.id}
        style={{
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderLeft: "6px solid green"
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          ❓ {item.question}
        </div>

        <div style={{ marginBottom: 10 }}>
          💬 {item.answer}
        </div>

        <span style={{
          background: "#e6fffa",
          color: "green",
          padding: "4px 10px",
          borderRadius: 999
        }}>
          ✅ ĐÃ DUYỆT
        </span>
         {/* 🔥 THÊM NÚT XOÁ */}
    <div style={{ marginTop: 10 }}>
      <button
        onClick={() => remove(item.id)}
        style={{
          background: "#dc2626",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        ❌ Xoá
      </button>
    </div>
      </div>
      
    ))}
    
  </div>
);
}