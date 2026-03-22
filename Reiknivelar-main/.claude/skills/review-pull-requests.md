# Skill: Review and Manage Pull Requests

When asked to review pull requests or manage PR workflow for this repository:

## Reviewing a Pull Request

1. **Check the PR diff** to understand what files are changed
2. **Validate HTML conventions** by running:
   ```bash
   python3 scripts/validate.py
   ```
3. **Check for common issues**:
   - Missing `<meta charset="UTF-8">` or `<meta name="viewport" ...>`
   - Missing `lang="is"` attribute
   - Missing favicon links
   - Use of `var` instead of `const`/`let`
   - Extracted CSS/JS (should stay inline)
   - Missing card in `index.html` for new calculators
   - Missing entry in `README.md` for new calculators

## Resolving Stale PRs

Many PRs may address issues already fixed on `main`. Before working on a PR:

1. Check if `main` already has the changes the PR introduces
2. If the PR is stale (base SHA outdated, changes already on main), note it as resolved
3. If the PR has unique new content not on main, incorporate those changes

## Adding a New Calculator from a PR

If a PR adds a new calculator HTML file:

1. Ensure the file follows conventions in `CLAUDE.md`
2. Add a card to `index.html` in the `.grid` section
3. Add a row to the table in `README.md`
4. Add the filename to the `calculators` list in `scripts/validate.py`
5. Run `python3 scripts/validate.py` to verify

## PR Workflow

- PRs target `main` branch
- CI runs `python3 scripts/validate.py` on all PRs via `.github/workflows/ci.yml`
- Deployment happens automatically on push to `main` via `.github/workflows/static.yml`
- Branch protection requires the CI check to pass before merge
