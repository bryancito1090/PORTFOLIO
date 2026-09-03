---
name: ponytail-review
description: >
  Code review focused exclusively on over-engineering. Finds what to delete:
  reinvented standard library, unneeded dependencies, speculative abstractions,
  and dead flexibility.
---

# Ponytail Review

Review the current diff for unnecessary complexity only. Do not review
correctness, security, performance, or style.

Report one line per finding using:

`<file>:L<line>: <tag> <what to cut>. <replacement>.`

Allowed tags:

- `delete`: dead code or speculative feature; replacement is nothing.
- `stdlib`: hand-rolled functionality provided by the standard library.
- `native`: code or dependency replaceable by a platform feature.
- `yagni`: abstraction with one implementation or one caller.
- `shrink`: same logic expressed with fewer lines.

End with `net: -<N> lines possible.` If there is nothing to cut, report
`Lean already. Ship.`

The review does not apply fixes. A smoke test is the minimum acceptable
validation and must not be flagged for deletion.
