#!/bin/bash

# Start SSH service
/usr/sbin/sshd

# Start HAProxy
haproxy -f /etc/haproxy/haproxy.cfg

# Keep container running
tail -f /dev/null 