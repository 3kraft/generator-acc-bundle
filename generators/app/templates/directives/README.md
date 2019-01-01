# Java agent directives
This directory consists of at least two files for java agents: A toggles.pbd that
can contain only TurnOn directives and another pbd that defines this tracer group.

You can place as many pbd files as you like in here and all will be processed when
the bundle is added to a package, toggles.pbd has a special meaning.

See https://docops.ca.com/ca-apm/10-7/en/implementing-agents/deploy-agent-packages-using-apm-command-center/add-custom-bundles#AddCustomBundles-ToggleFiles(InstrumentationDirectives)
and https://docops.ca.com/ca-apm/10-7/en/implementing-agents/java-agent/advanced-instrumentation/probebuilder-directives for supported directives.
