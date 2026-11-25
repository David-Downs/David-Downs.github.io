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
  "Connecting this device...";

let subscription =
  await registration.pushManager.getSubscription();

if (!subscription) {

  const keyResponse =
    await fetch(
      PUSH_SERVER + "/vapid-public-key"
    );

  if (!keyResponse.ok) {
    throw new Error(
      "Unable to retrieve notification key."
    );
  }

  const keyData =
    await keyResponse.json();

  const applicationServerKey =
    urlBase64ToUint8Array(
      keyData.publicKey
    );

  subscription =
    await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
}

status.textContent =
  "Saving notification subscription...";

const saveResponse =
  await fetch(
    PUSH_SERVER + "/subscribe",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(
        subscription.toJSON()
      )
    }
  );

if (!saveResponse.ok) {
  throw new Error(
    "Unable to save notification subscription."
  );
}

status.textContent =
  "Notifications are enabled on this device.";

button.textContent =
  "Notifications Enabled";

button.disabled = true;

    const notificationCard =
  document.getElementById("notificationCard");

if (notificationCard) {
  notificationCard.style.setProperty(
    "display",
    "none",
    "important"
  );
}
    
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

async function hideNotificationCardIfEnabled() {
  const card =
    document.getElementById("notificationCard");

  if (!card) {
    return;
  }

  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return;
  }

  try {

    const registration =
      await navigator.serviceWorker.ready;

    const subscription =
      await registration.pushManager.getSubscription();

    if (subscription) {
  card.style.setProperty(
    "display",
    "none",
    "important"
  );
}

  } catch (error) {

    console.error(
      "Unable to check notification subscription:",
      error
    );

  }
}

hideNotificationCardIfEnabled();
