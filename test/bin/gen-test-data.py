#!/usr/bin/env python
# -*- coding: utf-8 -*-

import marshal, sys

if len(sys.argv) != 2:
    raise Exception("ERROR: one argument required: output-directory")

outDir = sys.argv[1]

sys.stdout.write("output dir: ={}=\n".format(outDir))

def writeObject(outFile, obj):
    writeFile = "{}/{}".format(outDir, outFile)
    sys.stderr.write("Writing {}\n".format(writeFile))
    fh = open(writeFile, "w")
    fh.write(marshal.dumps(obj))
    fh.close()


writeObject("supported.pyc",
{
    "integer": 42,
    "string": "foobar",
    "other": "foobar",
    "falseBoolean": False,
    "trueBoolean": True,
    "object": {
        "key": "value",
        "string": "foobar",
    },
    "none": None,
    "unicode": "foobar",
    "list": [
        "one",
        {"two": "three"},
        ["four", 5, {"six": True}],
    ],
    "pi": 3.14,
})

writeObject("bignum.pyc", {"bignumber": 1 << 35})

writeObject("ellipsis.pyc", {"ellipsis": Ellipsis})

writeObject("stopiter.pyc", {"stopiter": StopIteration})

writeObject("complex.pyc", {"complex": complex(42, 3)})
