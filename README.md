# DevCipher

**Free, professional-grade cryptography and developer tools that run entirely in your browser.**

[devcipher.dev](https://devcipher.dev) · [About](https://devcipher.dev/about) · [Report a Bug](https://github.com/AnimeshShaw/DevCipher/issues/new)

---

## What is DevCipher?

DevCipher is a collection of 100+ cryptography, encoding, hashing, and developer utilities — all running locally in your browser. No accounts. No uploads. No tracking. Nothing leaves your device.

Built by [Animesh Shaw](https://www.linkedin.com/in/animeshshaw/) — Senior AVP at EXL with 10+ years in information security, DevSecOps, and Post-Quantum Cryptography research.

## Tools

| Category | Tools |
|----------|-------|
| **Hash** | CRC, MD2/4/5, SHA-1/2/3, SHA-512 variants, Keccak, SHAKE, cSHAKE, KMAC, RIPEMD, BLAKE2/3 — all with file hash variants |
| **Cryptography** | AES, DES, Triple DES, RC4, ECDSA (keygen/sign/verify), RSA (keygen/sign/verify/encrypt/decrypt) |
| **Encoding** | Hex, Base32, Base58, Base64, HTML entities, URL encoding — all with file variants |
| **Format** | JSON validator/formatter/minifier/viewer, XML validator/formatter/minifier |
| **Convert** | Case converter, number base converter, color converter (HEX/RGB/HSL/HSV/OKLCH), Unix timestamp, IP/CIDR tools |
| **Other** | QR code generator, syntax highlighter (36 langs), text diff, regex tester, Lorem Ipsum generator, Cron parser |
| **Developer** | JWT decoder/verifier, UUID generator (v1/v3/v4/v5), password strength analyser, password hasher (bcrypt/scrypt/PBKDF2), hash identifier, X.509 certificate inspector |

## Privacy

Every computation runs as JavaScript inside your browser. Input you enter never leaves your device — not to our servers, not to anyone's servers. The site is a static export with no backend.

You can verify this yourself by inspecting the network tab in your browser's dev tools — you'll see zero outbound requests when using tools.

## Security Pipeline

DevCipher has a defence-in-depth CI/CD security pipeline:

| Check | When | What |
|-------|------|------|
| `npm audit` | Every push & PR | Blocks on high/critical CVEs in dependencies |
| **Semgrep SAST** | Every push, PR, weekly | OWASP Top 10, JS/TS rules, secrets scanning, supply-chain rules |
| **CodeQL** | Every push, PR, weekly | security-extended + security-and-quality queries |
| **Dependency Review** | PRs only | Blocks new dependencies with high/critical CVEs or GPL/AGPL licences |
| **SBOM** | Every push to master | CycloneDX (JSON) + SPDX (JSON) SBOMs generated and uploaded as artifacts |
| **Sigstore attestation** | Every push to master | Build provenance signed via GitHub OIDC — links the deployed artifact to the exact source commit |

Security findings (Semgrep + CodeQL) are uploaded as SARIF to the **GitHub Security → Code scanning alerts** tab.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 6
- **Styling:** Tailwind CSS v4 + Radix UI + shadcn/ui
- **Crypto libraries:** `@noble/hashes`, `@noble/ciphers`, `@noble/curves`, `crypto-js`, `bcryptjs`, `scrypt-js`, `node-forge`
- **Output:** Static export (`next build` → `out/`) deployed to GitHub Pages
- **Domain:** devcipher.dev (CNAME)

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (Turbopack)
npm run dev

# Type-check
npx tsc --noEmit

# Build static export
npm run build
# Output is in out/
```

## Adding a New Tool

1. Add an entry to `lib/tools-config.ts` under the appropriate `CATEGORIES` array
2. Create `components/tools/MyTool.tsx`
3. Wire it in `components/tools/ToolRenderer.tsx`
4. The sitemap updates automatically

## Roadmap

- **Post-Quantum Cryptography tooling** — CRYSTALS-Kyber, CRYSTALS-Dilithium, SPHINCS+ so practitioners can experiment with lattice-based and hash-based schemes alongside classical algorithms

## Support

DevCipher is free and will always be free.

- [Buy me a coffee on Ko-fi](https://ko-fi.com/animeshshaw)
- [GitHub Sponsors](https://github.com/sponsors/AnimeshShaw)

## Contact

- **Email:** [animeshshaw@pm.me](mailto:animeshshaw@pm.me)
- **GitHub Issues:** [Bug reports & feature requests](https://github.com/AnimeshShaw/DevCipher/issues)
- **LinkedIn:** [linkedin.com/in/animeshshaw](https://www.linkedin.com/in/animeshshaw/)

## License

Source code is open source. See [LICENSE](LICENSE) for details.

---

*Built with an offensive security mindset. Shift-left security belongs in every developer's hands.*
