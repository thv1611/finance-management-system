const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_SCOPE = "openid email profile";

let scriptPromise;

function getGoogleClientId() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      "Google Sign-In is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend environment."
    );
  }

  return clientId;
}

function loadGoogleScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google), {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load the Google Sign-In SDK.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Unable to load the Google Sign-In SDK."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function requestGoogleAuthorizationCode() {
  const google = await loadGoogleScript();
  const clientId = getGoogleClientId();

  return new Promise((resolve, reject) => {
    const codeClient = google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: GOOGLE_SCOPE,
      ux_mode: "popup",
      redirect_uri: "postmessage",
      callback: (response) => {
        if (response?.code) {
          resolve(response.code);
          return;
        }

        reject(new Error("Google Sign-In did not return an authorization code."));
      },
      error_callback: (error) => {
        if (error?.type === "popup_closed") {
          reject(new Error("Google Sign-In was cancelled."));
          return;
        }

        if (error?.type === "popup_failed_to_open") {
          reject(new Error("The Google popup could not be opened. Check your popup blocker and try again."));
          return;
        }

        reject(new Error("Google Sign-In failed. Please try again."));
      },
    });

    codeClient.requestCode();
  });
}
