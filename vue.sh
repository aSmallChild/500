#!/bin/bash

echo 'starting build'
cd vue || exit 1
echo 'installing...'
npm install || exit 1
echo 'testing...'
npm run test || exit 1
echo 'building...'
npm run build || exit 1
echo 'done!'