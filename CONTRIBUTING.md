# Contributing

Open an issue before substantial product, protocol or theme work. Pull
requests use Conventional Commit titles and must keep the System contract,
System UI and native-host implementation boundaries explicit.

## Contributor License Agreement

Every human contributor must read and accept [CLA.md](CLA.md). The CLA check
will comment on a pull request when a signature is missing. Sign by posting
this exact pull-request comment from the contributing GitHub account:

```text
I have read the CLA Document and I hereby sign the CLA
```

The signature is versioned separately from source code. If an employer or
another legal entity owns the contribution, an authorized representative must
accept the entity terms before the contribution can be merged.

## Checks

```sh
bun run setup
bun run check
bun run build
```
