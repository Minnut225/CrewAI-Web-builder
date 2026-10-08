# GEMINI.md - FinMan Gemini AI Integration

This document outlines guidelines, instructions, and integration notes for Gemini AI agents operating within the FinMan workspace.

## Overview
FinMan is a personal finance management application with robust database integrity, secure backend services, and automated build tools.

## Architecture & Codebase Map
- **Backend**: Spring Boot 3.x (`backend/`)
  - REST endpoints at `/api/v1/*`.
  - Monetary values strictly modeled as `Long` (VND Zero-Float rule).
  - DTO naming convention: `camelCase`.
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (`frontend/`)
  - Fintech Prestige Stitch Design Tokens from `design/fintech_prestige/DESIGN.md`.
- **Design Specifications**: Located in `design/`:
  - `design/finman_web_ng_nh_p_h_th_ng/code.html` (Login)
  - `design/finman_web_ng_k_t_i_kho_n/code.html` (Register)
  - `design/finman_web_giao_d_ch_dashboard/code.html` (Dashboard & Ledger)
  - `design/finman_web_popup_th_m_giao_d_ch_m_i/code.html` (Add Transaction Modal)
  - `design/finman_web_qu_n_l_ng_n_s_ch/code.html` (Budget)
  - `design/finman_web_t_i_kho_n_t_i_s_n_r_ng/code.html` (Accounts & Net Worth)
  - `design/finman_web_th_ng_k_b_o_c_o/code.html` (Statistics & Reports)
  - `design/fintech_prestige/DESIGN.md` (Design Tokens & Color Palette)

## Mandatory UI Grounding Rule
Before writing any frontend component, Gemini agents MUST inspect `design/` and read the relevant `code.html` file to reproduce exact layout structure, typography, and styling classes.