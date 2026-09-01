#!/bin/sh
set -eu
APP_HOME=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WRAPPER_DIR="$APP_HOME/gradle/wrapper"
WRAPPER_JAR="$WRAPPER_DIR/gradle-wrapper.jar"
WRAPPER_URL="https://services.gradle.org/distributions/gradle-8.7-wrapper.jar"
WRAPPER_SHA="cb0da6751c2b753a16ac168bb354870ebb1e162e9083f116729cec9c781156b8"

bootstrap_wrapper() {
  mkdir -p "$WRAPPER_DIR"
  TMP="$WRAPPER_JAR.tmp"
  echo "Bootstrapping official Gradle 8.7 wrapper..."
  curl --fail --location --silent --show-error "$WRAPPER_URL" --output "$TMP"
  ACTUAL=$(sha256sum "$TMP" | awk '{print $1}')
  if [ "$ACTUAL" != "$WRAPPER_SHA" ]; then
    rm -f "$TMP"
    echo "ERROR: Gradle wrapper checksum mismatch." >&2
    exit 1
  fi
  mv "$TMP" "$WRAPPER_JAR"
}

if [ ! -f "$WRAPPER_JAR" ]; then
  bootstrap_wrapper
else
  ACTUAL=$(sha256sum "$WRAPPER_JAR" | awk '{print $1}')
  if [ "$ACTUAL" != "$WRAPPER_SHA" ]; then
    echo "Existing Gradle wrapper is not the verified Gradle 8.7 JAR; replacing it."
    rm -f "$WRAPPER_JAR"
    bootstrap_wrapper
  fi
fi

exec java -Xmx64m -Xms64m -classpath "$WRAPPER_JAR" org.gradle.wrapper.GradleWrapperMain "$@"
