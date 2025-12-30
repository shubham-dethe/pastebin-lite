import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PasteView() {
  const router = useRouter();
  const { id } = router.query;

  const [paste, setPaste] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/pastes/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load paste");
        }
        return res.json();
      })
      .then(setPaste)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p style={{ padding: 20 }}>{error}</p>;
  if (!paste) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1>Paste</h1>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#111",
          color: "#0f0",
          padding: 16,
          borderRadius: 6,
        }}
      >
        {paste.content}
      </pre>
    </main>
  );
}
