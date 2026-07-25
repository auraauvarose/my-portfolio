#!/bin/bash
# Ping endpoint setiap 3 hari agar Supabase tidak pause
curl -s https://my-portfolio.vercel.app/api/keep-alive >/dev/null
