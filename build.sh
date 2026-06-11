#!/usr/bin/env bash
set -o errexit

echo "==> Installing Python dependencies"
pip install -r backend/requirements.txt

echo "==> Building React frontend"
cd frontend
npm install
npm run build
cd ..

echo "==> Copying React build into Django"
mkdir -p backend/templates backend/static_frontend

# index.html goes to Django templates (rendered by TemplateView)
cp frontend/dist/index.html backend/templates/index.html

# All other files (JS, CSS, icons, sw.js, manifest.json) go to static_frontend
rsync -a --exclude='index.html' frontend/dist/ backend/static_frontend/

echo "==> Django collectstatic + migrate + create admin"
cd backend
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py create_admin

echo "==> Build complete ✓"
