import { useState } from "react";
import { googleAuthenticate } from "../lib/authApi";
import { persistAuthSession } from "../lib/authSession";
import { requestGoogleAuthorizationCode } from "../lib/googleAuth";

export function useGoogleAuth({ mode, navigate }) {
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setIsGoogleSubmitting(true);
      const code = await requestGoogleAuthorizationCode();
      const result = await googleAuthenticate({ code, mode });
      persistAuthSession(result.data);
      navigate("/dashboard");
      return {
        ok: true,
        message: result.message,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.response?.message || error.message || "Google authentication failed.",
      };
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return {
    isGoogleSubmitting,
    signInWithGoogle,
  };
}
