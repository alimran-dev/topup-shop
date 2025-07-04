const RegisterWorker = () => {
  return new Promise((resolve, reject) => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          // Subscribe to push notifications
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
          });
        })
        .then((subscription) => {
          // console.log("Push subscription:", subscription);
          // return subscription
          sessionStorage.setItem("subscription", JSON.stringify(subscription));
          resolve();
          // Send subscription to the backend
          // fetch("https://push-notification-phi-three.vercel.app/subscribe", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify(subscription),
          // });
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
          reject(err);
        });
    } else {
      reject(new Error("Service worker not supported"));
    }
  });
};

export default RegisterWorker;
