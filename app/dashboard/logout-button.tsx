"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

type UserInfo = {
  name: string | null;
  email: string | null;
};

export default function AccountMenu() {
  const supabase = createClient();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser({
          name: data.user.user_metadata?.first_name ?? "Usuário",
          email: data.user.email ?? null,
        });
      }
    }

    loadUser();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="relative z-50">
      {/* BOTÃO */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={() => setOpen(true)}
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Conta
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* OVERLAY */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* MOBILE BOTTOM SHEET */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="
                fixed bottom-0 left-0 right-0
                bg-white
                rounded-t-2xl
                shadow-2xl
                p-6
                space-y-4
                
                md:hidden
              "
            >
              {/* handle */}
              <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />

              {/* user */}
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {user?.name}
                </p>

                <p className="text-sm text-gray-500">
                  {user?.email}
                </p>
              </div>

              {/* actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  Sair da conta
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl border py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>

            {/* DESKTOP DROPDOWN */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="
                absolute right-0 top-12
                w-64
                rounded-xl
                border border-gray-200
                bg-white
                shadow-lg

                hidden md:block
              "
            >
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name}
                </p>

                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="border-t border-gray-100 px-4 py-3">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}