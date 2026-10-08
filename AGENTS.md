# AGENTS.md - FinMan AI Agent Guidelines

This file provides guidelines and documentation for AI agents contributing to the FinMan project.

## Project Structure
- `backend/`: Spring Boot 3.x REST API service (Java 17/21, Spring Security 6, JWT, PostgreSQL, Flyway).
- `frontend/`: React 19 + TypeScript + Vite + Tailwind CSS web application.
- `design/`: Stitch Web Application UI mockups:
  - `design/finman_web_ng_nh_p_h_th_ng/`: Web Login split-screen mockup (`code.html`, `screen.png`).
  - `design/finman_web_ng_k_t_i_kho_n/`: Web Register split-screen mockup (`code.html`, `screen.png`).
  - `design/finman_web_giao_d_ch_dashboard/`: Web Dashboard & Transaction Ledger (`code.html`, `screen.png`).
  - `design/finman_web_popup_th_m_giao_d_ch_m_i/`: Add Transaction Glassmorphism Modal (`code.html`, `screen.png`).
  - `design/finman_web_qu_n_l_ng_n_s_ch/`: Budget Management screen (`code.html`, `screen.png`).
  - `design/finman_web_t_i_kho_n_t_i_s_n_r_ng/`: Accounts & VIP Net Worth screen (`code.html`, `screen.png`).
  - `design/finman_web_th_ng_k_b_o_c_o/`: Statistics & Cashflow Reports screen (`code.html`, `screen.png`).
  - `design/fintech_prestige/`: Fintech Prestige design system tokens (`DESIGN.md`).
- `plans/`: Technical blueprints, architecture, and phase roadmaps (`PRD.md`, `ARCHITECTURE_PLAN.md`, `IMPLEMENT_PLAN.md`, `phases/`).
- `web_builder/`: CrewAI multi-agent software engineering pipeline (BA, Backend, Frontend, QA).
- `docker-compose.yml`: Multi-container orchestration (PostgreSQL, Redis, Backend).

## Development Standards
### Backend Engineering:
- Strictly follow SOLID, ACID (`@Transactional(rollbackFor = Exception.class)`), and Zero-Float (`Long` for all monetary amounts).
- Ensure all tests pass (`mvn test-compile`, `mvn test`) before signing off.

### Frontend Engineering & Design Grounding:
- **Mandatory Design Inspection**: Before writing or modifying any React screen/component, inspect `{design_dir}` (default `design/`) and call `read_file` on the corresponding `code.html`.
- **Zero Hallucination**: Faithfully replicate the 12-column desktop layouts, dual-rail navigation, Tailwind CSS tokens, and Material Symbols icons from the Stitch designs. Never revert to generic single-column styles.
- **Contract Synchronization**: Match TypeScript interfaces 1:1 with backend DTOs (`camelCase`).
- Ensure `npm run build` succeeds with 0 TypeScript and Vite compilation errors.