#!/bin/bash

# Exit if no arguments were provided
if [ "$#" -eq 0 ]; then
  echo "❌ Please provide at least one module name"
  echo "👉 Example: ./generate.sh payment booking"
  exit 1
fi

# Loop through all provided arguments
for NAME in "$@"; do
  echo "🚀 Generating NestJS module: $NAME"

  nest g module "$NAME"
  nest g service "$NAME"
  nest g controller "$NAME"

  echo "✅ $NAME generated successfully"
  echo "-----------------------------"
done
