import { useState, useEffect } from "react";

const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if user has previously cancelled the install prompt
    const hasCancelled = sessionStorage.getItem("pwa-install-cancelled");

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Only show the custom install prompt if user hasn't cancelled before
      if (!hasCancelled) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      // Hide the custom install prompt
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      // Clear the cancelled state since app is now installed
      sessionStorage.removeItem("pwa-install-cancelled");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      // Clear the deferredPrompt for next time
      setDeferredPrompt(null);
      setShowInstallPrompt(false);

      return outcome === "accepted";
    }
    return false;
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Save the cancelled state to session storage
    sessionStorage.setItem("pwa-install-cancelled", "true");
  };

  return {
    showInstallPrompt,
    installPWA,
    dismissInstallPrompt,
  };
};

export default usePWAInstall;
