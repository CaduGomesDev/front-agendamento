import { useEffect, useRef } from "react";

// Botão oficial do Google Identity Services (GIS). Ele devolve um `idToken` (JWT)
// no callback, que o back-end valida em POST /auth/google. O client_id do front
// precisa ser o MESMO configurado no back (GOOGLE_CLIENT_ID) e o domínio precisa
// estar nas "Authorized JavaScript origins" do OAuth Client no Google Cloud.
const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Carrega o SDK do GIS uma única vez (somente no cliente).
function loadGoogleIdentity() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("sem window"));
    if (window.google?.accounts?.id) return resolve();

    let script = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("falha ao carregar o Google")), {
      once: true,
    });
    if (window.google?.accounts?.id) resolve();
  });
}

export function GoogleSignInButton({ onCredential }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    if (!CLIENT_ID || typeof window === "undefined") return;
    let cancelled = false;

    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => callbackRef.current?.(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
        });
      })
      .catch(() => {
        /* SDK indisponível — o container fica vazio, o login por e-mail segue funcionando */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_ID) {
    return (
      <p className="text-center text-xs text-muted-foreground">
        Login com Google indisponível (VITE_GOOGLE_CLIENT_ID não configurado).
      </p>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
}
