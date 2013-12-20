# covert

code coverage command

# example

```
```

# why

Most code coverage libraries do weird thing I don't like, such as writing all
their junk to directories and files without telling me about it.

covert:

* only uses stderr and stdout, doesn't write to any files.
All of this business about `lcov` files and directories with reports in them
really weirds me out.

* bundles with `browserify --bare` and a transform instead of hijacking
`require()`. All the reporting goes through a unix pipeline on process.stdin and
process.stdout. This is still hacky, but it's the kind of hacky that you can fix
yourself when the magic breaks down. The internal pipeline is just:

```
browserify -t coverify --bare $* | node | coverify
```

* works really well with simple unix pipelines.
stdin and stdout: the wisdom of the ancients.

# usage

```
```
