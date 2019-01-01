# APMIA scripts
This directory contains all the script infrastructure for your APMIA ACC bundle.
The perl script in this directory is referenced and configured by bundle.properties
in the root directory.

CA APM provides a perl library that makes generating metrics easier. You can get
it from https://docops.ca.com/ca-apm/10-7/en/implementing-agents/infrastructure-agent/epagent-plug-ins/sample-epagent-plug-in-extensions
and place it into the subdirectory perl of this directory.

Please note that you should place the scripts, libraries and other supporting
files for script bundles into lib, not into bin as the sample bundle from the
link above suggests (it doesn't work with CA APM 10.7 SP2)
