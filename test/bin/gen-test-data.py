#!/usr/bin/env python
# -*- coding: utf-8 -*-

import marshal, sys

data = {
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
    # "bignum": 17179869184,
}

sys.stdout.write(marshal.dumps(data))
