"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function VisionImageUpload({ userId, hasImage }: { userId: string; hasImage: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/vision.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("vision-images")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("vision-images").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ vision_image_url: publicUrl })
        .eq("id", userId);
      if (updateError) throw updateError;

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="text-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-secondary text-sm"
      >
        {uploading ? "Enviando..." : hasImage ? "Trocar imagem da visão" : "Escolher imagem da visão"}
      </button>
      {error && <p className="mt-2 text-xs text-accent-danger">{error}</p>}
    </div>
  );
}
