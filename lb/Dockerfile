FROM ubuntu:24.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install packages
RUN apt-get update && apt-get install -y \
    openssh-server \
    haproxy \
    curl \
    wget \
    vim \
    nano \
    htop \
    net-tools \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Configure SSH
RUN mkdir /var/run/sshd
RUN echo 'root:pass123' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Configure ubuntu user (already exists in Ubuntu 24.04)
RUN echo 'ubuntu:pass123' | chpasswd
RUN usermod -aG sudo ubuntu

# SSH login fix
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

# Configure HAProxy
COPY haproxy.cfg /etc/haproxy/haproxy.cfg

# Expose ports
EXPOSE 22 80

# Start services
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"] 