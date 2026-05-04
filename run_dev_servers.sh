#!/bin/bash

npm start --prefix backend &     # Run the first command in the background
npm run dev --prefix frontend &  # Run the second command in the background

wait

echo "Both servers terminated..."