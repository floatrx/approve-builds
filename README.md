# approve-builds

Drop-in replacement for broken `pnpm approve-builds`.

## Problem

Since pnpm v10, all dependency build scripts require explicit approval. The built-in `pnpm approve-builds` command has a [known bug](https://github.com/pnpm/pnpm/issues/9361) that corrupts `pnpm-workspace.yaml` by splitting package names into individual characters:

```yaml
# What pnpm approve-builds generates (broken):
onlyBuiltDependencies:
  - ' '
  - ','
  - '-'
  - /
  - '5'
  - '@'
  - a
  - d
  - e
  - esbuild
  - h
  - i
  - ...
```

This tool writes approvals correctly to `package.json` instead:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["@swc/core", "esbuild"]
  }
}
```

## Install

### Prerequisites

Ensure `PNPM_HOME` is configured (required for global packages):

```bash
pnpm setup
source ~/.zshrc  # or restart terminal
```

### From source

```bash
git clone https://github.com/floatrx/approve-builds.git
cd approve-builds
pnpm install
pnpm link -g
```

## Usage

Run in any project directory:

```bash
approve-builds
```

The tool will:

1. Run `pnpm install` to detect packages with ignored build scripts
2. Show an interactive checkbox to select which packages to approve
3. Write selected packages to `package.json` under `pnpm.onlyBuiltDependencies`
4. Re-run `pnpm install` to apply

## Shell alias

Add to your `.zshrc` or `.bashrc`:

```bash
alias ab="approve-builds"
```

## License

MIT
