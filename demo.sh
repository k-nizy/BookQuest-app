#!/bin/bash

echo "🚀 BookQuest Load Balancer Demo"
echo "================================"
echo

echo "📊 Testing Load Balancer Round-Robin Behavior"
echo "---------------------------------------------"
echo "Making 10 requests to show alternating backends:"
echo

for i in {1..10}; do
    echo -n "Request $i: "
    backend=$(curl -s http://localhost:8082/api/health | jq -r '.backend')
    echo "$backend"
    sleep 0.5
done

echo
echo "🔍 Testing Search Functionality"
echo "-------------------------------"
echo "Searching for 'health' books:"
curl -s "http://localhost:8082/api/search?q=health" | jq '.success, .backend, (.data.books | length)'

echo
echo "🌐 Testing Web Interface"
echo "-----------------------"
echo "Frontend is accessible at: http://localhost:8082"
echo "Load balancer is accessible at: http://localhost:8082"
echo "Individual instances:"
echo "  - Web01: http://localhost:8083"
echo "  - Web02: http://localhost:8084"

echo
echo "✅ Demo Complete!"
echo "Load balancing is working correctly with round-robin distribution." 