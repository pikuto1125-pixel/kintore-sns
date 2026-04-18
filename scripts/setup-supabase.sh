#!/usr/bin/env bash
# Run this after setting SUPABASE_URL and SUPABASE_ANON_KEY in .env.local
# Usage: bash scripts/setup-supabase.sh

set -e

if [ ! -f .env.local ]; then
  echo "Error: .env.local not found. Copy .env.example to .env.local and fill in values."
  exit 1
fi

source .env.local

if [[ -z "$NEXT_PUBLIC_SUPABASE_URL" || "$NEXT_PUBLIC_SUPABASE_URL" == "your_supabase_project_url" ]]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local"
  exit 1
fi

echo "Applying schema to Supabase..."
echo "Please run the following SQL in your Supabase SQL Editor:"
echo ""
echo "  https://supabase.com/dashboard/project/_/sql"
echo ""
cat supabase/schema.sql
