variable "nginx_assets_config" {
  type =  string
  default = <<EOH
    autoindex off;
    access_log off;
    log_not_found off;
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

            location /public/ {
              alias /data/upolujksiazke/public/;
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
        "traefik.http.routers.upolujksiazke-assets.rule=Host(`upolujksiazke.pl`) && (PathPrefix(`/cdn`) || PathPrefix(`/sitemaps`) || PathPrefix(`/public`))",
        "traefik.http.routers.upolujksiazke-assets.entrypoints=http,https",
        "traefik.http.routers.upolujksiazke-assets.tls=true",
        "traefik.http.routers.upolujksiazke-assets.tls.certresolver=https-resolver",
        "traefik.http.routers.upolujksiazke-assets.tls.domains[0].main=upolujksiazke.pl",
        "traefik.http.middlewares.upolujksiazke-assets-compress.compress=true",
        "traefik.http.routers.upolujksiazke-assets.middlewares=upolujksiazke-assets-compress"
      ]

      check {
        name = "upolujksiazke-assets-check"
        type = "tcp"
        interval = "6s"
        timeout = "4s"
      }
    }
  }
}
