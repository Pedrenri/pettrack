"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function DeleteAnimalButton({ animalId }: { animalId: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    const confirm = window.confirm(
      "Tem certeza que deseja deletar este animal? Essa ação não pode ser desfeita."
    );

    if (!confirm) return;

    const { error } = await supabase
      .from("animals")
      .delete()
      .eq("id", animalId);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={handleDelete}
      className="w-95 rounded-full bg-red-600 py-3 text-white font-semibold justify-self-center hover:bg-red-700 transition-colors"
    >
      Deletar animal
    </motion.button>
  );
}
