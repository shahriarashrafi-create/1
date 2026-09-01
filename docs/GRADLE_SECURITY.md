# Gradle Wrapper Security

Module 01 intentionally does **not** commit `gradle-wrapper.jar`.

`./gradlew` downloads the official Gradle 8.7 wrapper JAR from Gradle's distribution service and accepts it only when its SHA-256 is:

`cb0da6751c2b753a16ac168bb354870ebb1e162e9083f116729cec9c781156b8`

The Gradle 8.7 binary distribution is also pinned with SHA-256:

`544c35d6bd849ae8a5ed0bcea39ba677dc40f49df7d1835561582da2009b961d`

This avoids committing an unknown wrapper JAR while preserving repeatable builds.
