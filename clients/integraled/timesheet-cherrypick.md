# Timesheet Cherry-Pick Plan for /integraled/

## Goal
Cherry-pick only timesheet-related changes for `/integraled/` from the `feature/timesheet-entry-new` branch, keeping main branch clean and focused.

## Steps

1. **Identify relevant commits**
   - Review commit history on `feature/timesheet-entry-new` for changes affecting `clients/integraled/` and timesheet files.
   - Note commit hashes for those changes.

2. **Fetch and check out main branch**
   - Ensure you are on the latest `main` branch locally.

3. **Create a new branch for cherry-pick**
   - Name: `start-cherry-pick-timesheet`

4. **Cherry-pick the commits**
   - Use `git cherry-pick <commit-hash>` for each relevant commit.

5. **Resolve conflicts if any**
   - Focus only on `/integraled/` and timesheet-related files.

6. **Test**
   - Verify timesheet functionality in `/integraled/`.

7. **Commit and push**
   - Commit changes and push the new branch.

---

### Example Commands
```sh
git fetch origin feature/timesheet-entry-new
git checkout main
git pull
git checkout -b start-cherry-pick-timesheet
# For each relevant commit:
git cherry-pick <commit-hash>
# Resolve conflicts if prompted, then:
git add .
git cherry-pick --continue
# After all are done:
git push -u origin start-cherry-pick-timesheet
```

---

- Use `git log --oneline -- clients/integraled/` on the feature branch to find relevant commits.
- For specific files, use `git checkout feature/timesheet-entry-new -- <file-path>`.
