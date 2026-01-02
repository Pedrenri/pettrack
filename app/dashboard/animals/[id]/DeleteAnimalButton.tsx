"use client";

import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence, scale } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAnimalButton({ animalId }: { animalId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const { error } = await supabase
      .from("animals")
      .delete()
      .eq("id", animalId);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard")
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setOpen(true)}
        className="w-80 md:w-95 rounded-full bg-red-600 py-3 text-white font-semibold hover:bg-red-700 transition-colors"
      >
        Deletar animal
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Deletar animal
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Tem certeza que deseja deletar este animal? Essa ação não pode
                ser desfeita.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  disabled={loading}
                >
                  Cancelar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading ? "Deletando..." : "Confirmar"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
