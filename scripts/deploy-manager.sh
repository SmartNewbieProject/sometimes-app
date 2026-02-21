#!/bin/bash
# Sometimes Deploy Manager 실행
cd "$(dirname "$0")/../tools/deploy-manager" || exit 1

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
  npm run rebuild
fi

exec npm run dev
