## Summary
<!-- Brief description of changes -->

## Type of Change
- [ ] New algorithm (add to CHANGELOG.md)
- [ ] Bug fix in existing algorithm
- [ ] New language port
- [ ] Performance improvement (include benchmark numbers)
- [ ] Documentation
- [ ] Test vectors added/updated
- [ ] Security fix

## Algorithm Details (if new algorithm)
- **Module:** <!-- sort / search / graph / math / ... -->
- **Algorithm Name:**
- **Time Complexity:** O(?)
- **Space Complexity:** O(?)
- **Reference:** <!-- Wikipedia link / RFC / paper -->
- **Language ports included:** <!-- TS / Rust / Python / Go / ... -->

## Test Vectors
- [ ] JSON test vectors added in `tests/vectors/{module}/`
- [ ] All 12 ports produce identical output for these vectors
- [ ] Edge cases covered: empty input, single element, max values, Unicode

## Checklist
- [ ] `make test` and `make lint` pass
- [ ] `make vectors-crosscheck` — five identical runner outputs
- [ ] SPEC updated for any behaviour change (and vector SHA-256 if vectors changed)
- [ ] CHANGELOG.md updated
- [ ] No new external dependencies introduced

## Performance (if relevant)
<!-- Include before/after benchmark numbers -->
