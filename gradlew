#!/bin/sh
set -eu

APP_HOME=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
GRADLE_VERSION="8.7"
GRADLE_HOME="$APP_HOME/.gradle-local/gradle-$GRADLE_VERSION"
GRADLE_BIN="$GRADLE_HOME/bin/gradle"
GRADLE_ZIP="$APP_HOME/.gradle-local/gradle-$GRADLE_VERSION-bin.zip"

if [ ! -x "$GRADLE_BIN" ]; then
  echo "Downloading official Gradle $GRADLE_VERSION..."
  mkdir -p "$APP_HOME/.gradle-local"

  curl --fail --location \
    "https://services.gradle.org/distributions/gradle-$GRADLE_VERSION-bin.zip" \
    --output "$GRADLE_ZIP"

  unzip -q -o "$GRADLE_ZIP" -d "$APP_HOME/.gradle-local"
  rm -f "$GRADLE_ZIP"
fi

exec "$GRADLE_BIN" "$@"
