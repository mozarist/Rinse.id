# CleanLab 🧺

CleanLab is a laundry management system that provides a web-based admin dashboard and a companion mobile customer API/app for tracking laundry in real time.

---

## 🚀 Project Description

CleanLab helps laundry businesses manage customers, services, transactions, payments, and laundry status updates. The web admin dashboard is built with Laravel + Inertia + React and provides role-based access for staff. The mobile customer experience is supported by a REST API (Sanctum) intended for a React Native / Expo app so customers can track their laundry status and payments in real time.

## ✨ Features

- Authentication & role-based access (Fortify)
- Dashboard with statistics & recent transactions
- Customer management
- Laundry service management
- Transaction management & detail view
- Payment status tracking & payment proof upload
- Laundry status tracking (in-progress → ready → delivered)
- Search and filtering
- Exportable lists and reports

## 🧩 Tech Stack

- PHP 8.4, Laravel 12
- Inertia.js + React + TypeScript
- Tailwind CSS + Shadcn UI
- MySQL
- Laravel Fortify

## 📁 Project Structure (high level)

- [app/Models](app/Models) — Eloquent models (Customer, Service, Transactions, User)
- [app/Http/Controllers](app/Http/Controllers) — Controllers and API controllers (see `Api` folder)
- [resources/js](resources/js) — Inertia + React pages and UI components
- [routes/web.php](routes/web.php) — Web routes for the admin dashboard
- [routes/api.php](routes/api.php) — API routes (login, profile, transactions, logout)
- [database/migrations](database/migrations) — Schema migrations for users, services, transactions, etc.
- [package.json](package.json) — Frontend dependencies and scripts for the web UI
- [composer.json](composer.json) — Backend PHP dependencies

## 🔧 Installation — Web (Admin Dashboard)

1. Clone the repository and install PHP deps:

```bash
git clone https://github.com/mozarist/CleanLab.git
cd cleanlab
composer install
```

2. Install frontend dependencies (uses pnpm/npm/yarn depending on your setup):

```bash
pnpm install
# or
npm install
```

3. Environment setup:

- Copy `.env.example` to `.env` and set your database credentials and app URL.

```bash
cp .env.example .env
php artisan key:generate
```

4. Database:

```bash
php artisan migrate --seed
```

5. Build / run front-end assets:

```bash
npm run dev
# or for production
npm run build
```

6. Serve the application:

```bash
php artisan serve
```

Open the admin UI in your browser at the URL shown by `php artisan serve` or configured `APP_URL`.

## ⚙️ Environment Variables

Essential variables (web):

- `APP_URL` — application URL
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `SANCTUM_STATEFUL_DOMAINS` — domains where Sanctum should issue cookies
- Mail and storage credentials for file uploads (payment proof)

## 👤 Author

- Maintainer: Mozarist
- Project: CleanLab

## 👀 Related Projects

- CleanLab Mobile App: https://github.com/mozarist/CleanLab-App.git