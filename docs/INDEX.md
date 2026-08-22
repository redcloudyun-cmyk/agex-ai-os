# AGEX Master Documentation Index

AGEX 프로젝트의 전체 문서 체계 및 도메인별 필독 사양 색인입니다.

---

## 1. 최상위 지침 및 통합 명세
- [AGENTS.md](file:///f:/개발%20프로젝트/Agex%20project/AGENTS.md) — AI Coding Agent 최상위 규칙 및 실행 지침
- [CLAUDE.md](file:///f:/개발%20프로젝트/Agex%20project/CLAUDE.md) — Claude / AI Agent 전용 가이드라인
- [MASTER.md](file:///f:/개발%20프로젝트/Agex%20project/MASTER.md) — AGEX Master Specification (LEVEL 0 SSOT)
- [AGEX-UNIFIED-AGENT-PLATFORM.md](file:///f:/개발%20프로젝트/Agex%20project/AGEX-UNIFIED-AGENT-PLATFORM.md) — Personal Agent Runtime 통합 개발 지시서 (2026-08-22 추가). **주의**: MASTER.md와 마찬가지로 최상위 권위를 자칭하며, Standard/Personal Agent를 단일 코드베이스·단일 Runtime Core로 통합할 것을 지시함 — 이는 이전에 합의된 "데스크톱 에이전트는 별도 제품/코드베이스" 방향과 정면으로 배치됨. 실제 구현 착수 전 두 문서 간 우선순위를 확정할 것.
- [GLOSSARY.md](file:///f:/개발%20프로젝트/Agex%20project/docs/GLOSSARY.md) — AGEX Canonical Glossary (표준 용어집)

---

## 2. 문서 카테고리별 분류

### 🏛 LEVEL 1: Product Constitution (`docs/constitution/`)
- `01-product-vision.md` — AGEX 비전 및 핵심 가치
- `02-product-philosophy.md` — 제품 철학 및 설계 원칙

### 📐 LEVEL 2: System Architecture (`docs/architecture/`)
- `03-product-architecture.md` — 전체 시스템 아키텍처
- `04-core-architecture.md` — 핵심 코어 구조 명세
- `05-runtime-architecture.md` — Runtime 엔진 구조 명세
- `14-security-architecture.md` — Zero-Trust 보안 아키텍처
- `15-multi-tenant-architecture.md` — 멀티테넌트 격리 아키텍처
- `16-deployment-architecture.md` — 배포 및 인프라 구조
- `17-governance.md` — 거버넌스 및 리스크 통제 정책

### 🧩 LEVEL 3: Domain & Supplemental Specifications (`docs/domains/` & `docs/supplemental/`)
- **Domains**:
  - `06-agent-framework.md` — 에이전트 프레임워크 명세
  - `07-workflow-engine.md` — 워크플로우 오케스트레이션 엔진
  - `08-knowledge-engine.md` — Knowledge Engine 명세
  - `09-memory-engine.md` — Memory Engine 명세
  - `10-plugin-framework.md` — 플러그인 확장 프레임워크
  - `11-marketplace.md` — 마켓플레이스 명세
  - `12-sdk.md` — AGEX SDK 사양 명세
  - `13-api-specification.md` — AGEX API 표준 명세
- **Supplemental Core Specifications**:
  - `S-01-master-spec.md` — AGEX Master Specification (LEVEL 0)
  - `S-02-canonical-glossary.md` — Canonical Glossary
  - `S-03-canonical-resource-schema.md` — 표준 Resource & Schema 명세
  - `S-04-model-gateway.md` — Model Gateway & Router Architecture
  - `S-05-iam.md` — Identity & Access Management (IAM) 명세
  - `S-06-billing-entitlement.md` — Billing & Entitlement Architecture

### 📊 LEVEL 4: Execution Planning (`docs/planning/`)
- `18-product-roadmap.md` — 제품 로드맵
- `19-development-roadmap.md` — 개발 단계별 로드맵
- `20-wbs.md` — 작업 분할 구조도 (WBS)
- `21-development-plan.md` — 개발 실행 계획
- `22-resource-plan.md` — 인력 및 자원 계획
- `23-cost-estimation.md` — 비용 추정 및 예산

### 💼 LEVEL 5: Commercial (`docs/business/`)
- `24-business-model.md` — 비즈니스 및 수익 모델

### 📚 LEVEL 6: Explanatory & Usage Guides (`docs/guides/`)
- `25-technical-white-paper.md` — 기술 백서
- `26-product-documentation.md` — 제품 설명서
- `27-operations-guide.md` — 운영 및 매뉴얼 가이드
- `28-api-guide.md` — API 사용 가이드
- `29-administrator-guide.md` — 관리자 가이드
- `30-developer-guide.md` — 개발자 가이드

---

## 3. 작업 영역별 필독 문서 매핑 (Quick Reference)

| 작업 영역 | 필독 권장 문서 목록 |
|---|---|
| **에이전트 구현** | `06-agent-framework.md`, `S-03-canonical-resource-schema.md`, `09-memory-engine.md` |
| **Runtime / Worker 구현** | `05-runtime-architecture.md`, `07-workflow-engine.md`, `S-03-canonical-resource-schema.md` |
| **Model 연동 / 라우팅** | `S-04-model-gateway.md`, `13-api-specification.md` |
| **보안 / IAM / 권한** | `14-security-architecture.md`, `15-multi-tenant-architecture.md`, `S-05-iam.md` |
| **플러그인 / 마켓플레이스** | `10-plugin-framework.md`, `11-marketplace.md`, `S-06-billing-entitlement.md` |
