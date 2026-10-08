(() => {
  "use strict";

  const storageKey = "finlit-local-demo-v1";
  const today = new Date().toISOString().slice(0, 10);
  const categories = {
    INCOME: ["Gaji", "Freelance", "Investasi", "Lainnya"],
    EXPENSE: ["Makan & Minum", "Transport", "Pendidikan", "Hiburan", "Kesehatan", "Belanja", "Lainnya"]
  };
  const questions = [
    {
      topic: "Budgeting",
      question: "Apa yang dimaksud dengan budgeting?",
      options: ["Meminjam uang dari bank", "Merencanakan pemasukan dan pengeluaran", "Membeli saham", "Membayar semua tagihan"],
      answer: 1,
      explanation: "Budgeting membantu merencanakan pendapatan dan pengeluaran secara terstruktur."
    },
    {
      topic: "Tabungan",
      question: "Menurut aturan 50/30/20, berapa persen penghasilan yang dialokasikan untuk tabungan?",
      options: ["50%", "30%", "20%", "10%"],
      answer: 2,
      explanation: "Aturan 50/30/20 mengalokasikan 20% untuk tabungan dan investasi."
    },
    {
      topic: "Dana Darurat",
      question: "Berapa bulan pengeluaran yang umumnya disarankan untuk dana darurat?",
      options: ["1-2 bulan", "3-6 bulan", "10-12 bulan", "2 tahun"],
      answer: 1,
      explanation: "Dana darurat sebesar 3-6 bulan pengeluaran dapat membantu menghadapi kebutuhan tak terduga."
    },
    {
      topic: "Investasi",
      question: "Apa tujuan utama diversifikasi investasi?",
      options: ["Menghindari pajak", "Menyebar risiko ke berbagai instrumen", "Menjamin keuntungan", "Mempercepat transaksi"],
      answer: 1,
      explanation: "Diversifikasi menyebar risiko ke berbagai instrumen investasi."
    },
    {
      topic: "Utang & Kredit",
      question: "Apa risiko utama kartu kredit jika tidak dikelola dengan baik?",
      options: ["Skor kredit selalu naik", "Mendapat cashback", "Terjebak utang berbunga tinggi", "Transaksi lebih cepat"],
      answer: 2,
      explanation: "Saldo yang tidak dibayar dapat terkena bunga dan membuat utang menumpuk."
    }
  ];
  const articles = [
    {
      category: "Budgeting",
      title: "Mulai Mengatur Anggaran dengan Aturan 50/30/20",
      summary: "Cara sederhana membagi penghasilan untuk kebutuhan, keinginan, dan masa depan.",
      body: "Aturan 50/30/20 membagi penghasilan bersih menjadi tiga bagian: sekitar 50% untuk kebutuhan pokok, 30% untuk keinginan, dan 20% untuk tabungan atau pembayaran utang. Angka ini adalah titik awal, bukan aturan mutlak. Sesuaikan dengan kondisi dan biaya hidupmu."
    },
    {
      category: "Tabungan",
      title: "Membangun Dana Darurat Secara Bertahap",
      summary: "Kenali fungsi dana darurat dan tentukan target yang realistis.",
      body: "Dana darurat disiapkan untuk kejadian tidak terduga seperti biaya kesehatan atau kehilangan penghasilan. Mulailah dengan target kecil, sisihkan secara rutin, dan simpan terpisah dari uang belanja harian agar lebih mudah dipantau."
    },
    {
      category: "Investasi",
      title: "Diversifikasi: Jangan Menaruh Semua Telur di Satu Keranjang",
      summary: "Memahami cara menyebarkan risiko saat mulai berinvestasi.",
      body: "Diversifikasi berarti menyebarkan dana ke beberapa jenis aset. Strategi ini tidak menghilangkan risiko atau menjamin keuntungan, tetapi dapat mengurangi dampak jika satu aset mengalami penurunan. Pahami tujuan, jangka waktu, dan profil risiko sebelum berinvestasi."
    },
    {
      category: "Utang & Kredit",
      title: "Menggunakan Kartu Kredit dengan Bijak",
      summary: "Kebiasaan sederhana untuk menghindari utang yang menumpuk.",
      body: "Gunakan kartu kredit hanya untuk pembelian yang sudah masuk anggaran. Catat transaksi, periksa tagihan secara rutin, dan usahakan membayar penuh sebelum jatuh tempo. Pahami bunga, biaya, serta ketentuan setiap produk."
    }
  ];
  const app = document.getElementById("app");
  let state = loadState();
  let toastTimer;
  let quizIndex = 0;
  let quizScore = 0;
  let quizChoice = null;

  function initialState() {
    return { users: [], activeEmail: null, profile: null, transactions: [], goals: [], legacyData: null };
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return initialState();
      const parsed = JSON.parse(saved);
      const state = initialState();
      state.users = Array.isArray(parsed.users) ? parsed.users.filter(user =>
        user && typeof user.email === "string" &&
        typeof user.passwordHash === "string" &&
        typeof user.salt === "string"
      ) : [];
      state.activeEmail = typeof parsed.activeEmail === "string" ? parsed.activeEmail : null;
      state.legacyData = parsed.legacyData || (!state.users.length && parsed.profile ? {
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        goals: Array.isArray(parsed.goals) ? parsed.goals : []
      } : null);
      const activeUser = state.users.find(user => user.email === state.activeEmail);
      if (activeUser) {
        state.profile = { name: activeUser.name, email: activeUser.email };
        state.transactions = Array.isArray(activeUser.transactions) ? activeUser.transactions : [];
        state.goals = Array.isArray(activeUser.goals) ? activeUser.goals : [];
      }
      return state;
    } catch (error) {
      console.error("Data demo lokal tidak dapat dibaca.", error);
      return initialState();
    }
  }

  function saveState() {
    try {
      if (state.profile && state.activeEmail) {
        const activeUser = state.users.find(user => user.email === state.activeEmail);
        if (activeUser) {
          activeUser.name = state.profile.name;
          activeUser.transactions = state.transactions;
          activeUser.goals = state.goals;
        }
      }
      localStorage.setItem(storageKey, JSON.stringify({
        users: state.users,
        activeEmail: state.activeEmail,
        legacyData: state.legacyData
      }));
      return true;
    } catch (error) {
      console.error("Data demo lokal tidak dapat disimpan.", error);
      showToast("Browser tidak dapat menyimpan data. Periksa pengaturan penyimpanan browser.", true);
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function money(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function shortDate(value) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
  }

  function route() {
    return location.hash.slice(1).split("?")[0] || "home";
  }

  function navigate(page) {
    location.hash = page;
  }

  function totals(transactions = state.transactions) {
    return transactions.reduce((sum, item) => {
      if (item.type === "INCOME") sum.income += Number(item.amount) || 0;
      else sum.expense += Number(item.amount) || 0;
      return sum;
    }, { income: 0, expense: 0 });
  }

  function notice() {
    return '<div class="local-notice"><strong>Akun lokal, bukan akun aman.</strong> Akun dan data hanya tersimpan di browser/perangkat ini, tanpa backend atau database. Kata sandi lokal tidak melindungi data dari orang yang memiliki akses ke browser. Jangan gunakan kata sandi yang dipakai di layanan lain atau masukkan data keuangan sensitif.</div>';
  }

  function navigation(active) {
    const links = [
      ["home", "Beranda"], ["transactions", "Transaksi"], ["goals", "Tabungan"],
      ["reports", "Laporan"], ["articles", "Artikel"], ["quiz", "Kuis"], ["profile", "Profil"]
    ];
    return `<nav class="navbar"><div class="container"><div class="navbar-inner">
      <a href="#home" class="navbar-brand">Fin<span>Lit</span></a>
      <div class="navbar-nav">${links.map(([id, label]) =>
        `<a href="#${id}" class="nav-link ${active === id ? "active" : ""}">${label}</a>`
      ).join("")}<span class="navbar-divider"></span><button class="nav-logout" data-action="logout">Keluar</button></div>
      <span class="navbar-user">${escapeHtml(state.profile?.name || "Akun lokal")}</span>
    </div></div></nav>`;
  }

  function shell(title, active, content) {
    document.title = `${title} — FinLit Lokal`;
    app.innerHTML = `${navigation(active)}${notice()}${content}
      <footer class="demo-footer">FinLit · Akun dan data tersimpan di browser</footer><div id="toast" class="toast" hidden></div>`;
    window.scrollTo(0, 0);
  }

  function showToast(message, isError = false) {
    let element = document.getElementById("toast");
    if (!element) {
      element = document.createElement("div");
      element.id = "toast";
      element.className = "toast";
      document.body.append(element);
    }
    element.textContent = message;
    element.classList.toggle("error", isError);
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 3500);
  }

  function welcome() {
    document.title = "FinLit — Akun Lokal";
    const isRegister = route() === "register";
    app.innerHTML = `<main class="welcome-wrap">
      <section class="welcome-panel">
        <div><div class="auth-brand-big">Fin<span>Lit</span></div>
          <p class="auth-tagline">Platform literasi dan simulasi keuangan untuk generasi yang lebih cerdas secara finansial.</p></div>
        <p>Akun lokal ini hanya untuk penggunaan pribadi pada browser/perangkat ini. Tidak ada pemulihan kata sandi atau sinkronisasi.</p>
      </section>
      <section class="welcome-form"><div class="welcome-form-inner">
        <div class="overline-gold mb-1">Akun lokal</div><h2>${isRegister ? "Buat akun lokal" : "Masuk ke FinLit"}</h2>
        <p class="text-muted mb-3">${isRegister ? "Akun hanya tersedia di browser ini." : "Masuk dengan akun yang tersimpan di browser ini."}</p>
        ${notice()}
        <div id="auth-message" class="alert alert-danger" hidden></div>
        <form id="${isRegister ? "register-form" : "login-form"}">
          ${isRegister ? `<div class="form-group"><label class="form-label" for="display-name">Nama lengkap</label>
          <input id="display-name" name="name" class="form-control" maxlength="50" required autocomplete="name" placeholder="Contoh: Rani"></div>` : ""}
          <div class="form-group"><label class="form-label" for="account-email">Alamat email</label>
          <input id="account-email" name="email" type="email" class="form-control" maxlength="254" required autocomplete="email" placeholder="nama@email.com"></div>
          <div class="form-group"><label class="form-label" for="account-password">Kata sandi lokal</label>
          <input id="account-password" name="password" type="password" class="form-control" minlength="8" required autocomplete="${isRegister ? "new-password" : "current-password"}" placeholder="Minimal 8 karakter"></div>
          ${isRegister ? `<div class="form-group"><label class="form-label" for="confirm-password">Konfirmasi kata sandi</label>
          <input id="confirm-password" name="confirmPassword" type="password" class="form-control" minlength="8" required autocomplete="new-password"></div>` : ""}
          <button class="btn btn-primary btn-full btn-lg" type="submit">${isRegister ? "Buat Akun Lokal" : "Masuk"}</button>
        </form>
        <p class="auth-footer-link">${isRegister ? "Sudah punya akun lokal?" : "Belum punya akun lokal?"}
          <a href="#${isRegister ? "login" : "register"}">${isRegister ? "Masuk" : "Daftar"}</a>
        </p>
        ${state.users.length ? `<details class="mt-2"><summary class="text-sm">Akun tersimpan di browser ini (${state.users.length})</summary>
          <ul class="text-sm mt-1">${state.users.map(user=>`<li>${escapeHtml(user.email)}</li>`).join("")}</ul></details>` : ""}
      </div></section>
    </main>`;
  }

  function statCard(label, value, type, sub) {
    return `<div class="stat-card stat-${type}"><span class="overline">${label}</span><span class="stat-value">${money(value)}</span><span class="stat-sub">${sub}</span></div>`;
  }

  function home() {
    const sum = totals();
    const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    shell("Beranda", "home", `<header class="hero"><div class="container">
      <div class="overline-gold mb-1">Beranda</div><h1>Halo, ${escapeHtml(state.profile.name)}</h1>
      <p class="mb-3">Ringkasan keuanganmu.</p>
      <div class="stat-grid">${statCard("Total Pemasukan", sum.income, "income", "Tersimpan di browser")}${statCard("Total Pengeluaran", sum.expense, "expense", "Tersimpan di browser")}${statCard("Saldo Bersih", sum.income - sum.expense, "balance", "Pemasukan dikurangi pengeluaran")}</div>
    </div></header>
    <main class="container page-content">
      <div class="section-title">Fitur</div><div class="feature-grid mb-3">
        ${[["transactions","Transaksi","Catat pemasukan dan pengeluaran"],["goals","Target Tabungan","Pantau tujuan keuangan"],["reports","Laporan","Lihat ringkasan bulanan"],["articles","Artikel","Baca edukasi keuangan"],["quiz","Kuis","Uji pengetahuan keuangan"]].map(([id,title,desc],i)=>`<a href="#${id}" class="feature-card"><div class="fc-num">0${i+1}</div><div class="fc-title">${title}</div><div class="fc-desc">${desc}</div></a>`).join("")}
      </div>
      <div class="flex-between mb-1"><div class="section-title">Transaksi terbaru</div><a href="#transactions" class="btn btn-ghost btn-sm">Lihat semua</a></div>
      <div class="card">${recent.length ? transactionRows(recent) : '<div class="empty-state">Belum ada transaksi. Tambahkan catatan pertamamu.</div>'}</div>
    </main>`);
  }

  function transactionRows(items) {
    return `<div class="transaction-list">${items.map(item => `<div class="transaction-row">
      <div class="font-bold">${escapeHtml(item.description)}</div>
      <div class="transaction-meta"><span>${shortDate(item.date)}</span><span>·</span><span>${escapeHtml(item.category)}</span>
      <span class="badge ${item.type === "INCOME" ? "badge-income" : "badge-expense"}">${item.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}</span></div>
      <div class="transaction-amount ${item.type === "INCOME" ? "income-text" : "expense-text"}">${item.type === "INCOME" ? "+" : "−"} ${money(item.amount)}</div>
      <button class="btn btn-danger btn-sm row-delete" data-action="delete-transaction" data-id="${escapeHtml(item.id)}" aria-label="Hapus ${escapeHtml(item.description)}">Hapus</button>
    </div>`).join("")}</div>`;
  }

  function transactionsPage() {
    const sum = totals();
    shell("Transaksi", "transactions", `<header class="hero"><div class="container">
      <div class="demo-header"><div><div class="overline-gold mb-1">Transaksi</div><h2>Pencatatan Keuangan</h2><p>Catat transaksi di browser ini.</p></div></div>
      <div class="stat-grid">${statCard("Pemasukan",sum.income,"income","Seluruh catatan")}${statCard("Pengeluaran",sum.expense,"expense","Seluruh catatan")}${statCard("Saldo Bersih",sum.income-sum.expense,"balance","Pemasukan dikurangi pengeluaran")}</div>
    </div></header><main class="container page-content">
      <section class="card mb-3"><div class="card-body"><div class="section-title">Tambah transaksi</div>
      <form id="transaction-form" class="demo-form">
        <div><label class="form-label" for="tx-type">Jenis</label><select id="tx-type" name="type" class="form-control"><option value="EXPENSE">Pengeluaran</option><option value="INCOME">Pemasukan</option></select></div>
        <div><label class="form-label" for="tx-category">Kategori</label><select id="tx-category" name="category" class="form-control">${categories.EXPENSE.map(value=>`<option>${value}</option>`).join("")}</select></div>
        <div class="wide"><label class="form-label" for="tx-description">Deskripsi</label><input id="tx-description" name="description" class="form-control" maxlength="100" required placeholder="Contoh: Makan siang"></div>
        <div><label class="form-label" for="tx-amount">Jumlah (Rp)</label><input id="tx-amount" name="amount" class="form-control" type="number" min="1" step="1" required></div>
        <div><label class="form-label" for="tx-date">Tanggal</label><input id="tx-date" name="date" class="form-control" type="date" value="${today}" required></div>
        <div class="wide"><label class="form-label" for="tx-notes">Catatan (opsional)</label><input id="tx-notes" name="notes" class="form-control" maxlength="200"></div>
        <div class="wide"><button class="btn btn-primary" type="submit">Simpan Transaksi</button></div>
      </form></div></section>
      <section class="card"><div class="card-body"><div class="flex-between"><div class="section-title">Riwayat transaksi</div>
        <select id="tx-filter" class="form-control filter-select" aria-label="Filter jenis"><option value="">Semua jenis</option><option value="INCOME">Pemasukan</option><option value="EXPENSE">Pengeluaran</option></select></div></div>
        <div id="transaction-list">${state.transactions.length ? transactionRows([...state.transactions].sort((a,b)=>b.date.localeCompare(a.date))) : '<div class="empty-state">Belum ada transaksi.</div>'}</div>
      </section>
    </main>`);
  }

  function goalsPage() {
    shell("Target Tabungan", "goals", `<header class="hero"><div class="container">
      <div class="overline-gold mb-1">Tabungan</div><h2>Target Tabungan</h2><p>Pantau progres tujuan keuanganmu.</p>
    </div></header><main class="container page-content">
      <section class="card mb-3"><div class="card-body"><div class="section-title">Buat target baru</div>
      <form id="goal-form" class="demo-form">
        <div class="wide"><label class="form-label" for="goal-name">Nama target</label><input id="goal-name" name="name" class="form-control" maxlength="80" required placeholder="Contoh: Dana darurat"></div>
        <div><label class="form-label" for="goal-target">Jumlah target (Rp)</label><input id="goal-target" name="target" type="number" min="1" class="form-control" required></div>
        <div><label class="form-label" for="goal-current">Tabungan saat ini (Rp)</label><input id="goal-current" name="current" type="number" min="0" value="0" class="form-control"></div>
        <div><label class="form-label" for="goal-deadline">Target tanggal</label><input id="goal-deadline" name="deadline" type="date" min="${today}" class="form-control" required></div>
        <div class="wide"><button class="btn btn-primary" type="submit">Simpan Target</button></div>
      </form></div></section>
      <section class="grid-2">${state.goals.length ? state.goals.map(goal=>goalCard(goal)).join("") : '<div class="card empty-state">Belum ada target tabungan. Buat target pertamamu di atas.</div>'}</section>
    </main>`);
  }

  function goalCard(goal) {
    const progress = Math.min(100, Math.round(Number(goal.current) / Number(goal.target) * 100) || 0);
    const remaining = Math.max(0, Number(goal.target) - Number(goal.current));
    const days = Math.max(1, Math.ceil((new Date(`${goal.deadline}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000));
    const monthly = Math.ceil(remaining / (days / 30));
    return `<article class="card"><header style="padding:1rem 1.5rem;background:var(--dark-2);border-radius:var(--radius) var(--radius) 0 0">
      <h3 style="color:var(--text-on-dark);font-size:1rem">${escapeHtml(goal.name)}</h3><p class="text-sm">${shortDate(goal.deadline)}</p></header>
      <div class="card-body"><div class="flex-between text-sm mb-1"><span class="text-muted">Terkumpul</span><strong>${money(goal.current)}</strong></div>
      <div class="flex-between text-sm mb-2"><span class="text-muted">Target</span><strong>${money(goal.target)}</strong></div>
      <div class="goal-progress"><span style="width:${progress}%"></span></div><div class="text-xs text-muted mt-1 mb-2">${progress}% tercapai · rekomendasi sekitar ${money(monthly)}/bulan</div>
      <form class="goal-update-form" data-id="${escapeHtml(goal.id)}"><label class="form-label" for="goal-update-${escapeHtml(goal.id)}">Perbarui tabungan (Rp)</label>
      <div class="button-row"><input id="goal-update-${escapeHtml(goal.id)}" name="current" type="number" min="0" value="${Number(goal.current)}" class="form-control" required>
      <button class="btn btn-sage btn-sm" type="submit">Simpan</button><button class="btn btn-danger btn-sm" type="button" data-action="delete-goal" data-id="${escapeHtml(goal.id)}">Hapus</button></div></form></div></article>`;
  }

  function reportsPage() {
    const monthValue = new URLSearchParams(location.hash.split("?")[1] || "").get("month") || today.slice(0, 7);
    const monthlyItems = state.transactions.filter(item=>item.date?.slice(0,7)===monthValue);
    const sum = totals(monthlyItems);
    const max = Math.max(1, ...state.transactions.map(item=>Number(item.amount)||0));
    const months = Array.from({length:6},(_,index)=>{
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5-index));
      const key = date.toISOString().slice(0,7);
      const group = state.transactions.filter(item=>item.date?.slice(0,7)===key);
      const values = totals(group);
      return {key,label:new Intl.DateTimeFormat("id-ID",{month:"short"}).format(date),...values};
    });
    shell("Laporan", "reports", `<main class="container page-content">
      <header class="demo-header"><div class="page-header"><h2>Laporan Keuangan</h2><p>Ringkasan dari transaksi yang tersimpan di browser.</p></div>
      <label class="form-label">Bulan <input id="report-month" type="month" class="form-control" value="${escapeHtml(monthValue)}"></label></header>
      <div class="stat-grid mb-3">${statCard("Pemasukan",sum.income,"income","Bulan dipilih")}${statCard("Pengeluaran",sum.expense,"expense","Bulan dipilih")}${statCard("Saldo",sum.income-sum.expense,"balance","Bulan dipilih")}</div>
      <section class="card mb-3"><div class="card-body"><h3 class="mb-2">Pemasukan vs pengeluaran — 6 bulan</h3>
        <div class="report-bars">${months.map(month=>`<div class="report-month"><div class="bar-pair"><span class="bar" title="Pemasukan ${money(month.income)}" style="height:${Math.max(month.income?3:0,Math.round(month.income/max*135))}px"></span><span class="bar expense" title="Pengeluaran ${money(month.expense)}" style="height:${Math.max(month.expense?3:0,Math.round(month.expense/max*135))}px"></span></div><span>${month.label}</span></div>`).join("")}</div>
        <div class="text-xs text-muted mt-2">Hijau: pemasukan · Merah: pengeluaran</div></div></section>
      <section class="card"><div class="card-body"><h3>Detail transaksi bulan ini</h3></div>
        ${monthlyItems.length?transactionRows([...monthlyItems].sort((a,b)=>b.date.localeCompare(a.date))):'<div class="empty-state">Belum ada transaksi pada bulan ini.</div>'}
      </section></main>`);
  }

  function articlesPage() {
    shell("Artikel", "articles", `<main class="container page-content"><header class="page-header"><h2>Artikel Edukasi</h2><p>Tingkatkan literasi keuanganmu.</p></header>
      <section class="grid-2">${articles.map((article,index)=>`<article class="card article-card"><div class="card-body">
        <span class="badge badge-cat">${escapeHtml(article.category)}</span><h3>${escapeHtml(article.title)}</h3><p class="text-sm">${escapeHtml(article.summary)}</p>
        <details class="mt-2"><summary class="btn btn-secondary btn-sm">Baca selengkapnya</summary><p class="mt-2">${escapeHtml(article.body)}</p></details>
      </div></article>`).join("")}</section></main>`);
  }

  function quizPage() {
    const question = questions[quizIndex];
    if (!question) {
      shell("Hasil Kuis", "quiz", `<main class="container page-content"><section class="card" style="max-width:42rem;margin:auto"><div class="card-body text-center">
        <div class="overline-gold mb-1">Kuis selesai</div><h2>Skor kamu ${quizScore} dari ${questions.length}</h2>
        <p class="my-2">${quizScore===questions.length?"Hebat! Semua jawaban benar.":"Terus belajar dan coba lagi, ya."}</p>
        <div class="button-row" style="justify-content:center"><button class="btn btn-primary" data-action="quiz-restart">Ulangi Kuis</button><a class="btn btn-secondary" href="#home">Kembali ke beranda</a></div>
      </div></section></main>`);
      return;
    }
    shell("Kuis Literasi", "quiz", `<main class="container page-content"><section style="max-width:42rem;margin:auto">
      <div class="flex-between mb-1"><span class="text-sm text-muted">Soal ${quizIndex+1} dari ${questions.length}</span><span class="text-sm text-muted">${Math.round(quizIndex/questions.length*100)}%</span></div>
      <div class="progress-wrap mb-3"><div class="progress-bar" style="width:${quizIndex/questions.length*100}%"></div></div>
      <article class="card"><div class="card-body"><span class="badge badge-user mb-2">${escapeHtml(question.topic)}</span><h3 class="mb-2">${escapeHtml(question.question)}</h3>
      ${question.options.map((option,index)=>`<button class="quiz-option" data-action="quiz-answer" data-index="${index}" ${quizChoice!==null?"disabled":""}><span class="opt-key">${String.fromCharCode(65+index)}</span><span>${escapeHtml(option)}</span></button>`).join("")}
      ${quizChoice!==null?`<div class="alert ${quizChoice===question.answer?"alert-success":"alert-danger"} mt-2"><strong>${quizChoice===question.answer?"Benar!":"Belum tepat."}</strong> ${escapeHtml(question.explanation)}</div><button class="btn btn-primary mt-2" data-action="quiz-next">${quizIndex===questions.length-1?"Lihat Hasil":"Soal Berikutnya"}</button>`:""}
      </div></article></section></main>`);
  }

  function profilePage() {
    shell("Profil", "profile", `<main class="container page-content"><section style="max-width:38rem;margin:auto">
      <header class="page-header"><div class="overline-gold mb-1">Profil lokal</div><h2>${escapeHtml(state.profile.name)}</h2><p>Akun dan profil ini hanya tersedia di browser ini.</p></header>
      <div class="card mb-3"><div class="card-body"><h3 class="mb-2">Ubah nama tampilan</h3><form id="profile-form">
        <div class="form-group"><label class="form-label" for="profile-name">Nama</label><input id="profile-name" name="name" class="form-control" maxlength="50" value="${escapeHtml(state.profile.name)}" required></div>
        <button class="btn btn-primary" type="submit">Simpan Nama</button></form></div></div>
      <div class="card"><div class="card-body"><h3 class="mb-1">Data lokal</h3><p class="text-sm mb-2">${state.transactions.length} transaksi · ${state.goals.length} target tabungan</p>
        <div class="button-row"><button class="btn btn-danger" data-action="clear-data">Hapus transaksi dan target</button><button class="btn btn-danger" data-action="delete-account">Hapus akun &amp; semua data</button><button class="btn btn-secondary" data-action="logout">Keluar</button></div>
        <p class="text-xs text-muted mt-2">Keluar hanya menutup sesi lokal. Data tetap di browser sampai kamu menghapusnya.</p>
      </div></div></section></main>`);
  }

  function render() {
    if (!state.profile) return welcome();
    if (route() === "login" || route() === "register") {
      navigate("home");
      return;
    }
    const pages = {
      home, transactions: transactionsPage, goals: goalsPage,
      reports: reportsPage, articles: articlesPage, quiz: quizPage, profile: profilePage
    };
    (pages[route()] || home)();
  }

  async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();
    const data = new FormData(form);

    if (form.id === "register-form") {
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");
      const confirmPassword = String(data.get("confirmPassword") || "");
      if (!name || !email || password.length < 8) return setAuthError("Isi semua data dan gunakan kata sandi minimal 8 karakter.");
      if (password !== confirmPassword) return setAuthError("Konfirmasi kata sandi tidak sama.");
      if (state.users.some(user => user.email === email)) return setAuthError("Email ini sudah memiliki akun lokal di browser ini.");
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      try {
        const salt = createSalt();
        const passwordHash = await hashPassword(password, salt);
        const previousLegacyData = state.legacyData;
        const user = {
          name,
          email,
          salt,
          passwordHash,
          transactions: state.users.length === 0 ? (state.legacyData?.transactions || []) : [],
          goals: state.users.length === 0 ? (state.legacyData?.goals || []) : []
        };
        const restoredLegacyData = state.users.length === 0 && state.legacyData !== null;
        state.users.push(user);
        state.legacyData = null;
        activateUser(user);
        if (saveState()) {
          navigate("home");
          render();
          showToast(restoredLegacyData
            ? "Akun lokal dibuat dan catatan dari demo sebelumnya dipindahkan."
            : "Akun lokal dibuat. Catatan hanya ada di browser ini.");
        } else {
          state.users = state.users.filter(item => item.email !== email);
          state.activeEmail = null;
          state.profile = null;
          state.transactions = [];
          state.goals = [];
          state.legacyData = previousLegacyData;
        }
      } catch (error) {
        console.error("Akun lokal tidak dapat dibuat.", error);
        setAuthError("Browser tidak mendukung pembuatan akun lokal. Perbarui browser dan coba lagi.");
      } finally {
        if (submitButton.isConnected) submitButton.disabled = false;
      }
      return;
    }
    if (form.id === "login-form") {
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");
      const user = state.users.find(item => item.email === email);
      if (!user) return setAuthError("Akun lokal tidak ditemukan di browser ini. Periksa email atau buat akun lokal.");
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      try {
        const passwordHash = await hashPassword(password, user.salt);
        if (!constantTimeEqual(passwordHash, user.passwordHash)) return setAuthError("Kata sandi tidak sesuai.");
        activateUser(user);
        if (saveState()) {
          navigate("home");
          render();
        }
      } catch (error) {
        console.error("Login akun lokal gagal diproses.", error);
        setAuthError("Browser tidak mendukung verifikasi akun lokal.");
      } finally {
        if (submitButton.isConnected) submitButton.disabled = false;
      }
      return;
    }
    if (form.id === "profile-form") {
      const name = String(data.get("name") || "").trim();
      if (!name) return;
      state.profile.name = name;
      if (saveState()) { render(); showToast("Nama demo diperbarui."); }
      return;
    }
    if (form.id === "transaction-form") {
      const amount = Number(data.get("amount"));
      if (!Number.isFinite(amount) || amount <= 0) return showToast("Masukkan jumlah transaksi yang valid.", true);
      state.transactions.push({
        id: crypto.randomUUID(),
        type: String(data.get("type")),
        category: String(data.get("category")),
        description: String(data.get("description")).trim(),
        amount,
        date: String(data.get("date")),
        notes: String(data.get("notes") || "").trim()
      });
      if (saveState()) { render(); showToast("Transaksi tersimpan di browser ini."); }
      return;
    }
    if (form.id === "goal-form") {
      const target = Number(data.get("target"));
      const current = Number(data.get("current")) || 0;
      if (!Number.isFinite(target) || target <= 0 || current < 0) return showToast("Masukkan jumlah target yang valid.", true);
      state.goals.push({
        id: crypto.randomUUID(),
        name: String(data.get("name")).trim(),
        target,
        current: Math.min(current, target),
        deadline: String(data.get("deadline"))
      });
      if (saveState()) { render(); showToast("Target tabungan tersimpan."); }
      return;
    }
    if (form.classList.contains("goal-update-form")) {
      const goal = state.goals.find(item => item.id === form.dataset.id);
      const current = Number(data.get("current"));
      if (!goal || !Number.isFinite(current) || current < 0) return showToast("Jumlah tabungan tidak valid.", true);
      goal.current = current;
      if (saveState()) { render(); showToast("Progres target diperbarui."); }
    }
  }

  function activateUser(user) {
    state.activeEmail = user.email;
    state.profile = { name: user.name, email: user.email };
    state.transactions = Array.isArray(user.transactions) ? user.transactions : [];
    state.goals = Array.isArray(user.goals) ? user.goals : [];
  }

  function setAuthError(message) {
    const element = document.getElementById("auth-message");
    if (element) {
      element.textContent = message;
      element.hidden = false;
    }
    return false;
  }

  function createSalt() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  }

  async function hashPassword(password, salt) {
    if (!crypto.subtle) throw new Error("Web Crypto tidak tersedia.");
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({
      name: "PBKDF2",
      salt: encoder.encode(`FinLit-local:${salt}`),
      iterations: 210000,
      hash: "SHA-256"
    }, key, 256);
    return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, "0")).join("");
  }

  function constantTimeEqual(left, right) {
    if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) return false;
    let difference = 0;
    for (let index = 0; index < left.length; index += 1) {
      difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
    }
    return difference === 0;
  }

  function handleChange(event) {
    if (event.target.id === "tx-type") {
      const select = document.getElementById("tx-category");
      if (select) select.innerHTML = categories[event.target.value].map(value=>`<option>${escapeHtml(value)}</option>`).join("");
    }
    if (event.target.id === "tx-filter") {
      const items = state.transactions.filter(item=>!event.target.value || item.type===event.target.value).sort((a,b)=>b.date.localeCompare(a.date));
      const list = document.getElementById("transaction-list");
      if (list) list.innerHTML = items.length ? transactionRows(items) : '<div class="empty-state">Tidak ada transaksi untuk filter ini.</div>';
    }
    if (event.target.id === "report-month") {
      const month = event.target.value;
      if (month) navigate(`reports?month=${encodeURIComponent(month)}`);
    }
  }

  function handleClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    switch (button.dataset.action) {
      case "logout":
        saveState();
        state.activeEmail = null;
        state.profile = null;
        state.transactions = [];
        state.goals = [];
        saveState();
        navigate("home");
        render();
        break;
      case "delete-transaction":
        state.transactions = state.transactions.filter(item=>item.id!==id);
        if (saveState()) { render(); showToast("Transaksi dihapus."); }
        break;
      case "delete-goal":
        state.goals = state.goals.filter(item=>item.id!==id);
        if (saveState()) { render(); showToast("Target dihapus."); }
        break;
      case "clear-data":
        if (confirm("Hapus semua transaksi dan target lokal dari browser ini?")) {
          state.transactions = [];
          state.goals = [];
            state.legacyData = null;
          if (saveState()) { render(); showToast("Data lokal sudah dihapus."); }
        }
        break;
      case "delete-account": {
        if (!confirm("Hapus akun lokal beserta semua transaksi dan targetnya dari browser ini? Tindakan ini tidak dapat dibatalkan.")) break;
        const activeUser = state.users.find(user => user.email === state.activeEmail);
        state.users = state.users.filter(user => user.email !== state.activeEmail);
        state.activeEmail = null;
        state.profile = null;
        state.transactions = [];
        state.goals = [];
        if (saveState()) {
            navigate("home");
            render();
            showToast("Akun lokal dan semua datanya sudah dihapus.");
        } else if (activeUser) {
            state.users.push(activeUser);
            activateUser(activeUser);
        }
        break;
      }
      case "quiz-answer":
        if (quizChoice !== null) return;
        quizChoice = Number(button.dataset.index);
        if (quizChoice === questions[quizIndex].answer) quizScore += 1;
        quizPage();
        break;
      case "quiz-next":
        quizIndex += 1;
        quizChoice = null;
        quizPage();
        break;
      case "quiz-restart":
        quizIndex = 0;
        quizScore = 0;
        quizChoice = null;
        quizPage();
        break;
    }
  }

  document.addEventListener("submit", handleSubmit);
  document.addEventListener("change", handleChange);
  document.addEventListener("click", handleClick);
  window.addEventListener("hashchange", render);
  render();
})();
