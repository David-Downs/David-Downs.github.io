const PUSH_SERVER =
  "https://umwa8982-notifications.a87davey07.workers.dev";

function urlBase64ToUint8Array(base64String) {
  const padding =
    "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(character =>
      character.charCodeAt(0)
    )
  );
}

async function enableLocal8982Notifications() {

  const button =
    document.getElementById("enableNotifications");

  const status =
    document.getElementById("notificationStatus");

  if (!button || !status) {
    return;
  }

  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    status.textContent =
      "Notifications are not supported on this device.";

    button.disabled = true;
    return;
  }

  try {

    button.disabled = true;
    button.textContent = "Please Wait...";

    status.textContent =
      "Requesting notification permission...";

    const permission =
      await Notification.requestPermission();

    if (permission !== "granted") {

      status.textContent =
        "Notification permission was not granted.";

      button.textContent =
        "Enable Notifications";

      button.disabled = false;
      return;
    }

    status.textContent =
  "Preparing notification service...";

const registration =
  await navigator.serviceWorker.register(
    "/service-worker.js",
    { scope: "/" }
  );

if (!registration.active) {
  const worker =
    registration.installing || registration.waiting;

  if (!worker) {
    throw new Error(
      "Service worker could not be started."
    );
  }

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          "Service worker did not become active."
        )
      );
    }, 15000);

    worker.addEventListener("statechange", () => {
      if (worker.state === "activated") {
        clearTimeout(timeout);
        resolve();
      }

      if (worker.state === "redundant") {
        clearTimeout(timeout);
        reject(
          new Error(
            "Service worker installation failed."
          )
        );
      }
    });
  });
}

status.textContent =
  "Notification service is ready.";

button.textContent =
  "Service Ready";

  } catch (error) {

    console.error(
      "Notification setup failed:",
      error
    );

    status.textContent =
      "Notification setup failed: " +
      (error.message || "Unknown error.");

    button.textContent =
      "Enable Notifications";

    button.disabled = false;
  }
}

const notificationButton =
  document.getElementById("enableNotifications");

if (notificationButton) {
  notificationButton.addEventListener(
    "click",
    enableLocal8982Notifications
  );
}
