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
