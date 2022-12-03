variable "nginx_assets_config" {
  type =  string
  default = <<EOH
    autoindex off;
    access_log off;
    log_not_found off;

    gzip_static on;
    gzip_comp_level 6;
    gzip_min_length 1100;
    gzip_buffers 16 8k;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/js
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml
        application/rss+xml
        image/svg+xml;

    add_header Pragma public;
    add_header Vary Accept-Encoding;
    add_header Cache-Control "public, no-transform, max-age=31536000, immutable";
    expires 3d;
  EOH
}

job "upolujksiazke-assets" {
  datacenters = ["dc1"]
  type = "service"

  meta {
    run_uuid = "${uuidv4()}"
  }

  update {
    max_parallel = 1
    min_healthy_time = "5s"
    healthy_deadline = "2m"
    auto_revert = true
    canary = 0
  }

  group "upolujksiazke-assets" {
    count = 1

    network {
      mode = "bridge"

      port "http" {
        host_network = "internal-cluster-network"
        to = 80
      }
    }

    volume "app-data" {
      type      = "host"
      source    = "app-data"
      read_only = false
    }

    task "nginx" {
      driver = "docker"

      config {
        image = "docker-registry.service.consul:5000/upolujksiazke-assets"
        ports = ["http"]
        volumes = [
          "custom/default.conf:/etc/nginx/conf.d/default.conf"
        ]
      }

      volume_mount {
        volume      = "app-data"
        destination = "/data"
        read_only   = false
      }

      template {
        data = <<EOH
          server {
            listen 80;

            location /cdn/ {
              alias /data/upolujksiazke/cdn/;
              ${var.nginx_assets_config}
            }

            location /sitemaps/ {
              alias /data/upolujksiazke/sitemaps/;
              ${var.nginx_assets_config}
            }
          }
        EOH

        destination = "custom/default.conf"
      }

      resources {
        cpu    = 1000
        memory = 128
      }
    }

    service {
      name = "upolujksiazke-assets"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.upolujksiazke-assets.rule=Host(`upolujksiazke.pl`) && (PathPrefix(`/cdn`) || PathPrefix(`/sitemaps`))",
        "traefik.http.routers.upolujksiazke-assets.entrypoints=http,https",
        "traefik.http.routers.upolujksiazke-assets.tls=true",
        "traefik.http.routers.upolujksiazke-assets.tls.certresolver=https-resolver",
        "traefik.http.routers.upolujksiazke-assets.tls.domains[0].main=upolujksiazke.pl"
      ]
    }
  }
}
