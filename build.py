#!/usr/bin/env python3
import subprocess
import sys

NPM = "npm.cmd" if sys.platform == "win32" else "npm"


def run(*args):
    result = subprocess.run([NPM, *args], cwd=".")
    if result.returncode != 0:
        sys.exit(result.returncode)


if __name__ == "__main__":
    run("run", "build")
