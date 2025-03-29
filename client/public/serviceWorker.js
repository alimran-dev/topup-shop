self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.text() : 'No payload';
  const data = JSON.parse(payload);

  const title = data.title || 'New Notification';
  const options = {
    body: data.body || 'This is a push notification',
    icon: data.icon || 'https://example.com/icon.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});