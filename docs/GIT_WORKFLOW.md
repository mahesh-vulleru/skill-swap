# SkillSwap – Git Branching & Collaboration Workflow

## 1. Branch Strategy

SkillSwap adheres to the Gitflow branching model designed for robust release quality and zero unverified commits in production:

```
main (Production)
  ▲
  │ (Release Pull Request)
develop (Integration)
  ▲
  │ (Feature / Chore Pull Request)
chore/project-foundation | feature/* | bugfix/*
```

### Branch Definitions
- **`main`**: Production-ready, deployable code. Only receives merges from `develop` via verified pull requests.
- **`develop`**: Central integration branch containing the latest validated milestone features.
- **`feature/*`**: Scoped branches for new phase implementations (e.g., `feature/skillswap-initial-development`, `feature/matching-engine`).
- **`chore/*`**: Foundation, security audits, tooling, and configuration branches (e.g., `chore/project-foundation`).
- **`hotfix/*`**: Immediate patches applied directly to production.

---

## 2. Commit Message Standards

Commits must follow the **Conventional Commits** specification:

```
<type>(<scope>): <short imperative summary>

[optional body describing architectural rationale]
```

### Allowed Types:
- `feat`: A new user-facing capability or API feature
- `fix`: A bug fix or security correction
- `chore`: Infrastructure, tooling, dependencies, or configuration changes
- `docs`: Documentation creation or updates
- `test`: Test suite additions and verifications
- `refactor`: Code restructuring without modifying behavior

### Examples:
- `chore: establish project architecture and configuration`
- `fix: enforce secure authentication and authorization`
- `fix: validate backend environment configuration`
- `docs: document project foundation and git workflow`
- `test: verify application foundation`

---

## 3. Pull Request Guidelines

1. Never force-push (`git push --force`) to shared branches.
2. Ensure all automated tests pass before proposing a PR:
   ```bash
   npm --prefix server run test
   npm --prefix server run build
   npm --prefix client run build
   ```
3. Never commit `.env` or sensitive credentials. Ensure `.env` is explicitly ignored.
4. Merge using non-fast-forward (`--no-ff`) or standard GitHub PR review merge.
