# FinLit browser-only

This version runs as static HTML, CSS, and JavaScript. It has no application backend or database. Accounts, transactions, and savings goals are stored in the current browser's `localStorage`.

Accounts are not secure server-authenticated accounts: they cannot be recovered or synced to other devices, and anyone with access to the browser can inspect or change local data. Do not reuse a password or enter sensitive financial information.

## Run locally

From the repository root, start any static file server. For example, with Node.js:

```powershell
npx --yes http-server . -p 8000
```

Open <http://localhost:8000/demo-local/>. The file server only serves static assets; it does not run the Spring application.

To erase the signed-in account and all its data, use **Profil → Hapus akun & semua data**. **Profil → Hapus transaksi dan target** only clears the current account's transaction and savings-goal records.
