job "upolujksiazke-site" {
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
        image = "nginx:latest"
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
              alias /data/upolujksiazke/cdn;
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
        "traefik.http.routers.upolujksiazke-assets.rule=Host(`upolujksiazke.pl`) && (PathPrefix(`/cdn`) || PathPrefix(`/sitemaps))",
        "traefik.http.routers.upolujksiazke-assets.entrypoints=http,https",
        "traefik.http.routers.upolujksiazke-assets.tls=true",
        "traefik.http.routers.upolujksiazke-assets.tls.certresolver=https-resolver",
        "traefik.http.routers.upolujksiazke-assets.tls.domains[0].main=upolujksiazke.pl"
      ]
    }
  }

  group "upolujksiazke-site" {
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

    service {
      name = "upolujksiazke-front"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.upolujksiazke-front.rule=Host(`upolujksiazke.pl`)",
        "traefik.http.routers.upolujksiazke-front.entrypoints=http,https",
        "traefik.http.routers.upolujksiazke-front.tls=true",
        "traefik.http.routers.upolujksiazke-front.tls.certresolver=https-resolver",
        "traefik.http.routers.upolujksiazke-front.tls.domains[0].main=upolujksiazke.pl"
      ]

      check {
        name = "upolujksiazke-front-check"
        type = "http"
        path     = "/"
        interval = "6s"
        timeout = "4s"
      }
    }

    task "upolujksiazke-front" {
      driver = "docker"

      vault {
        policies  = ["site-policy"]
      }

      config {
        image = "docker-registry.service.consul:5000/upolujksiazke-front"
        ports = ["http"]

        volumes = [
          "secrets/app.envs:/etc/app.envs"
        ]
      }

      volume_mount {
        volume      = "app-data"
        destination = "/data"
        read_only   = false
      }

      template {
        destination = "secrets/app.envs"

        data = <<EOF
          DB_HOST=postgres.service.consul
          REDIS_HOST=redis.service.consul
          ES_HOST=elasticsearch.service.consul

          {{ with secret "kv-v2/site/upolujksiazke" }}
            DB_NAME={{ .Data.data.DB_NAME }}
            DB_PASS={{ .Data.data.DB_PASS }}
            DB_USER={{ .Data.data.DB_USER }}
            JWT_EXPIRE_IN_SECONDS={{ .Data.data.JWT_EXPIRE_IN_SECONDS }}
            JWT_SECRET={{ .Data.data.JWT_SECRET }}
            CDN_PUBLIC_URL={{ .Data.data.CDN_PUBLIC_URL }}
            WYKOP_ACCOUNT_KEY={{ .Data.data.WYKOP_ACCOUNT_KEY }}
            WYKOP_ACCOUNT_NAME={{ .Data.data.WYKOP_ACCOUNT_NAME }}
            WYKOP_KEY={{ .Data.data.WYKOP_KEY }}
            WYKOP_SECRET={{ .Data.data.WYKOP_SECRET }}
          {{ end }}
        EOF
      }

      resources {
        cpu    = 1200
        memory = 1200
      }
    }
  }
}
